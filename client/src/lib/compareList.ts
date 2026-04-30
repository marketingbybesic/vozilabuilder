// Compare-list — localStorage hook for the /usporedba feature.
// Caps at 4 listings. Triggers a vozila:compare-updated event so any
// header/nav badge subscribers refresh.

const KEY = 'vozila_compare_v1';
const MAX = 4;

function load(): string[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { return []; }
}
function save(arr: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent('vozila:compare-updated'));
  } catch {}
}

export function getCompareIds(): string[] {
  return load();
}

export function isInCompare(id: string): boolean {
  return load().includes(id);
}

export function addToCompare(id: string) {
  const cur = load().filter((x) => x !== id);
  cur.unshift(id);
  save(cur);
}

export function removeFromCompare(id: string) {
  save(load().filter((x) => x !== id));
}

export function toggleCompare(id: string) {
  return isInCompare(id) ? removeFromCompare(id) : addToCompare(id);
}

export function clearCompare() {
  try { localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent('vozila:compare-updated')); } catch {}
}
