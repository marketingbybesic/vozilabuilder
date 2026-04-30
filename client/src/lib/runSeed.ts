/**
 * Browser-side seed runner (admin button in /admin/seed-database).
 * For programmatic Node-side seeding use scripts/seed-db.mjs which reads
 * SUPABASE_SERVICE_ROLE_KEY from server/.env.
 *
 * This runner targets the LIVE schema observed on testiranje.cloud:
 *   listings(id, category_id, title, description, price, currency, status,
 *            location_name, lat, lng, attributes, created_at, ...)
 *   listing_images(id, listing_id, url, is_primary, sort_order)
 *
 * It is idempotent: a listing whose `title` already exists in the DB is
 * skipped on re-run.
 */
import { supabase } from './supabase';
import { seedListings, SEED_TOTALS } from './seedData';

export interface SeedResult {
  success: boolean;
  inserted: number;
  skipped: number;
  errors: string[];
  totals: typeof SEED_TOTALS;
}

// Croatian city → (lat, lng) for plausible map pins
const CITY_COORDS: Record<string, [number, number]> = {
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

export const runSeed = async (): Promise<SeedResult> => {
  const errors: string[] = [];
  let inserted = 0;
  let skipped = 0;

  // 1. Resolve URL-slug → category_id
  const { data: cats, error: catError } = await supabase
    .from('categories')
    .select('id, slug');

  if (catError || !cats) {
    return {
      success: false,
      inserted: 0,
      skipped: 0,
      errors: [`Ne mogu dohvatiti kategorije: ${catError?.message || 'unknown'}`],
      totals: SEED_TOTALS,
    };
  }

  const slugToId = new Map<string, string>(cats.map((c: any) => [c.slug, c.id]));

  // 2. Fetch existing titles (idempotency guard)
  const { data: existing } = await supabase
    .from('listings')
    .select('title');
  const existingTitles = new Set<string>((existing || []).map((r: any) => r.title));

  // 3. Insert listings + images
  for (const listing of seedListings) {
    if (existingTitles.has(listing.title)) {
      skipped++;
      continue;
    }

    const categoryId = slugToId.get(listing.category_slug);
    if (!categoryId) {
      errors.push(`Listing "${listing.title}": kategorija "${listing.category_slug}" nije pronađena u DB`);
      continue;
    }

    const coords = CITY_COORDS[listing.location] ?? CITY_COORDS.Zagreb;

    // Live schema is minimal — only insert columns we know exist
    const row: Record<string, any> = {
      title:         listing.title,
      description:   listing.description,
      price:         listing.price,
      currency:      listing.currency,
      status:        listing.status,
      category_id:   categoryId,
      location_name: listing.location,
      lat:           coords[0],
      lng:           coords[1],
      attributes:    {
        ...listing.attributes,
        contact_phone:    listing.contact_phone,
        contact_email:    listing.contact_email,
        listing_type:     listing.listing_type,
        subcategory_slug: listing.subcategory_slug,
      },
    };

    const { data: newListing, error: insErr } = await supabase
      .from('listings')
      .insert(row)
      .select('id')
      .single();

    if (insErr) {
      errors.push(`Listing "${listing.title}": ${insErr.message}`);
      continue;
    }

    if (newListing?.id && listing.images.length > 0) {
      const imageRows = listing.images.map((url, idx) => ({
        listing_id: newListing.id,
        url,
        is_primary: idx === 0,
        sort_order: idx,
      }));

      const { error: imgError } = await supabase
        .from('listing_images')
        .insert(imageRows);

      if (imgError) {
        errors.push(`Slike za "${listing.title}": ${imgError.message}`);
      }
    }

    inserted++;
  }

  return {
    success: errors.length === 0,
    inserted,
    skipped,
    errors,
    totals: SEED_TOTALS,
  };
};
