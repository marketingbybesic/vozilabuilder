-- ============================================================================
-- Vozila.hr - Taxonomy Alignment + Seed Support
-- Migration: 002_taxonomy_alignment.sql
-- Purpose: align categories table with URL taxonomy (taxonomy.ts), add
--          subcategory_slug + views_count to listings, allow nullable
--          listing_images.storage_path, and create deterministic demo dealer
--          user for idempotent seed runs.
-- Idempotent: every statement is IF NOT EXISTS / ON CONFLICT DO NOTHING / etc.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. listings.subcategory_slug + index
-- ----------------------------------------------------------------------------
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subcategory_slug VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_listings_subcategory_slug ON listings(subcategory_slug);

-- ----------------------------------------------------------------------------
-- 2. listings.views_count (already exists in 001 schema as NOT NULL DEFAULT 0).
--    Re-declared here defensively in case running against an older snapshot.
-- ----------------------------------------------------------------------------
ALTER TABLE listings ADD COLUMN IF NOT EXISTS views_count INT NOT NULL DEFAULT 0;

-- ----------------------------------------------------------------------------
-- 3. listing_images.storage_path -> nullable
-- ----------------------------------------------------------------------------
ALTER TABLE listing_images ALTER COLUMN storage_path DROP NOT NULL;

-- ----------------------------------------------------------------------------
-- 4. Insert URL-aligned categories (matches taxonomy.ts top-level slugs).
--    Existing English-slug rows ('cars', 'motorcycles', ...) are preserved.
-- ----------------------------------------------------------------------------
INSERT INTO categories (slug, name_en, name_hr, description, icon, sort_order) VALUES
  ('osobni-automobili',      'Cars',                    'Osobni automobili',      'Passenger cars and SUVs',                          'car',          10),
  ('motocikli',              'Motorcycles',             'Motocikli',              'Motorcycles, scooters, ATVs',                       'bike',         20),
  ('bicikli-romobili',       'Bicycles & Scooters',     'Bicikli i romobili',     'Bicycles, e-bikes, e-scooters',                     'bike',         30),
  ('kombiji-laki-teretni',   'Vans & Light Commercial', 'Kombiji i laki teretni', 'Vans and light commercial vehicles',                'truck',        40),
  ('kamioni-teretna',        'Trucks & Heavy Goods',    'Kamioni i teretna',      'Trucks, semi-trailers, buses',                      'truck',        50),
  ('gradevinski-strojevi',   'Construction Machinery',  'Građevinski strojevi',   'Excavators, loaders, cranes',                       'construction', 60),
  ('poljoprivredni-strojevi','Agricultural Machinery',  'Poljoprivredni strojevi','Tractors, harvesters, implements',                  'tractor',      70),
  ('kamperi-karavani',       'Campers & Caravans',      'Kamperi i karavani',     'Motorhomes, caravans, camper vans',                 'tent',         80),
  ('plovila-nautika',        'Boats & Watercraft',      'Plovila i nautika',      'Boats, yachts, jet skis',                            'anchor',       90),
  ('dijelovi-oprema',        'Parts & Accessories',     'Dijelovi i oprema',      'Vehicle parts, tyres, accessories',                 'wrench',      100),
  ('usluge',                 'Services',                'Usluge',                 'Vehicle services and rental',                       'wrench',      110)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 5. Deterministic demo dealer user for seed listings
--    UUID is stable across runs so seed is idempotent.
-- ----------------------------------------------------------------------------
INSERT INTO users (id, email, role, user_type, dealer_verified, company_name)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@vozila.hr',
  'dealer',
  'business',
  true,
  'Vozila.hr Demo Salon'
)
ON CONFLICT (id) DO NOTHING;

-- Also handle the case where the email already exists with a different UUID
INSERT INTO users (id, email, role, user_type, dealer_verified, company_name)
SELECT
  '00000000-0000-0000-0000-000000000001',
  'demo@vozila.hr',
  'dealer',
  'business',
  true,
  'Vozila.hr Demo Salon'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@vozila.hr')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DONE
-- ============================================================================
