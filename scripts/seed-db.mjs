#!/usr/bin/env node
/**
 * Vozila.hr — Node seed runner.
 * Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from server/.env (and falls
 * back to client/.env's anon key for read-only smoke checks).
 *
 * Usage:  node scripts/seed-db.mjs
 *
 * Idempotent: skips listings whose title already exists.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = resolve(__dirname, '..');

// ----------------------------------------------------------------------------
// 1. Load env
// ----------------------------------------------------------------------------
function readEnvFile(p) {
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

const serverEnv = readEnvFile(resolve(ROOT, 'server/.env'));
const clientEnv = readEnvFile(resolve(ROOT, 'client/.env'));

const SUPABASE_URL =
  serverEnv.SUPABASE_URL ||
  clientEnv.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const SERVICE_KEY =
  serverEnv.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const ANON_KEY =
  clientEnv.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

const KEY = SERVICE_KEY || ANON_KEY;

if (!SUPABASE_URL || !KEY) {
  console.error('Nedostaju SUPABASE_URL ili SUPABASE_SERVICE_ROLE_KEY/anon key');
  process.exit(1);
}

console.log(`→ Supabase: ${SUPABASE_URL}`);
console.log(`→ Auth: ${SERVICE_KEY ? 'service_role' : 'anon (read-only fallback)'}`);

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ----------------------------------------------------------------------------
// 2. Load seed data — TS source compiled via dynamic import of dist or eval-fallback
// ----------------------------------------------------------------------------
async function loadSeed() {
  // Prefer compiled dist if available
  const distPath = resolve(ROOT, 'client/dist/lib/seedData.js');
  if (existsSync(distPath)) {
    return import(distPath);
  }
  // Fallback: parse the TS source by stripping `export const seedListings: ...`
  // and re-export from a tmp .mjs file. We use a simpler approach: read the
  // arrays directly by spawning tsx if available; otherwise rely on a JSON
  // mirror at scripts/seed-data.json (pre-generated below).
  const jsonPath = resolve(ROOT, 'scripts/seed-data.json');
  if (existsSync(jsonPath)) {
    const raw = JSON.parse(readFileSync(jsonPath, 'utf8'));
    return { seedListings: raw.seedListings, SEED_TOTALS: raw.SEED_TOTALS };
  }
  // As a last resort, spawn tsx to evaluate the TS file
  try {
    const { execSync } = await import('node:child_process');
    const out = execSync(
      `npx --yes tsx -e "import('${resolve(ROOT, 'client/src/lib/seedData.ts')}').then(m => process.stdout.write(JSON.stringify({seedListings: m.seedListings, SEED_TOTALS: m.SEED_TOTALS})))"`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], cwd: ROOT, maxBuffer: 50 * 1024 * 1024 }
    );
    return JSON.parse(out);
  } catch (e) {
    console.error('Ne mogu učitati seed podatke. Pokrenite npm run build u client/ ili instaliraj tsx.');
    throw e;
  }
}

// ----------------------------------------------------------------------------
// 3. Croatian city → (lat, lng)
// ----------------------------------------------------------------------------
const CITY_COORDS = {
  Zagreb:           [45.8150, 15.9819],
  Split:            [43.5081, 16.4402],
  Rijeka:           [45.3271, 14.4422],
  Osijek:           [45.5550, 18.6955],
  Zadar:            [44.1194, 15.2314],
  Pula:             [44.8666, 13.8496],
  'Slavonski Brod': [45.1603, 18.0150],
  Karlovac:         [45.4870, 15.5478],
  Varaždin:         [46.3056, 16.3360],
  Šibenik:          [43.7350, 15.8952],
  Sisak:            [45.4661, 16.3781],
  Dubrovnik:        [42.6507, 18.0944],
  Bjelovar:         [45.8989, 16.8423],
  Vinkovci:         [45.2890, 18.8059],
  Vukovar:          [45.3411, 18.9970],
  Koprivnica:       [46.1631, 16.8338],
  Požega:           [45.3404, 17.6850],
  Đakovo:           [45.3083, 18.4093],
  Čakovec:          [46.3844, 16.4344],
};

// ----------------------------------------------------------------------------
// 4. Run
// ----------------------------------------------------------------------------
async function main() {
  const { seedListings, SEED_TOTALS } = await loadSeed();
  console.log(`→ Loaded ${seedListings.length} seed listings`);
  if (SEED_TOTALS) console.log(`  by category:`, SEED_TOTALS);

  // Resolve category slugs
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .select('id, slug');
  if (catErr) {
    console.error('Greška dohvata kategorija:', catErr);
    process.exit(1);
  }
  const slugToId = new Map(cats.map(c => [c.slug, c.id]));
  console.log(`→ DB has ${cats.length} categories: ${[...slugToId.keys()].join(', ')}`);

  // Existing titles
  const existing = new Set();
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('listings')
      .select('title')
      .range(from, from + 999);
    if (error) {
      console.error('Greška dohvata postojećih:', error);
      break;
    }
    if (!data || data.length === 0) break;
    data.forEach(r => existing.add(r.title));
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log(`→ ${existing.size} listings already in DB`);

  let inserted = 0, skipped = 0, errors = 0;
  const errorLog = [];

  for (const l of seedListings) {
    if (existing.has(l.title)) { skipped++; continue; }

    const categoryId = slugToId.get(l.category_slug);
    if (!categoryId) {
      errors++;
      errorLog.push(`No category for slug=${l.category_slug} (${l.title})`);
      continue;
    }

    const coords = CITY_COORDS[l.location] ?? CITY_COORDS.Zagreb;

    const row = {
      title:         l.title,
      description:   l.description,
      price:         l.price,
      currency:      l.currency,
      status:        l.status,
      category_id:   categoryId,
      location_name: l.location,
      lat:           coords[0],
      lng:           coords[1],
      attributes: {
        ...l.attributes,
        contact_phone:    l.contact_phone,
        contact_email:    l.contact_email,
        listing_type:     l.listing_type,
        subcategory_slug: l.subcategory_slug,
      },
    };

    const { data: ins, error: insErr } = await supabase
      .from('listings')
      .insert(row)
      .select('id')
      .single();

    if (insErr) {
      errors++;
      errorLog.push(`${l.title} — ${insErr.message}`);
      continue;
    }

    if (ins?.id && l.images?.length) {
      const imgs = l.images.map((url, i) => ({
        listing_id: ins.id,
        url,
        is_primary: i === 0,
        sort_order: i,
      }));
      const { error: imgErr } = await supabase.from('listing_images').insert(imgs);
      if (imgErr) {
        errors++;
        errorLog.push(`${l.title} (slike) — ${imgErr.message}`);
      }
    }

    inserted++;
    if (inserted % 25 === 0) console.log(`  ...${inserted} inserted`);
  }

  console.log('\n=== SEED SUMMARY ===');
  console.log(`Inserted: ${inserted}`);
  console.log(`Skipped (already exist): ${skipped}`);
  console.log(`Errors: ${errors}`);
  if (errorLog.length) {
    console.log('\nFirst 10 errors:');
    errorLog.slice(0, 10).forEach(e => console.log('  •', e));
  }

  // Final counts
  const { count: listingCount }  = await supabase.from('listings').select('*', { count: 'exact', head: true });
  const { count: imageCount }    = await supabase.from('listing_images').select('*', { count: 'exact', head: true });
  const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  console.log(`\nDB now: ${categoryCount} categories, ${listingCount} listings, ${imageCount} images`);
}

main().catch(e => { console.error(e); process.exit(1); });
