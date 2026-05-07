const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const logDir = process.env.DINGIT_IMPORT_LOG_DIR || path.join(root, 'docs', 'import-data', 'logs');
const port = Number(process.env.DINGIT_IMPORT_LOG_PORT || 8091);

function send(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  response.end(JSON.stringify(body));
}

function safeFileName(value) {
  const fileName = path.basename(String(value || ''));
  if(!/^[a-z0-9][a-z0-9._-]*\.json$/i.test(fileName)) {
    throw new Error('Invalid log file name.');
  }
  return fileName;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if(body.length > 10 * 1024 * 1024) {
        reject(new Error('Request body too large.'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function listLogs() {
  fs.mkdirSync(logDir, { recursive: true });
  return fs.readdirSync(logDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const fullPath = path.join(logDir, file);
      const stat = fs.statSync(fullPath);
      const data = readLogFile(file);
      return {
        fileName: file,
        path: path.relative(root, fullPath),
        bytes: stat.size,
        updatedAt: stat.mtime.toISOString(),
        runId: data?.runId ?? '',
        csvName: data?.csvName ?? '',
        startedAt: data?.startedAt ?? stat.birthtime.toISOString(),
        finishedAt: data?.finishedAt ?? '',
        status: data?.status ?? 'unknown',
        summary: data?.summary ?? {},
        errorCount: Array.isArray(data?.entries) ? data.entries.filter((entry) => entry.level === 'error').length : 0,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 50);
}

function readLogFile(fileName) {
  const safeName = safeFileName(fileName);
  const fullPath = path.resolve(path.join(logDir, safeName));
  const resolvedDir = path.resolve(logDir);
  if(!fullPath.startsWith(resolvedDir + path.sep)) {
    throw new Error('Unsafe log path.');
  }
  if(!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

const server = http.createServer(async (request, response) => {
  try {
    if(request.method === 'OPTIONS') {
      send(response, 204, {});
      return;
    }

    if(request.url === '/health') {
      send(response, 200, { ok: true, logDir: path.relative(root, logDir) });
      return;
    }

    if(request.url === '/import-logs' && request.method === 'GET') {
      send(response, 200, { logs: listLogs() });
      return;
    }

    if(request.method === 'GET' && request.url?.startsWith('/import-logs/')) {
      const fileName = decodeURIComponent(request.url.replace('/import-logs/', ''));
      const log = readLogFile(fileName);
      if(!log) {
        send(response, 404, { ok: false, error: 'Log not found' });
        return;
      }
      send(response, 200, { ok: true, log });
      return;
    }

    if(request.url === '/import-logs' && request.method === 'POST') {
      const payload = JSON.parse(await readBody(request));
      const fileName = safeFileName(payload.fileName);
      const fullPath = path.join(logDir, fileName);
      const resolved = path.resolve(fullPath);
      const resolvedDir = path.resolve(logDir);
      if(!resolved.startsWith(resolvedDir + path.sep)) {
        throw new Error('Unsafe log path.');
      }

      fs.mkdirSync(logDir, { recursive: true });
      fs.writeFileSync(resolved, JSON.stringify(payload, null, 2), 'utf8');
      send(response, 200, {
        ok: true,
        fileName,
        path: path.relative(root, resolved),
        bytes: fs.statSync(resolved).size,
      });
      return;
    }

    send(response, 404, { ok: false, error: 'Not found' });
  } catch(error) {
    send(response, 400, { ok: false, error: error.message });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`DingIt import log server listening on ${port}`);
  console.log(`Writing logs to ${logDir}`);
});
