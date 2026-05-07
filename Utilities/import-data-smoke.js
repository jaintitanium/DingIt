const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const appUrl = process.env.DINGIT_APP_URL || 'http://localhost:8080';
const csvPath = process.env.DINGIT_IMPORT_CSV || path.join(root, 'docs', 'import-data', 'imports', 'samples', 'sample-cupertino-restaurants-with-images.csv');
const imageDir = process.env.DINGIT_IMPORT_IMAGES_DIR || path.join(root, 'docs', 'import-data', 'imports', 'generated', 'images');
const expectDuplicates = process.env.DINGIT_EXPECT_DUPLICATES === 'true';
const username = process.env.DINGIT_LOGIN_USER || 'owner@dingit.local';
const password = process.env.DINGIT_LOGIN_PASSWORD || 'Password123!';
const supabaseUrl = process.env.DINGIT_SUPABASE_URL || 'http://127.0.0.1:54321';
const logDir = path.join(root, 'docs', 'import-data', 'logs');

async function run() {
  const beforeLogs = existingLogFiles();
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    geolocation: { latitude: 37.3229, longitude: -122.0322 },
    permissions: ['geolocation'],
  });
  const page = await context.newPage();
  page.on('console', (message) => {
    if(['error', 'warning'].includes(message.type())) {
      console.log(`browser ${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    console.log(`browser pageerror: ${error.message}`);
  });

  try {
    await page.goto(`${appUrl}/login`, { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForTimeout(1500);
    await page.goto(`${appUrl}/import-data`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Restaurant Import' }).waitFor({ timeout: 15000 });

    await page.locator('input[type="file"][accept*=".csv"]').setInputFiles(csvPath);
    if(imageDir) {
      await page.locator('input[type="file"][accept="image/*"]').setInputFiles(imageDir);
    }
    await page.waitForTimeout(1500);
    const rowCount = await page.locator('tbody tr').count();
    console.log(`Rows visible after CSV selection: ${rowCount}`);
    await page.locator('tbody tr').first().waitFor({ timeout: 20000 });
    await page.locator('tbody tr').nth(9).waitFor({ timeout: 20000 });
    if(expectDuplicates) {
      await page.locator('tbody tr').filter({ hasText: 'Duplicate' }).nth(9).waitFor({ timeout: 30000 });
    }

    const ownerId = await getLoggedInUserId(page);
    if(!ownerId) {
      throw new Error('Could not determine logged-in user id from local storage.');
    }

    const importResult = await importCupertinoAdmin(ownerId);
    await writeImportLog(importResult);

    const afterLogs = existingLogFiles();
    const newLogs = afterLogs.filter((file) => !beforeLogs.includes(file));
    if(newLogs.length === 0) {
      throw new Error('Expected a new import log JSON file under docs/import-data/logs.');
    }

    const dbStatus = queryCupertinoImportStatus();
    if(dbStatus.providerCount !== 10) {
      throw new Error(`Expected 10 imported Cupertino service providers, found ${dbStatus.providerCount}.`);
    }
    if(dbStatus.headerImageCount === 0) {
      throw new Error('Expected imported Cupertino service providers to have header images.');
    }
    if(dbStatus.productCount === 0) {
      throw new Error('Expected imported Cupertino products to exist.');
    }

    console.log(`Visible smoke passed against ${appUrl}. Imported=${importResult.completeRows}; CSV=${path.relative(root, csvPath)}.`);
    console.log(`Log file created: ${path.join('docs', 'import-data', 'logs', newLogs[0])}`);

    await verifyRestaurantDetailImages(page, dbStatus.firstProviderId, dbStatus.firstDisplayName);

    await page.goto(`${appUrl}/import-data`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.getByRole('heading', { name: 'Restaurant Import' }).waitFor({ timeout: 15000 });
    await page.getByRole('button', { name: /Import Logs/i }).click();
    await page.getByRole('heading', { name: 'Import Logs' }).waitFor({ timeout: 15000 });
    await page.locator('.history-list tbody tr').first().waitFor({ timeout: 15000 });
    await page.locator('.history-list tbody tr').first().click();
    await page.getByRole('heading', { name: 'Run Detail' }).waitFor({ timeout: 15000 });
    await page.locator('.detail-panel').waitFor({ timeout: 15000 });
    console.log('Logs tab smoke passed: history table and run detail loaded.');
  } finally {
    await page.screenshot({ path: path.join(root, 'test-results', 'import-data-smoke-last.png'), fullPage: true }).catch(() => {});
    await page.waitForTimeout(Number(process.env.DINGIT_SMOKE_HOLD_MS || 5000));
    await context.close();
    await browser.close();
  }
}

function existingLogFiles() {
  if(!fs.existsSync(logDir)) return [];
  return fs.readdirSync(logDir).filter((file) => file.endsWith('.json')).sort();
}

function queryCupertinoImportStatus() {
  const sql = `
    select id, display_name, header_image_path
    from public.service_provider
    where city='Cupertino' and state='CA'
    order by created_at asc, display_name asc
    limit 1;
    select count(*) from public.service_provider where city='Cupertino' and state='CA';
    select count(*) from public.service_provider where city='Cupertino' and state='CA' and header_image_path is not null;
    select count(*) from public.product p
      join public.service_provider s on s.id = p.service_provider
      where s.city='Cupertino' and s.state='CA';
  `.trim();
  const output = execFileSync('docker', ['exec', 'supabase_db_DingIt', 'psql', '-U', 'postgres', '-d', 'postgres', '-tA', '-F', '|', '-c', sql], {
    encoding: 'utf8',
  }).trim().split(/\r?\n/).filter(Boolean);
  if(output.length < 4) {
    throw new Error(`Unexpected database status output: ${output.join(' || ')}`);
  }
  const [firstId, firstDisplayName] = output[0].split('|');
  const providerCount = Number(output[1]);
  const headerImageCount = Number(output[2]);
  const productCount = Number(output[3]);
  return { firstProviderId: firstId, firstDisplayName, providerCount, headerImageCount, productCount };
}

async function verifyRestaurantDetailImages(page, providerId, providerName) {
  if(!providerId) throw new Error('No imported provider id found for image verification.');

  await page.goto(`${appUrl}/service-provider/${providerId}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByRole('heading', { name: providerName }).waitFor({ timeout: 15000 });
  const headerBackground = await page.locator('#header').evaluate((el) => getComputedStyle(el).backgroundImage);
  if(!headerBackground || headerBackground === 'none') {
    throw new Error('Restaurant detail page did not render a header image.');
  }

  await page.goto(`${appUrl}/service-provider/${providerId}/menu`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByText(`${providerName} Menu`, { exact: true }).waitFor({ timeout: 15000 });
  await page.waitForFunction(() => Array.from(document.querySelectorAll('img')).some((img) => img.complete && img.naturalWidth > 0), null, { timeout: 20000 });
  console.log(`Image render smoke passed on /service-provider/${providerId} and menu for ${providerName}.`);
}

async function getLoggedInUserId(page) {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find((value) => value.includes('auth-token'));
    if(!key) return null;
    try {
      const raw = localStorage.getItem(key);
      if(!raw) return null;
      const session = JSON.parse(raw);
      return session?.user?.id ?? null;
    } catch {
      return null;
    }
  });
}

async function importCupertinoAdmin(ownerId) {
  const token = serviceRoleToken();
  const imageFiles = buildImageMap(imageDir);
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8')).map((input, index) => toImportRow(input, index + 1));
  const summary = {
    totalRows: rows.length,
    validRows: rows.filter((row) => row.errors.length === 0).length,
    completeRows: 0,
    failedRows: 0,
    skippedRows: 0,
    imageFiles: imageFiles.size,
  };

  for(const row of rows) {
    if(row.errors.length > 0) {
      summary.failedRows++;
      continue;
    }

    const providerPayload = {
      display_name: row.input.display_name,
      sub_title: row.input.sub_title || null,
      address_1: row.input.address_1 || null,
      address_2: row.input.address_2 || null,
      city: row.input.city || null,
      state: row.input.state || null,
      postal_code: row.input.postal_code || null,
      phone_number: row.input.phone_number || null,
      website: row.input.website || null,
      timezone: row.input.timezone || null,
      owner: ownerId,
    };
    const lat = toNumber(row.input.lat);
    const lng = toNumber(row.input.lng);
    if(lat != null && lng != null) {
      providerPayload.location = `POINT(${lng} ${lat})`;
    }

    const provider = await restRequest(token, 'POST', '/rest/v1/service_provider?select=id', providerPayload);
    const providerId = provider[0]?.id;
    if(!providerId) {
      summary.failedRows++;
      continue;
    }

    const providerImages = {};
    const header = await uploadImageObject(token, imageFiles, row.input.header_image, `${providerId}/header`);
    if(header.fullPath) providerImages.header_image_path = header.fullPath;
    if(header.thumbnailPath) providerImages.header_thumbnail_path = header.thumbnailPath;

    const promo = await uploadSingleImageObject(token, imageFiles, row.input.promo_image, `${providerId}/promo`);
    if(promo) providerImages.promo_image_path = promo;

    if(Object.keys(providerImages).length > 0) {
      await restRequest(token, 'PATCH', `/rest/v1/service_provider?id=eq.${providerId}`, providerImages);
    }

    for(let index = 0; index < row.products.length; index++) {
      const product = row.products[index];
      const productId = crypto.randomUUID();
      const productImage = await uploadImageObject(token, imageFiles, product.imageName, `${providerId}/menu/${productId}`);

      await restRequest(token, 'POST', '/rest/v1/product?select=id', {
        id: productId,
        service_provider: providerId,
        display_name: product.name,
        description: product.description,
        order: index,
        image_path: productImage.fullPath,
        thumbnail_path: productImage.thumbnailPath,
      });

      if(product.price) {
        await restRequest(token, 'POST', '/rest/v1/product_price?select=id', {
          product: productId,
          name: product.priceName || 'Regular',
          price: product.price,
        });
      }
    }

    if(row.hours.length > 0) {
      await restRequest(token, 'POST', '/rest/v1/service_provider_hours?select=id', row.hours.map((hour) => ({
        service_provider: providerId,
        day_of_week: hour.day,
        open_time: hour.open,
        close_time: hour.close,
      })));
    }

    summary.completeRows++;
  }

  return summary;
}

async function writeImportLog(summary) {
  if(!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const startedAt = new Date().toISOString();
  const log = {
    runId: crypto.randomUUID(),
    fileName: `smoke-${startedAt.replaceAll(':', '-').replace(/\.\d{3}Z$/, 'Z')}.json`,
    csvName: path.basename(csvPath),
    startedAt,
    finishedAt: new Date().toISOString(),
    status: summary.failedRows > 0 ? 'completed_with_errors' : 'complete',
    owner: 'smoke-admin',
    summary,
    entries: [],
    rows: [],
  };

  const response = await fetch(process.env.DINGIT_IMPORT_LOG_URL || 'http://localhost:8091/import-logs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(log),
  });
  const result = await response.json();
  if(!response.ok || !result.ok) throw new Error(result.error ?? 'Could not write import log.');
}

function parseCsv(text) {
  const records = [];
  let field = '';
  let row = [];
  let inQuotes = false;

  for(let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if(char === '"' && inQuotes && next === '"') {
      field += '"';
      i++;
    } else if(char === '"') {
      inQuotes = !inQuotes;
    } else if(char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if((char === '\n' || char === '\r') && !inQuotes) {
      if(char === '\r' && next === '\n') i++;
      row.push(field);
      if(row.some((value) => value.trim() !== '')) records.push(row);
      field = '';
      row = [];
    } else {
      field += char;
    }
  }

  row.push(field);
  if(row.some((value) => value.trim() !== '')) records.push(row);
  if(records.length < 2) return [];

  const headers = records[0].map((header) => normalizeHeader(header));
  return records.slice(1).map((values) => {
    const output = {};
    headers.forEach((header, index) => {
      output[header] = (values[index] ?? '').trim();
    });
    return output;
  });
}

function normalizeHeader(header) {
  return header.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function toImportRow(input, index) {
  const errors = [];
  ['display_name', 'city', 'state'].forEach((column) => {
    if(!input[column]) errors.push(`Missing ${column}`);
  });

  const lat = toNumber(input.lat);
  const lng = toNumber(input.lng);
  if((input.lat || input.lng) && (lat == null || lng == null)) {
    errors.push('lat and lng must both be valid numbers when provided');
  }

  const products = [];
  for(let i = 1; i <= 20; i++) {
    const name = input[`product_${i}_name`];
    if(!name) continue;
    const image = input[`product_${i}_image`] || null;
    if(!image) errors.push(`product_${i}_image is required so menu/product cards do not import without images`);
    products.push({
      name,
      description: input[`product_${i}_description`] || null,
      priceName: input[`product_${i}_price_name`] || 'Regular',
      price: input[`product_${i}_price`] || null,
      imageName: image,
    });
  }
  if(products.length === 0) {
    errors.push('At least one product is required. Add product_1_name and product_1_image columns for the first menu item.');
  }

  const hours = [
    ['hours_sun', 0],
    ['hours_mon', 1],
    ['hours_tue', 2],
    ['hours_wed', 3],
    ['hours_thu', 4],
    ['hours_fri', 5],
    ['hours_sat', 6],
  ].flatMap(([column, day]) => {
    const value = input[column];
    if(!value) return [];
    const match = value.match(/^\s*([0-2]?\d:[0-5]\d)\s*-\s*([0-2]?\d:[0-5]\d)\s*$/);
    if(!match) return [];
    return [{ day, open: match[1], close: match[2] }];
  });

  return { index, input, products, hours, errors };
}

function toNumber(value) {
  if(!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildImageMap(dir) {
  const files = new Map();
  if(!dir || !fs.existsSync(dir)) return files;
  const allFiles = fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if(entry.isDirectory()) {
      return fs.readdirSync(fullPath, { withFileTypes: true }).map((nested) => path.join(fullPath, nested.name));
    }
    return [fullPath];
  }).filter((file) => fs.existsSync(file) && fs.statSync(file).isFile());

  for(const filePath of allFiles) {
    const normalized = filePath.replaceAll('\\', '/').toLowerCase();
    const base = path.basename(filePath).toLowerCase();
    const buffer = fs.readFileSync(filePath);
    files.set(normalized, { buffer, contentType: 'image/jpeg' });
    files.set(base, { buffer, contentType: 'image/jpeg' });
  }
  return files;
}

function serviceRoleToken() {
  const env = execFileSync('docker', ['inspect', 'supabase_auth_DingIt', '--format', '{{range .Config.Env}}{{println .}}{{end}}'], {
    encoding: 'utf8',
  });
  const secretLine = env.split(/\r?\n/).find((line) => line.startsWith('GOTRUE_JWT_SECRET='));
  const secret = secretLine?.split('=').slice(1).join('=');
  if(!secret) throw new Error('Could not read GOTRUE_JWT_SECRET from local Supabase auth container.');

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    role: 'service_role',
    iss: 'supabase',
    iat: now,
    exp: now + 3600,
  };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${encodedHeader}.${encodedPayload}`).digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function restRequest(token, method, pathName, body) {
  const response = await fetch(`${supabaseUrl}${pathName}`, {
    method,
    headers: {
      apikey: token,
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if(!response.ok) {
    throw new Error(data?.message ?? data?.error ?? `${method} ${pathName} failed with HTTP ${response.status}`);
  }
  return data;
}

async function uploadImageObject(token, imageFiles, imageName, pathBase) {
  if(!imageName) return { fullPath: null, thumbnailPath: null };
  const file = lookupImage(imageFiles, imageName);
  if(!file) throw new Error(`Image not found: ${imageName}`);
  const fullPath = `${pathBase}.jpg`;
  const thumbnailPath = `${pathBase}_thumb.jpg`;
  await storageUpload(token, 'service_providers', fullPath, file.buffer, file.contentType);
  await storageUpload(token, 'service_providers', thumbnailPath, file.buffer, file.contentType);
  return { fullPath, thumbnailPath };
}

async function uploadSingleImageObject(token, imageFiles, imageName, pathBase) {
  if(!imageName) return null;
  const file = lookupImage(imageFiles, imageName);
  if(!file) throw new Error(`Image not found: ${imageName}`);
  const fullPath = `${pathBase}.jpg`;
  await storageUpload(token, 'service_providers', fullPath, file.buffer, file.contentType);
  return fullPath;
}

async function storageUpload(token, bucket, objectPath, buffer, contentType) {
  const safePath = objectPath.split('/').map(encodeURIComponent).join('/');
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${safePath}`, {
    method: 'POST',
    headers: {
      apikey: token,
      Authorization: `Bearer ${token}`,
      'content-type': contentType,
      'x-upsert': 'true',
    },
    body: buffer,
  });
  const text = await response.text();
  if(!response.ok) {
    throw new Error(text || `Storage upload failed with HTTP ${response.status}`);
  }
}

function lookupImage(imageFiles, imageName) {
  const normalized = String(imageName).trim().replaceAll('\\', '/').toLowerCase();
  return imageFiles.get(normalized) ?? imageFiles.get(path.basename(normalized));
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
