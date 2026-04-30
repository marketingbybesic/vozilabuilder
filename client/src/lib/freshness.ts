// Track last-seen newest listing per category, so the feed can show
// "+N nova oglasa od jučer" when fresh listings arrive between visits.
// Storage: { [categorySlug]: ISO timestamp } in localStorage.

const KEY = 'vozila_last_seen_v1';

type Map = Record<string, string>;

function load(): Map {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}
function save(m: Map) {
  try { localStorage.setItem(KEY, JSON.stringify(m)); } catch {}
}

export function getLastSeen(slug: string): Date | null {
  const m = load();
  const v = m[slug];
  return v ? new Date(v) : null;
}

export function markSeen(slug: string, newest: string | Date) {
  const m = load();
  m[slug] = typeof newest === 'string' ? newest : newest.toISOString();
  save(m);
}

// Returns the count of items in `listings` whose created_at is newer than
// the last-seen timestamp for this category. First visit returns 0.
export function countNewSince(slug: string, createdAtList: (string | Date | undefined)[]): number {
  const last = getLastSeen(slug);
  if (!last) return 0;
  let n = 0;
  for (const ca of createdAtList) {
    if (!ca) continue;
    const t = typeof ca === 'string' ? new Date(ca) : ca;
    if (t > last) n++;
  }
  return n;
}
