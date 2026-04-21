-- ============================================================
--  HIMAYA JEWELS — Migration V2 (Feature Expansion)
--  Run this in: Supabase → SQL Editor → Run
-- ============================================================

-- New columns on products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_visible  BOOLEAN DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Site settings (editable homepage content)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
INSERT INTO public.site_settings (key, value) VALUES
  ('homepage_heading',    'Where Every Piece Tells a Story'),
  ('homepage_subheading', 'Discover our exquisite collection of bangles, earrings, and combo sets — crafted to make you shine at every occasion.'),
  ('homepage_align',      'left')
ON CONFLICT (key) DO NOTHING;

-- Banners
CREATE TABLE IF NOT EXISTS public.banners (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  heading    TEXT,
  subtext    TEXT,
  image_url  TEXT,
  bg_color   TEXT    DEFAULT '#7c2d12',
  text_color TEXT    DEFAULT '#ffffff',
  is_active  BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Combo offers
CREATE TABLE IF NOT EXISTS public.combo_offers (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT          NOT NULL,
  product_ids  TEXT[]        DEFAULT '{}',
  combo_price  NUMERIC(10,2),
  discount     NUMERIC       DEFAULT 0,
  image_url    TEXT,
  is_active    BOOLEAN       DEFAULT true,
  show_on_home BOOLEAN       DEFAULT true,
  created_at   TIMESTAMPTZ   DEFAULT NOW()
);

-- Special offers
CREATE TABLE IF NOT EXISTS public.special_offers (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT          NOT NULL,
  description TEXT,
  banner_url  TEXT,
  discount    NUMERIC       DEFAULT 0,
  start_date  DATE,
  end_date    DATE,
  is_active   BOOLEAN       DEFAULT true,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- RLS
ALTER TABLE public.site_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.combo_offers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.special_offers  ENABLE ROW LEVEL SECURITY;

-- Policies (drop if exist first to avoid conflicts)
DROP POLICY IF EXISTS "Public read site_settings"  ON public.site_settings;
DROP POLICY IF EXISTS "Auth manage site_settings"  ON public.site_settings;
DROP POLICY IF EXISTS "Public read banners"        ON public.banners;
DROP POLICY IF EXISTS "Auth manage banners"        ON public.banners;
DROP POLICY IF EXISTS "Public read combos"         ON public.combo_offers;
DROP POLICY IF EXISTS "Auth manage combos"         ON public.combo_offers;
DROP POLICY IF EXISTS "Public read special"        ON public.special_offers;
DROP POLICY IF EXISTS "Auth manage special"        ON public.special_offers;

CREATE POLICY "Public read site_settings" ON public.site_settings  FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage site_settings" ON public.site_settings  FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read banners"       ON public.banners         FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage banners"       ON public.banners         FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read combos"        ON public.combo_offers    FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage combos"        ON public.combo_offers    FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read special"       ON public.special_offers  FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage special"       ON public.special_offers  FOR ALL    TO authenticated USING (true) WITH CHECK (true);

-- Verify
SELECT 'site_settings'  AS tbl, COUNT(*) FROM public.site_settings
UNION ALL SELECT 'banners',      COUNT(*) FROM public.banners
UNION ALL SELECT 'combo_offers', COUNT(*) FROM public.combo_offers
UNION ALL SELECT 'special_offers',COUNT(*) FROM public.special_offers;
