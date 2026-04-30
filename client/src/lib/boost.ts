// Boost & Featured tiers for paid listing placement.
// Pricing in EUR (excl. tax — Stripe handles VAT settings):
//   2-day "Top":      4.99€   — pinned to top of category for 48h
//   7-day "Featured": 14.99€  — featured carousel + badge
//   30-day "Premium": 49.00€  — featured + homepage rotation + analytics

export interface BoostTier {
  id: 'top-2d' | 'featured-7d' | 'premium-30d';
  name: string;
  duration_days: number;
  price_eur: number;
  perks: string[];
  // Stripe Price ID — populated from VITE_STRIPE_BOOST_<TIER> at build time.
  // For demo without these set, the BoostButton falls into a "test mode"
  // that records the intent locally and shows a confirmation toast.
  stripe_price_id?: string;
}

export const BOOST_TIERS: BoostTier[] = [
  {
    id: 'top-2d',
    name: 'Top 48h',
    duration_days: 2,
    price_eur: 4.99,
    perks: [
      'Vrh kategorije 48 sati',
      'Crveni "TOP" znak',
      'Pojavljivanje u dnevnim mailovima',
    ],
    stripe_price_id: import.meta.env.VITE_STRIPE_BOOST_TOP,
  },
  {
    id: 'featured-7d',
    name: 'Featured 7 dana',
    duration_days: 7,
    price_eur: 14.99,
    perks: [
      'Featured karusel 7 dana',
      'Premium značka',
      '3× više pregleda u prosjeku',
      'E-mail kupcima sa spremljenim pretragama',
    ],
    stripe_price_id: import.meta.env.VITE_STRIPE_BOOST_FEATURED,
  },
  {
    id: 'premium-30d',
    name: 'Premium 30 dana',
    duration_days: 30,
    price_eur: 49.0,
    perks: [
      'Featured + homepage rotacija 30 dana',
      'Premium značka + Match Score boost',
      'Tjedna analitika',
      'Prioritetna podrška',
    ],
    stripe_price_id: import.meta.env.VITE_STRIPE_BOOST_PREMIUM,
  },
];

export function findTier(id: BoostTier['id']) {
  return BOOST_TIERS.find((t) => t.id === id);
}

// Recorded boost intents (local stub when Stripe isn't fully wired).
// In real-mode this hits a server webhook → updates listing.is_featured.
const KEY = 'vozila_boost_intents_v1';
export interface BoostIntent {
  listingId: string;
  tier: BoostTier['id'];
  createdAt: number;
}
export function recordBoostIntent(i: BoostIntent) {
  try {
    const raw = localStorage.getItem(KEY);
    const arr: BoostIntent[] = raw ? JSON.parse(raw) : [];
    arr.unshift(i);
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 50)));
  } catch {}
}
export function listBoostIntents(): BoostIntent[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
