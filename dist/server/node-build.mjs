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

// ---- API: Claude Haiku copywriter for listing descriptions -----------------
// POST /api/copywriter
// Body: { make, model, year, mileage, fuel, transmission, power_hp, body_type,
//         color, condition, equipment?: string[], language?: 'hr'|'en' }
// Returns: { description: string }
//
// Requires env ANTHROPIC_API_KEY. Without it the endpoint returns a clean
// 503 with a "configure ANTHROPIC_API_KEY" message so the UI can fall back.
async function handleCopywriter(req, res) {
  if (req.method !== 'POST') { res.writeHead(405).end(); return; }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured on server' }));
    return;
  }
  let body = '';
  for await (const chunk of req) body += chunk;
  let payload;
  try { payload = JSON.parse(body); }
  catch { res.writeHead(400).end('Bad JSON'); return; }

  const { make, model, year, mileage, fuel, transmission, power_hp, body_type, color, condition, equipment = [], language = 'hr' } = payload || {};
  const langInstr = language === 'en'
    ? 'Write the description in English.'
    : 'Napiši opis na hrvatskom jeziku, prirodnim tonom, bez markentinških klišeja.';

  const prompt = `${langInstr}

Vehicle facts:
- Make: ${make ?? '?'} | Model: ${model ?? '?'} | Year: ${year ?? '?'}
- Mileage: ${mileage ?? '?'} km | Fuel: ${fuel ?? '?'} | Transmission: ${transmission ?? '?'}
- Power: ${power_hp ?? '?'} HP | Body: ${body_type ?? '?'} | Color: ${color ?? '?'}
- Condition: ${condition ?? '?'}
- Equipment: ${equipment.join(', ') || '—'}

Write 3 short paragraphs (around 90-130 words total):
1. Hook line on what makes this vehicle worth attention.
2. Key technical highlights, written naturally, not as a bullet list.
3. Practical info (history, condition, location-friendly tone) and a soft CTA to schedule a viewing.

Do not invent facts. Do not use marketing fluff like "amazing" or "perfect".
Don't promise warranties. Use "EUR" not "€" inside running prose. No emojis.`;

  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!apiRes.ok) {
      const txt = await apiRes.text();
      res.writeHead(apiRes.status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Anthropic API error ${apiRes.status}`, detail: txt.slice(0, 400) }));
      return;
    }
    const data = await apiRes.json();
    const text = (data?.content || []).map(c => c?.text || '').join('').trim();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ description: text }));
  } catch (e) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Upstream Anthropic call failed', detail: String(e?.message || e) }));
  }
}

// ----------------------------------------------------------------------------

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // API routes
    if (url.pathname === '/api/copywriter') return handleCopywriter(req, res);
    if (url.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, ts: Date.now() }));
      return;
    }

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
