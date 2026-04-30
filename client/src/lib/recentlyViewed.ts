// Recently-viewed listings — localStorage hook, surfaces on home and VDP.
// Cap: 12 entries. LRU on insert. Prunes stale (>30 days).

const KEY = 'vozila_recent_v1';
const MAX = 12;
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export interface RecentEntry {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  viewedAt: number;
}

export function loadRecent(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr: RecentEntry[] = JSON.parse(raw);
    const now = Date.now();
    return arr.filter((e) => now - e.viewedAt < TTL_MS).slice(0, MAX);
  } catch { return []; }
}

export function pushRecent(entry: Omit<RecentEntry, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const cur = loadRecent().filter((e) => e.id !== entry.id);
  cur.unshift({ ...entry, viewedAt: now });
  try {
    localStorage.setItem(KEY, JSON.stringify(cur.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent('vozila:recent-updated'));
  } catch {}
}

export function clearRecent() {
  try { localStorage.removeItem(KEY); } catch {}
}
