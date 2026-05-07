const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const defaultRequestsPath = path.join(root, 'docs', 'import-data', 'restaurant-data-generator', 'requests.json');
const defaultOutputRoot = path.join(root, 'docs', 'import-data', 'imports', 'generated', 'restaurant-data-generator');

function parseArgs(argv) {
  const args = {
    requests: defaultRequestsPath,
    outputRoot: defaultOutputRoot,
    keySource: process.env.GOOGLE_MAPS_API_KEY ? 'env' : 'android',
    once: true,
    intervalMs: 10 * 60 * 1000,
    downloadPhotos: true,
  };

  for(let index = 0; index < argv.length; index++) {
    const token = argv[index];
    const next = argv[index + 1];
    if(token == '--requests') args.requests = path.resolve(next), index++;
    else if(token == '--output-root') args.outputRoot = path.resolve(next), index++;
    else if(token == '--key-source') args.keySource = next, index++;
    else if(token == '--watch') args.once = false;
    else if(token == '--once') args.once = true;
    else if(token == '--interval-ms') args.intervalMs = Number(next), index++;
    else if(token == '--no-photos') args.downloadPhotos = false;
    else if(token == '--help') {
      printHelp();
      process.exit(0);
    }
  }

  if(!Number.isInteger(args.intervalMs) || args.intervalMs < 5000) {
    throw new Error('--interval-ms must be at least 5000.');
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node Utilities/restaurant-data-generator.js --once
  node Utilities/restaurant-data-generator.js --watch --interval-ms 600000

Request file:
  docs/import-data/restaurant-data-generator/requests.json

Each pending request should contain:
  id, city, state, country, query, limit, status

Statuses:
  pending -> running -> complete
  failed requests can be set back to pending and rerun.
`);
}

function readRequests(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if(!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ requests: [] }, null, 2), 'utf8');
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if(!Array.isArray(data.requests)) throw new Error('Request file must contain a requests array.');
  return data;
}

function writeRequests(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function slug(value) {
  return String(value ?? 'request')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'request';
}

function requestQuery(request) {
  if(request.query) return request.query;
  return ['restaurants in', request.city, request.state, request.country].filter(Boolean).join(' ');
}

function processRequest(request, args) {
  const id = slug(request.id || `${request.city}-${request.state}`);
  const outputDir = path.join(args.outputRoot, id);
  const photoDir = path.join(outputDir, 'images');
  const csvPath = path.join(outputDir, `${id}-restaurants.csv`);
  const limit = Number(request.limit || 100);

  fs.mkdirSync(outputDir, { recursive: true });

  const commandArgs = [
    path.join(__dirname, 'dingit-importer.js'),
    '--query', requestQuery(request),
    '--limit', String(limit),
    '--out', csvPath,
    '--key-source', request.keySource || args.keySource,
    '--photo-dir', photoDir,
  ];
  if(args.downloadPhotos && request.downloadPhotos !== false) commandArgs.push('--download-photos');

  const result = spawnSync(process.execPath, commandArgs, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if(result.status !== 0) {
    const message = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    throw new Error(message || `Generator exited with status ${result.status}`);
  }

  return {
    outputCsv: path.relative(root, csvPath),
    photoDir: path.relative(root, photoDir),
    generatedAt: new Date().toISOString(),
    log: [result.stdout, result.stderr].filter(Boolean).join('\n').trim(),
  };
}

async function runCycle(args) {
  const data = readRequests(args.requests);
  let changed = false;
  const pending = data.requests.filter((request) => request.status === 'pending');

  if(pending.length === 0) {
    console.log('No pending restaurant data requests.');
    return;
  }

  for(const request of pending) {
    request.status = 'running';
    request.startedAt = new Date().toISOString();
    request.error = undefined;
    changed = true;
    writeRequests(args.requests, data);

    try {
      console.log(`Generating restaurant data for ${request.id || requestQuery(request)}...`);
      const output = processRequest(request, args);
      request.status = 'complete';
      request.completedAt = new Date().toISOString();
      request.outputCsv = output.outputCsv;
      request.photoDir = output.photoDir;
      request.generatedAt = output.generatedAt;
      request.lastLog = output.log.split('\n').slice(-12).join('\n');
      console.log(`Completed ${request.id}: ${output.outputCsv}`);
    } catch(error) {
      request.status = 'failed';
      request.failedAt = new Date().toISOString();
      request.error = error.message;
      console.error(`Failed ${request.id || requestQuery(request)}: ${error.message}`);
    } finally {
      changed = true;
      writeRequests(args.requests, data);
    }
  }

  if(changed) writeRequests(args.requests, data);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  do {
    await runCycle(args);
    if(args.once) break;
    await delay(args.intervalMs);
  } while(true);
}

run().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
