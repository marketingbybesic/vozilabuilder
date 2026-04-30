// Price-drop watch list — localStorage backed.
// On VDP "Pratite cijenu" toggle: store {listingId, priceAtSnapshot}.
// On every visit to that listing's page in the future, compare current price
// to snapshot — if dropped, surface a green "-X € od kad pratite" pill.
//
// Phase 2: server-side price-drop email via Resend when ANTHROPIC_API_KEY
// + VITE_RESEND_API_KEY are configured.

const KEY = 'vozila_price_watch_v1';
const TTL_MS = 90 * 24 * 60 * 60 * 1000;

export interface PriceWatch {
  listingId: string;
  priceAtSnapshot: number;
  currency: string;
  emailAlert: boolean;
  startedAt: number;
}

function load(): PriceWatch[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr: PriceWatch[] = JSON.parse(raw);
    const now = Date.now();
    return arr.filter((w) => now - w.startedAt < TTL_MS);
  } catch { return []; }
}

function persist(arr: PriceWatch[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
    window.dispatchEvent(new CustomEvent('vozila:price-watch-updated'));
  } catch {}
}

export function isWatching(listingId: string): boolean {
  return load().some((w) => w.listingId === listingId);
}

export function getWatch(listingId: string): PriceWatch | undefined {
  return load().find((w) => w.listingId === listingId);
}

export function watchPrice(listingId: string, currentPrice: number, currency = 'EUR') {
  const all = load().filter((w) => w.listingId !== listingId);
  all.unshift({
    listingId,
    priceAtSnapshot: currentPrice,
    currency,
    emailAlert: false,
    startedAt: Date.now(),
  });
  persist(all.slice(0, 100));
}

export function unwatchPrice(listingId: string) {
  persist(load().filter((w) => w.listingId !== listingId));
}

export function priceDelta(listingId: string, currentPrice: number): { delta: number; pct: number } | null {
  const w = getWatch(listingId);
  if (!w) return null;
  const delta = currentPrice - w.priceAtSnapshot;
  const pct = w.priceAtSnapshot > 0 ? (delta / w.priceAtSnapshot) * 100 : 0;
  return { delta, pct };
}
