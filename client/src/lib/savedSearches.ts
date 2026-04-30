// Saved searches — localStorage hook + match-pulse driver.
//
// User saves a search → we persist (a) the URL params and (b) a snapshot of
// the IDs of listings currently matching it. On every feed render we diff the
// new result IDs against the snapshot. New IDs trigger a "🔴 N nova" pulse on
// the saved-search chip and (later, in Phase 1) a Resend email.
//
// Loss-aversion + endowment effect — once a buyer saves a search, missing
// new matches feels like loss.

const KEY = 'vozila_saved_searches_v1';
const TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

export interface SavedSearch {
  id: string;             // hash of URL params
  label: string;          // human-readable summary, e.g., "BMW 3 do 25.000€"
  url: string;            // /pretraga?make=BMW&model=320d&priceMax=25000
  categorySlug?: string;
  knownIds: string[];     // listing ids known at last visit
  createdAt: number;
  lastVisitedAt: number;
  emailAlert?: boolean;
}

function load(): SavedSearch[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr: SavedSearch[] = JSON.parse(raw);
    const now = Date.now();
    return arr.filter((s) => now - s.lastVisitedAt < TTL_MS);
  } catch { return []; }
}

function persist(arr: SavedSearch[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('vozila:saved-searches-updated'));
  } catch {}
}

export function listSaved(): SavedSearch[] {
  return load().sort((a, b) => b.lastVisitedAt - a.lastVisitedAt);
}

export function hashSearch(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = ((h << 5) - h + url.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export function saveSearch(url: string, label: string, currentIds: string[], categorySlug?: string): SavedSearch {
  const id = hashSearch(url);
  const all = load();
  const existing = all.find((s) => s.id === id);
  const now = Date.now();
  if (existing) {
    existing.knownIds = currentIds;
    existing.lastVisitedAt = now;
    existing.label = label;
  } else {
    all.unshift({
      id, label, url, categorySlug,
      knownIds: currentIds,
      createdAt: now, lastVisitedAt: now, emailAlert: false,
    });
  }
  persist(all.slice(0, 24)); // cap
  return all.find((s) => s.id === id)!;
}

export function deleteSearch(id: string) {
  persist(load().filter((s) => s.id !== id));
}

export function getSearch(id: string): SavedSearch | undefined {
  return load().find((s) => s.id === id);
}

// Diff currently-loaded result IDs vs the snapshot. Used by feed to show pulse.
export function newMatches(searchId: string, currentIds: string[]): string[] {
  const s = getSearch(searchId);
  if (!s) return [];
  return currentIds.filter((id) => !s.knownIds.includes(id));
}

// Mark a saved search as visited (snapshot the new IDs so the pulse clears)
export function markVisited(searchId: string, currentIds: string[]) {
  const all = load();
  const target = all.find((s) => s.id === searchId);
  if (!target) return;
  target.knownIds = currentIds;
  target.lastVisitedAt = Date.now();
  persist(all);
}

export function toggleEmailAlert(searchId: string) {
  const all = load();
  const target = all.find((s) => s.id === searchId);
  if (!target) return;
  target.emailAlert = !target.emailAlert;
  persist(all);
}

export function clearAll() {
  try { localStorage.removeItem(KEY); } catch {}
}
