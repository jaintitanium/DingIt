const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'app', 'src', 'app', 'services', 'location-helper.service.ts');

const columns = [
  'display_name',
  'sub_title',
  'address_1',
  'address_2',
  'city',
  'state',
  'postal_code',
  'phone_number',
  'website',
  'timezone',
  'lat',
  'lng',
  'header_image',
  'promo_image',
  'hours_mon',
  'hours_tue',
  'hours_wed',
  'hours_thu',
  'hours_fri',
  'hours_sat',
  'hours_sun',
  'product_1_name',
  'product_1_description',
  'product_1_price_name',
  'product_1_price',
  'product_1_image',
  'product_2_name',
  'product_2_description',
  'product_2_price_name',
  'product_2_price',
  'product_2_image',
];

function parseArgs(argv) {
  const args = {
    query: 'restaurants in Cupertino CA',
    limit: 10,
    out: path.join(root, 'docs', 'import-data', 'imports', 'generated', 'google-cupertino-restaurants.csv'),
    keySource: process.env.GOOGLE_MAPS_API_KEY ? 'env' : 'android',
    timezone: 'America/Los_Angeles',
    downloadPhotos: false,
    photoDir: path.join(root, 'docs', 'import-data', 'imports', 'generated', 'images'),
  };

  for(let index = 0; index < argv.length; index++) {
    const token = argv[index];
    const next = argv[index + 1];
    if(token == '--query') args.query = next, index++;
    else if(token == '--limit') args.limit = Number(next), index++;
    else if(token == '--out') args.out = path.resolve(next), index++;
    else if(token == '--key-source') args.keySource = next, index++;
    else if(token == '--timezone') args.timezone = next, index++;
    else if(token == '--photo-dir') args.photoDir = path.resolve(next), index++;
    else if(token == '--download-photos') args.downloadPhotos = true;
    else if(token == '--help') {
      printHelp();
      process.exit(0);
    }
  }

  if(!Number.isInteger(args.limit) || args.limit < 1) {
    throw new Error('--limit must be a positive integer.');
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node Utilities/dingit-importer.js --query "restaurants in Cupertino CA" --limit 10 --out docs/import-data/imports/generated/google-cupertino-restaurants.csv

Options:
  --query            Google Places text search query.
  --limit            Max restaurants to write.
  --out              Output CSV path.
  --key-source       env, android, iosAutocomplete, iosMaps, or web.
  --timezone         Timezone written to CSV rows.
  --download-photos  Download first available Google Place photos into --photo-dir.
  --photo-dir        Directory for downloaded images.
`);
}

function readKnownKeys() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const matches = [...source.matchAll(/AIza[0-9A-Za-z_-]+/g)].map((match) => match[0]);
  return {
    android: matches[0],
    iosAutocomplete: matches[1],
    iosMaps: matches[2],
    web: matches[3],
  };
}

function getKey(keySource) {
  if(keySource == 'env') {
    if(!process.env.GOOGLE_MAPS_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY is not set.');
    return process.env.GOOGLE_MAPS_API_KEY;
  }

  const known = readKnownKeys();
  if(!known[keySource]) throw new Error(`Unknown or missing key source: ${keySource}`);
  return known[keySource];
}

function redact(value) {
  return String(value ?? '').replace(/AIza[0-9A-Za-z_-]+/g, '[redacted]');
}

async function googleJson(url) {
  const response = await fetch(url);
  const json = await response.json();
  if(!response.ok || (json.status && json.status != 'OK' && json.status != 'ZERO_RESULTS')) {
    throw new Error(`${json.status ?? response.status}: ${redact(json.error_message ?? response.statusText)}`);
  }
  return json;
}

async function searchPlaces(key, query, limit) {
  const places = [];
  let pageToken = null;

  while(places.length < limit) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', query);
    url.searchParams.set('key', key);
    if(pageToken) {
      await delay(2200);
      url.searchParams.set('pagetoken', pageToken);
    }

    const response = await googleJson(url);
    places.push(...(response.results ?? []));
    pageToken = response.next_page_token;
    if(!pageToken || places.length >= limit) break;
  }

  const seen = new Set();
  return places.filter((place) => {
    if(!place.place_id || seen.has(place.place_id)) return false;
    seen.add(place.place_id);
    return true;
  }).slice(0, limit);
}

async function getDetails(key, placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', [
    'place_id',
    'name',
    'formatted_address',
    'formatted_phone_number',
    'website',
    'geometry',
    'address_components',
    'opening_hours',
    'types',
    'photos',
  ].join(','));
  url.searchParams.set('key', key);
  const response = await googleJson(url);
  return response.result;
}

async function downloadPhoto(key, photo, outPath) {
  if(!photo?.photo_reference) return false;
  const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
  url.searchParams.set('maxwidth', '1600');
  url.searchParams.set('photo_reference', photo.photo_reference);
  url.searchParams.set('key', key);

  const response = await fetch(url);
  if(!response.ok) throw new Error(`Photo download failed: ${response.status} ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);
  return true;
}

function toDingItRow(place, args, photoPaths) {
  const components = componentsByType(place.address_components ?? []);
  const street = [short(components.street_number), short(components.route)].filter(Boolean).join(' ');
  const city = long(components.locality) || long(components.sublocality) || long(components.administrative_area_level_2);
  const state = short(components.administrative_area_level_1);
  const postal = long(components.postal_code);
  const hours = hoursByDay(place.opening_hours?.periods ?? []);
  const location = place.geometry?.location ?? {};

  return {
    display_name: place.name ?? '',
    sub_title: formatTypes(place.types ?? []),
    address_1: street || place.formatted_address || '',
    address_2: '',
    city: city ?? '',
    state: state ?? '',
    postal_code: postal ?? '',
    phone_number: place.formatted_phone_number ?? '',
    website: place.website ?? '',
    timezone: args.timezone,
    lat: location.lat ?? '',
    lng: location.lng ?? '',
    header_image: photoPaths.header ?? '',
    promo_image: photoPaths.promo ?? '',
    hours_mon: hours[1] ?? '',
    hours_tue: hours[2] ?? '',
    hours_wed: hours[3] ?? '',
    hours_thu: hours[4] ?? '',
    hours_fri: hours[5] ?? '',
    hours_sat: hours[6] ?? '',
    hours_sun: hours[0] ?? '',
    product_1_name: '',
    product_1_description: '',
    product_1_price_name: '',
    product_1_price: '',
    product_1_image: '',
    product_2_name: '',
    product_2_description: '',
    product_2_price_name: '',
    product_2_price: '',
    product_2_image: '',
  };
}

function componentsByType(components) {
  const output = {};
  for(const component of components) {
    for(const type of component.types ?? []) {
      output[type] = component;
    }
  }
  return output;
}

function short(component) {
  return component?.short_name ?? '';
}

function long(component) {
  return component?.long_name ?? '';
}

function formatTypes(types) {
  return types
    .filter((type) => !['point_of_interest', 'establishment', 'food'].includes(type))
    .slice(0, 3)
    .map((type) => type.replaceAll('_', ' '))
    .join(', ');
}

function hoursByDay(periods) {
  const output = {};
  for(const period of periods) {
    if(period.open?.day == null || !period.close) continue;
    output[period.open.day] = `${formatTime(period.open.time)}-${formatTime(period.close.time)}`;
  }
  return output;
}

function formatTime(value) {
  if(!value || value.length != 4) return '';
  return `${value.slice(0, 2)}:${value.slice(2)}`;
}

function slugify(value) {
  return String(value ?? 'restaurant')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'restaurant';
}

function csvEscape(value) {
  const text = String(value ?? '');
  if(/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function toCsv(rows) {
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
  ].join('\n') + '\n';
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const key = getKey(args.keySource);

  console.log(`Searching Google Places for "${args.query}" using key source "${args.keySource}".`);
  const searchResults = await searchPlaces(key, args.query, args.limit);
  console.log(`Found ${searchResults.length} candidate restaurants. Fetching details...`);

  const rows = [];
  for(let index = 0; index < searchResults.length; index++) {
    const place = await getDetails(key, searchResults[index].place_id);
    const slug = slugify(place.name);
    const photoPaths = {};

    if(args.downloadPhotos) {
      console.warn('Downloading Google Place photos. Confirm reuse rights and Google terms before importing these into customer or production data.');
      const photos = place.photos ?? [];
      const headerRel = `images/${slug}-header.jpg`;
      const promoRel = `images/${slug}-promo.jpg`;
      if(await downloadPhoto(key, photos[0], path.join(args.photoDir, `${slug}-header.jpg`))) photoPaths.header = headerRel;
      if(await downloadPhoto(key, photos[1] ?? photos[0], path.join(args.photoDir, `${slug}-promo.jpg`))) photoPaths.promo = promoRel;
    }

    rows.push(toDingItRow(place, args, photoPaths));
    console.log(`${index + 1}/${searchResults.length}: ${place.name}`);
  }

  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, toCsv(rows), 'utf8');
  console.log(`Wrote ${rows.length} rows to ${path.relative(root, args.out)}`);
}

run().catch((error) => {
  console.error(redact(error.stack || error.message));
  process.exitCode = 1;
});
