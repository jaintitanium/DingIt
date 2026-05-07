const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'app', 'src', 'app', 'services', 'location-helper.service.ts');

function readKnownKeys() {
  const source = fs.readFileSync(sourcePath, 'utf8');
  const matches = [...source.matchAll(/AIza[0-9A-Za-z_-]+/g)].map((match) => match[0]);
  const names = ['android', 'iosAutocomplete', 'iosMaps', 'web'];
  return names.map((name, index) => ({
    name,
    key: matches[index],
  })).filter((entry) => entry.key);
}

function redact(value) {
  return String(value ?? '').replace(/AIza[0-9A-Za-z_-]+/g, '[redacted]');
}

async function googleJson(url) {
  const response = await fetch(url);
  const json = await response.json();
  return {
    http: response.status,
    status: json.status ?? (response.ok ? 'OK' : 'HTTP_ERROR'),
    message: redact(json.error_message ?? ''),
    count: Array.isArray(json.results) ? json.results.length : undefined,
  };
}

async function googleScript(key) {
  const url = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
  const response = await fetch(url, {
    headers: {
      referer: 'http://localhost:8080/',
    },
  });
  const body = redact(await response.text());
  const match = body.match(/Google Maps JavaScript API error: ([^\s'"`]+)/);
  return {
    http: response.status,
    status: match ? match[1] : 'SCRIPT_RETURNED',
    message: match ? 'Maps JavaScript returned an API error.' : '',
  };
}

async function run() {
  const keys = readKnownKeys();
  if(process.env.GOOGLE_MAPS_API_KEY) {
    keys.unshift({ name: 'GOOGLE_MAPS_API_KEY', key: process.env.GOOGLE_MAPS_API_KEY });
  }

  const rows = [];
  for(const entry of keys) {
    const encoded = encodeURIComponent(entry.key);
    const checks = [
      {
        api: 'Geocoding API',
        run: () => googleJson(`https://maps.googleapis.com/maps/api/geocode/json?address=Cupertino%2C%20CA&key=${encoded}`),
      },
      {
        api: 'Places Text Search API',
        run: () => googleJson(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants%20in%20Cupertino%20CA&key=${encoded}`),
      },
      {
        api: 'Maps JavaScript + Places library',
        run: () => googleScript(entry.key),
      },
    ];

    for(const check of checks) {
      try {
        const result = await check.run();
        rows.push({
          keySource: entry.name,
          api: check.api,
          http: result.http,
          status: result.status,
          resultCount: result.count ?? '',
          message: result.message,
        });
      } catch(error) {
        rows.push({
          keySource: entry.name,
          api: check.api,
          http: 'ERROR',
          status: 'ERROR',
          resultCount: '',
          message: redact(error.message),
        });
      }
    }
  }

  console.table(rows);
}

run().catch((error) => {
  console.error(redact(error.stack || error.message));
  process.exitCode = 1;
});
