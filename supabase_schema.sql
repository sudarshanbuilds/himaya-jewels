-- ============================================
-- HIMAYA JEWELS – Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- ============================================
-- Categories Table (NEW)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  description TEXT,
  category    TEXT,              -- text name (backward compat with existing data)
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,  -- FK when using DB categories
  size        TEXT[],
  images      TEXT[],
  stock       INTEGER DEFAULT 0 CHECK (stock >= 0),
  is_new      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name   TEXT NOT NULL,
  phone           TEXT NOT NULL,
  address         TEXT NOT NULL,
  product_id      UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity        INTEGER NOT NULL CHECK (quantity > 0),
  total_price     NUMERIC(10,2) NOT NULL,
  order_status    TEXT DEFAULT 'pending'
                  CHECK (order_status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  session_id  TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, session_id)
);

-- ============================================
-- RLS (Row Level Security) Policies
-- ============================================

ALTER TABLE products  ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders    ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Products: anyone can read, only authenticated admins can write
CREATE POLICY "Public read products"
  ON products FOR SELECT USING (TRUE);

CREATE POLICY "Admin insert products"
  ON products FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Admin update products"
  ON products FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Admin delete products"
  ON products FOR DELETE TO authenticated USING (TRUE);

-- Orders: anyone can insert (place order), admins can read/update
CREATE POLICY "Public insert orders"
  ON orders FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admin read orders"
  ON orders FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Admin update orders"
  ON orders FOR UPDATE TO authenticated USING (TRUE);

-- Favorites: session-based access
CREATE POLICY "Session read favorites"
  ON favorites FOR SELECT USING (TRUE);

CREATE POLICY "Session insert favorites"
  ON favorites FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Session delete favorites"
  ON favorites FOR DELETE USING (TRUE);

-- Categories: public read, admin write
CREATE POLICY "Public read categories"
  ON categories FOR SELECT USING (TRUE);

CREATE POLICY "Admin insert categories"
  ON categories FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Admin update categories"
  ON categories FOR UPDATE TO authenticated USING (TRUE);

CREATE POLICY "Admin delete categories"
  ON categories FOR DELETE TO authenticated USING (TRUE);

-- ============================================
-- Storage Buckets (create via Supabase Dashboard)
-- ============================================
-- 1. Create bucket: "product-images" (Public)
-- 2. Create bucket: "banner-images" (Public)

-- ============================================
-- Default Category Seed Data
-- ============================================

INSERT INTO categories (name, slug) VALUES
  ('Bangles',          'bangles'),
  ('Earrings',         'earrings'),
  ('Necklaces',        'necklaces'),
  ('Rings',            'rings'),
  ('Anklets',          'anklets'),
  ('Mangalsutra',      'mangalsutra'),
  ('Bridal Sets',      'bridal-sets'),
  ('Combo Sets',       'combo-sets'),
  ('Hair Accessories', 'hair-accessories'),
  ('Other',            'other')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Sample Product Data
-- ============================================

INSERT INTO products (name, price, description, category, size, images, stock, is_new)
VALUES
  ('Golden Bangle Set', 349, 'A stunning set of 6 gold-plated bangles with intricate floral engravings.', 'Bangles', ARRAY['2.4','2.6','2.8'], ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'], 25, TRUE),
  ('Pearl Drop Earrings', 199, 'Elegant pearl drop earrings with a delicate gold-tone finish.', 'Earrings', ARRAY['Free Size'], ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80'], 40, TRUE),
  ('Bridal Combo Set', 799, 'Complete bridal combo including necklace, earrings, and bangle set.', 'Combo Sets', ARRAY['2.4','2.6','2.8'], ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'], 12, FALSE),
  ('Rose Gold Hoop Earrings', 249, 'Modern rose gold hoop earrings with a polished finish.', 'Earrings', ARRAY['Free Size'], ARRAY['https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=600&q=80'], 35, FALSE),
  ('Kundan Bangle Set', 549, 'Traditional kundan bangles adorned with colorful semi-precious stones.', 'Bangles', ARRAY['2.4','2.6','2.8','3.0'], ARRAY['https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=80'], 0, FALSE),
  ('Jhumka Earrings', 279, 'Classic Indian jhumka earrings in antique gold finish with tiny bells.', 'Earrings', ARRAY['Free Size'], ARRAY['https://images.unsplash.com/photo-1573408301185-9519ef7b1b4b?w=600&q=80'], 20, TRUE),
  ('Festival Combo Pack', 649, 'A festive combo set with matching earrings and 4 bangles in temple-style design.', 'Combo Sets', ARRAY['2.4','2.6','2.8'], ARRAY['https://images.unsplash.com/photo-1573408301185-9519ef7b1b4b?w=600&q=80'], 18, FALSE),
  ('Minimalist Gold Bangles', 299, 'Sleek, thin gold bangles for the modern woman.', 'Bangles', ARRAY['2.4','2.6','2.8'], ARRAY['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'], 30, FALSE);
