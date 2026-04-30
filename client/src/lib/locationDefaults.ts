// Smart location defaults — auto-detects user region for radius search.
//
// Strategy (cheap → expensive):
//   1. localStorage cached value (no network)
//   2. browser Geolocation API (no network, requires user prompt)
//   3. free IP geolocation via ipapi.co (1k/day, no key)
//
// Stores the result in localStorage so subsequent loads are instant.

const KEY = 'vozila_location_v1';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
  country?: string;
  source: 'geolocation' | 'ip' | 'manual';
  capturedAt: number;
}

// Hardcoded centroids of the 5 biggest Croatian cities — used as fallback
// when API fails or user is outside HR. Zagreb = default.
export const HR_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  Zagreb:    { lat: 45.8150, lng: 15.9819 },
  Split:     { lat: 43.5081, lng: 16.4402 },
  Rijeka:    { lat: 45.3271, lng: 14.4422 },
  Osijek:    { lat: 45.5550, lng: 18.6955 },
  Pula:      { lat: 44.8666, lng: 13.8496 },
  Zadar:     { lat: 44.1194, lng: 15.2314 },
  Dubrovnik: { lat: 42.6507, lng: 18.0944 },
};

const ZAGREB: UserLocation = {
  lat: HR_CENTROIDS.Zagreb.lat,
  lng: HR_CENTROIDS.Zagreb.lng,
  city: 'Zagreb', country: 'HR',
  source: 'manual', capturedAt: 0,
};

export function getCachedLocation(): UserLocation | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const loc: UserLocation = JSON.parse(raw);
    if (Date.now() - loc.capturedAt > TTL_MS) return null;
    return loc;
  } catch { return null; }
}

export function setCachedLocation(loc: UserLocation) {
  try { localStorage.setItem(KEY, JSON.stringify({ ...loc, capturedAt: Date.now() })); } catch {}
}

// Try to get location without prompting (cached only, then IP).
// Use this on app boot to set the radius search default.
export async function getLocationSilently(): Promise<UserLocation> {
  const cached = getCachedLocation();
  if (cached) return cached;

  try {
    const res = await fetch('https://ipapi.co/json/', {
      method: 'GET', headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const j = await res.json();
      if (j?.latitude && j?.longitude) {
        const loc: UserLocation = {
          lat: j.latitude, lng: j.longitude,
          city: j.city, region: j.region, country: j.country_code,
          source: 'ip', capturedAt: Date.now(),
        };
        setCachedLocation(loc);
        return loc;
      }
    }
  } catch { /* fall through */ }

  // Fallback to Zagreb
  return ZAGREB;
}

// User-initiated. Returns a promise; rejects if user denies the prompt.
export function requestPreciseLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: UserLocation = {
          lat: pos.coords.latitude, lng: pos.coords.longitude,
          country: 'HR', source: 'geolocation', capturedAt: Date.now(),
        };
        setCachedLocation(loc);
        resolve(loc);
      },
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60_000 }
    );
  });
}
