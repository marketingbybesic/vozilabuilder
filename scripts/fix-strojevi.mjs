import { readFileSync } from 'node:fs';
import pg from 'pg';
const env = readFileSync('/Users/zmaj/Documents/Vozila Claude/server/.env', 'utf8');
const dbline = env.match(/^DATABASE_URL=(.+)$/m)[1].replace(/^['"]|['"]$/g, '');
const m = dbline.match(/postgres(?:ql)?:\/\/([^:]+):([^@]+)@([^/:]+):?(\d+)?\/([^?]+)/);
const [, , pass, host, , db] = m;
const ref = host.match(/db\.([^.]+)\.supabase\.co/)[1];
const url = `postgresql://postgres.${ref}:${pass}@aws-1-eu-central-1.pooler.supabase.com:6543/${db}`;
const c = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await c.connect();
const strojevi = (await c.query("SELECT id FROM categories WHERE slug='strojevi'")).rows[0]?.id;
const polj = (await c.query("SELECT id FROM categories WHERE slug='poljoprivredni-strojevi'")).rows[0]?.id;
if (polj && strojevi) {
  await c.query('UPDATE listings SET category_id=$1 WHERE category_id=$2', [strojevi, polj]);
  await c.query('DELETE FROM categories WHERE id=$1', [polj]);
  console.log('merged poljoprivredni → strojevi');
}
await c.query("DELETE FROM categories WHERE slug='strojevi-alati'");
console.log('dropped strojevi-alati');
const final = await c.query("SELECT c.slug, c.name, count(l.id) AS n FROM categories c LEFT JOIN listings l ON l.category_id=c.id WHERE c.parent_id IS NULL GROUP BY c.id ORDER BY n DESC");
console.log('---FINAL TOP-LEVEL---');
for (const r of final.rows) console.log(`  ${r.slug.padEnd(28)} ${r.n}  ${r.name}`);
await c.end();
