// Passenger Node startup file for testiranje.cloud
// Serves the Vite-built static SPA under client/dist/ with SPA fallback.
// Designed to be self-contained: works on bare Node 22 with zero dependencies.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// dist/server/node-build.mjs -> repo root is two levels up
const REPO_ROOT = resolve(__dirname, '..', '..');
const DIST_DIR = join(REPO_ROOT, 'client', 'dist');
const PORT = process.env.PORT || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

async function tryServe(res, filePath) {
  try {
    const s = await stat(filePath);
    if (!s.isFile()) return false;
    const data = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const type = MIME[ext] || 'application/octet-stream';
    const cacheable = ['.js', '.mjs', '.css', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.woff2', '.woff'].includes(ext);
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': cacheable ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(data);
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const safe = url.pathname.replace(/\.\.+/g, '').replace(/^\/+/, '');
    const direct = join(DIST_DIR, safe);
    if (await tryServe(res, direct)) return;
    // SPA fallback
    if (await tryServe(res, join(DIST_DIR, 'index.html'))) return;
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server error');
  }
});

server.listen(PORT, () => {
  console.log(`vozila SPA server listening on :${PORT}, root=${DIST_DIR}`);
});
