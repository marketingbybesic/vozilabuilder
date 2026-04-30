// Match Score — a 0–100 quality signal shown on every listing card.
// Encodes the platform's quality bar: photos, completeness, history,
// market price, dealer trust. Used as a soft sort key and a visible
// "92% match" pill that signals listing quality at-a-glance.
//
// Pure / deterministic — no DB access. All inputs come from the listing
// row + its joined images. Safe to call on render.

import type { Listing } from '../types';

export interface ScoreBreakdown {
  total: number;       // 0-100
  band: 'Premium' | 'Solid' | 'Basic';
  reasons: string[];   // human-readable wins, used in tooltip
}

export function matchScore(listing: Listing): ScoreBreakdown {
  let score = 30;
  const reasons: string[] = [];

  // Images (0-30 pts)
  const imgs = listing.listing_images || [];
  if (imgs.length >= 8)      { score += 30; reasons.push(`${imgs.length} fotografija`); }
  else if (imgs.length >= 4) { score += 20; reasons.push(`${imgs.length} fotografija`); }
  else if (imgs.length >= 1) { score += 10; }

  // Description quality (0-10)
  const desc = listing.description || '';
  if (desc.length > 600)      { score += 10; reasons.push('Detaljan opis'); }
  else if (desc.length > 200) { score += 5; }

  // Attributes completeness (0-15) — depends on what category contributed
  const attrs = (listing.attributes || {}) as Record<string, any>;
  const filledAttrs = Object.values(attrs).filter(v => v !== null && v !== undefined && v !== '').length;
  if (filledAttrs >= 12)     { score += 15; reasons.push('Sve specifikacije'); }
  else if (filledAttrs >= 8) { score += 10; reasons.push('Većina specifikacija'); }
  else if (filledAttrs >= 4) { score += 5; }

  // Trust signals (0-15)
  if (attrs.service_history === true || attrs.service_history === 'true') { score += 5; reasons.push('Servisna knjiga'); }
  if (attrs.first_owner === true || attrs.first_owner === 'true')         { score += 4; reasons.push('Prvi vlasnik'); }
  if (attrs.damage_free === true || attrs.damage_free === 'true')         { score += 3; reasons.push('Bez oštećenja'); }
  if (attrs.registered === true || attrs.registered === 'true')           { score += 3; reasons.push('Registrirano'); }

  // Featured / dealer-verified bumps (0-10)
  if ((listing as any).is_featured)                          { score += 5; reasons.push('Istaknuto'); }
  const owner = (listing as any).owner;
  if (owner?.dealer_verified || owner?.is_verified)          { score += 5; reasons.push('Verificirani prodavač'); }

  score = Math.min(100, Math.max(0, score));
  const band: ScoreBreakdown['band'] = score >= 80 ? 'Premium' : score >= 60 ? 'Solid' : 'Basic';
  return { total: score, band, reasons };
}
