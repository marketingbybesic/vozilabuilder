-- ============================================================================
-- Vozila.hr - Core Database Schema
-- Migration: 001_core_schema.sql
-- Database: PostgreSQL (Supabase)
-- Rule: 100% English keys - NO Croatian in schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('user', 'dealer', 'admin');
CREATE TYPE listing_status AS ENUM ('draft', 'active', 'sold');

-- ============================================================================
-- TABLE: users
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'user',
    whatsapp_number VARCHAR(20),
    dealer_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_dealer_verified ON users(dealer_verified) WHERE dealer_verified = true;

-- ============================================================================
-- TABLE: categories
-- ============================================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    name_en VARCHAR(255) NOT NULL,
    name_hr VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for categories
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(active) WHERE active = true;

-- ============================================================================
-- TABLE: listings
-- ============================================================================

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    mileage INT,
    fuel_type VARCHAR(50),
    transmission VARCHAR(50),
    condition VARCHAR(50),
    location_city VARCHAR(100),
    location_coordinates POINT,
    attributes JSONB NOT NULL DEFAULT '{}',
    status listing_status NOT NULL DEFAULT 'draft',
    featured BOOLEAN NOT NULL DEFAULT false,
    views_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Performance indexes for listings
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_category_id ON listings(category_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_make ON listings(make);
CREATE INDEX idx_listings_model ON listings(model);
CREATE INDEX idx_listings_year ON listings(year);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_featured ON listings(featured) WHERE featured = true;

-- GIN index for JSONB attributes (critical for dynamic queries)
CREATE INDEX idx_listings_attributes ON listings USING GIN (attributes);

-- Composite indexes for common query patterns
CREATE INDEX idx_listings_category_status ON listings(category_id, status);
CREATE INDEX idx_listings_status_created ON listings(status, created_at DESC);
CREATE INDEX idx_listings_make_model ON listings(make, model);

-- Full-text search index
CREATE INDEX idx_listings_search ON listings USING GIN (
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(make, '') || ' ' || COALESCE(model, ''))
);

-- ============================================================================
-- TABLE: listing_analytics
-- ============================================================================

CREATE TABLE listing_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    view_count INT NOT NULL DEFAULT 0,
    whatsapp_clicks INT NOT NULL DEFAULT 0,
    phone_reveals INT NOT NULL DEFAULT 0,
    favorite_count INT NOT NULL DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(listing_id)
);

-- Indexes for listing_analytics
CREATE UNIQUE INDEX idx_listing_analytics_listing_id ON listing_analytics(listing_id);
CREATE INDEX idx_listing_analytics_view_count ON listing_analytics(view_count DESC);

-- ============================================================================
-- TABLE: listing_images
-- ============================================================================

CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    width INT,
    height INT,
    file_size INT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for listing_images
CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_listing_images_sort_order ON listing_images(listing_id, sort_order);

-- ============================================================================
-- TABLE: favorites
-- ============================================================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

-- Indexes for favorites
CREATE UNIQUE INDEX idx_favorites_user_listing ON favorites(user_id, listing_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);

-- ============================================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_analytics_updated_at BEFORE UPDATE ON listing_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Core Categories (English slugs ONLY)
-- ============================================================================

INSERT INTO categories (slug, name_en, name_hr, description, icon, sort_order) VALUES
('cars', 'Cars', 'Automobili', 'Passenger vehicles and automobiles', 'car', 1),
('motorcycles', 'Motorcycles', 'Motocikli', 'Motorcycles and scooters', 'bike', 2),
('trucks', 'Trucks', 'Kamioni', 'Commercial trucks and vans', 'truck', 3),
('parts', 'Parts & Accessories', 'Dijelovi i oprema', 'Vehicle parts and accessories', 'wrench', 4),
('boats', 'Boats', 'Brodovi', 'Boats and watercraft', 'anchor', 5),
('machinery', 'Machinery', 'Strojevi', 'Construction and agricultural machinery', 'tractor', 6);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts - dealers, buyers, and admins';
COMMENT ON TABLE categories IS 'Vehicle categories - slugs MUST be English only';
COMMENT ON TABLE listings IS 'Core listings table - all keys in English';
COMMENT ON TABLE listing_analytics IS 'Analytics tracking for listings';
COMMENT ON TABLE listing_images IS 'Image storage references for listings';
COMMENT ON TABLE favorites IS 'User favorite/saved listings';

COMMENT ON COLUMN listings.attributes IS 'JSONB field for dynamic vehicle-specific data (e.g., engine_size, color, doors)';
COMMENT ON COLUMN categories.slug IS 'URL-safe English identifier - NEVER translate';
