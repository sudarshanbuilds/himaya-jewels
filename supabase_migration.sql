-- ============================================================
--  HIMAYA JEWELS — Complete Supabase Migration
--  Generated from frontend code scan
--  Run this entire file in: Supabase → SQL Editor → Run
-- ============================================================


-- ============================================================
-- STEP 1: DROP EVERYTHING (clean slate)
-- ============================================================

DROP TABLE IF EXISTS public.orders          CASCADE;
DROP TABLE IF EXISTS public.products        CASCADE;
DROP TABLE IF EXISTS public.categories      CASCADE;
DROP TABLE IF EXISTS public.user_roles      CASCADE;
DROP TABLE IF EXISTS public.categories_backup CASCADE;


-- ============================================================
-- STEP 2: CREATE TABLES
-- ============================================================

-- ------------------------------------------------------------
-- CATEGORIES
-- Fields used in frontend:
--   id, name, slug, created_at
-- Used in: useCategories.js, admin/Products.jsx, admin/Categories.jsx
-- ------------------------------------------------------------
CREATE TABLE public.categories (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  slug       TEXT        UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ------------------------------------------------------------
-- PRODUCTS
-- Fields used in frontend:
--   id, name, price, description, category_id, category,
--   images, stock, is_new, size, created_at
-- Used in: admin/Products.jsx (insert/update), Shop.jsx (select)
-- ------------------------------------------------------------
CREATE TABLE public.products (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT          NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  description TEXT,
  category_id UUID          REFERENCES public.categories(id) ON DELETE SET NULL,
  category    TEXT,                          -- text fallback for display
  images      TEXT[]        DEFAULT '{}',
  stock       INTEGER       DEFAULT 0,
  is_new      BOOLEAN       DEFAULT false,
  size        TEXT,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);


-- ------------------------------------------------------------
-- ORDERS
-- Fields inserted in: Checkout.jsx
--   customer_name, phone, address, products (JSONB), total_price, order_status
-- Fields read in: admin/Orders.jsx, Account.jsx
-- Products JSONB shape: [{id, name, price, quantity, selectedSize, image, subtotal}]
-- Status values: pending | confirmed | shipped | delivered | cancelled
-- ------------------------------------------------------------
CREATE TABLE public.orders (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT          NOT NULL,
  phone         TEXT          NOT NULL,
  address       TEXT          NOT NULL,
  products      JSONB         NOT NULL DEFAULT '[]',
  total_price   NUMERIC(10,2) NOT NULL,
  order_status  TEXT          DEFAULT 'pending'
                              CHECK (order_status IN
                                ('pending','confirmed','shipped','delivered','cancelled')),
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);


-- ------------------------------------------------------------
-- USER ROLES  (for admin role management)
-- ------------------------------------------------------------
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role    TEXT NOT NULL DEFAULT 'user'
                        CHECK (role IN ('admin', 'user'))
);


-- ============================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.categories  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles  ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 4: POLICIES
-- ============================================================

-- ── CATEGORIES ────────────────────────────────────────────

-- Anyone can view categories (used in shop, navbar, filters)
CREATE POLICY "Public view categories"
  ON public.categories FOR SELECT
  TO public USING (true);

-- Authenticated users (admin) can insert / update / delete categories
CREATE POLICY "Authenticated manage categories"
  ON public.categories FOR ALL
  TO authenticated USING (true) WITH CHECK (true);


-- ── PRODUCTS ──────────────────────────────────────────────

-- Anyone can view products (shop page, homepage, product detail)
CREATE POLICY "Public view products"
  ON public.products FOR SELECT
  TO public USING (true);

-- Authenticated users (admin) can insert / update / delete products
CREATE POLICY "Authenticated manage products"
  ON public.products FOR ALL
  TO authenticated USING (true) WITH CHECK (true);


-- ── ORDERS ────────────────────────────────────────────────

-- Anyone (guest checkout) can place an order
CREATE POLICY "Public insert orders"
  ON public.orders FOR INSERT
  TO public WITH CHECK (true);

-- Authenticated users (admin) can view and update orders
CREATE POLICY "Authenticated read orders"
  ON public.orders FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Authenticated update orders"
  ON public.orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);


-- ── USER ROLES ────────────────────────────────────────────

-- Users can read their own role
CREATE POLICY "User read own role"
  ON public.user_roles FOR SELECT
  TO authenticated USING (user_id = auth.uid());

-- Only admins can manage roles (prevents self-promotion)
CREATE POLICY "Admin manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- STEP 5: INSERT DEFAULT CATEGORIES
-- ============================================================

INSERT INTO public.categories (name, slug) VALUES
  ('Bangles',          'bangles'),
  ('Earrings',         'earrings'),
  ('Necklaces',        'necklaces'),
  ('Rings',            'rings'),
  ('Anklets',          'anklets'),
  ('Mangalsutra',      'mangalsutra'),
  ('Bridal Sets',      'bridal-sets'),
  ('Combo Sets',       'combo-sets'),
  ('Hair Accessories', 'hair-accessories'),
  ('Other',            'other');


-- ============================================================
-- STEP 6: REGISTER YOUR ADMIN USER
--
-- INSTRUCTIONS:
-- 1. First go to Supabase → Authentication → Users
-- 2. Find your admin account and copy the UUID
-- 3. Replace 'YOUR-ADMIN-UUID-HERE' below with that UUID
-- 4. Then run ONLY this INSERT statement
-- ============================================================

-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('YOUR-ADMIN-UUID-HERE', 'admin');


-- ============================================================
-- STEP 7: VERIFY — Run these SELECT statements to confirm
-- ============================================================

SELECT 'categories' AS table_name, COUNT(*) FROM public.categories
UNION ALL
SELECT 'products',  COUNT(*) FROM public.products
UNION ALL
SELECT 'orders',    COUNT(*) FROM public.orders
UNION ALL
SELECT 'user_roles',COUNT(*) FROM public.user_roles;

-- Should show:
-- categories | 10
-- products   | 0
-- orders     | 0
-- user_roles | 0

-- Verify categories have real UUIDs
SELECT id, name, slug FROM public.categories ORDER BY name;
