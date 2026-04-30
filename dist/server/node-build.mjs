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

// ---- Sitemap.xml — generated from Supabase ---------------------------------
const SITE_URL = process.env.PUBLIC_SITE_URL || 'https://testiranje.cloud';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const STATIC_PATHS = [
  '/', '/pretraga', '/za-partnere', '/kontakt', '/privatnost', '/uvjeti-koristenja',
];
const CATEGORY_SLUGS = [
  'osobni-automobili','motocikli','bicikli-romobili','kombiji-laki-teretni',
  'kamioni-teretna','strojevi','kamperi-karavani','plovila-nautika',
  'dijelovi-oprema','usluge',
];

let _sitemapCache = { body: '', ts: 0 };
const SITEMAP_TTL_MS = 60 * 60 * 1000; // 1 hour

async function buildSitemap() {
  const now = Date.now();
  if (_sitemapCache.body && now - _sitemapCache.ts < SITEMAP_TTL_MS) return _sitemapCache.body;

  const urls = [];
  // Static pages
  for (const p of STATIC_PATHS) urls.push({ loc: `${SITE_URL}${p}`, priority: p === '/' ? 1.0 : 0.6 });
  // Category pages
  for (const c of CATEGORY_SLUGS) urls.push({ loc: `${SITE_URL}/${c}`, priority: 0.8 });

  // Listings — fetch from Supabase REST if env is configured
  if (SUPABASE_URL && SUPABASE_ANON) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/listings?select=id,updated_at,status&status=eq.active&order=updated_at.desc&limit=1000`, {
        headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
      });
      if (r.ok) {
        const rows = await r.json();
        for (const row of rows) {
          urls.push({
            loc: `${SITE_URL}/listing/${row.id}`,
            lastmod: row.updated_at,
            priority: 0.9,
          });
        }
      }
    } catch { /* skip listing inclusion if Supabase fails */ }
  }

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const u of urls) {
    xml += `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n`;
    if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    if (u.priority) xml += `    <priority>${u.priority.toFixed(1)}</priority>\n`;
    xml += '  </url>\n';
  }
  xml += '</urlset>\n';
  _sitemapCache = { body: xml, ts: now };
  return xml;
}

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]);
}

async function handleSitemap(_req, res) {
  try {
    const body = await buildSitemap();
    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
    res.end(body);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Sitemap error');
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
    if (url.pathname === '/sitemap.xml') return handleSitemap(req, res);

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
