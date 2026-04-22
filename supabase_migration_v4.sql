-- ============================================================
--  HIMAYA JEWELS — Migration V4  
--  Standardise site_settings keys + add defaults
--  Run in: Supabase → SQL Editor → Run
-- ============================================================

-- 1. Insert active color settings (new standardised key names)
INSERT INTO public.site_settings (key, value) VALUES
  ('header_bg_color',        '#ffffff'),
  ('header_text_color',      '#374151'),
  ('banner_bg_color',        '#7c2d12'),
  ('banner_text_color',      '#ffffff'),
  ('category_bg_color',      '#fffbeb'),
  ('product_card_bg_color',  '#ffffff'),
  ('button_color',           '#f59e0b'),
  ('footer_bg_color',        '#111827'),
  ('footer_text_color',      '#9ca3af'),
  ('whatsapp_number',        '919558285403')
ON CONFLICT (key) DO NOTHING;

-- 2. Insert DEFAULT values (used by Reset button)
INSERT INTO public.site_settings (key, value) VALUES
  ('default_header_bg',       '#ffffff'),
  ('default_header_text',     '#374151'),
  ('default_banner_bg',       '#7c2d12'),
  ('default_banner_text',     '#ffffff'),
  ('default_category_bg',     '#fffbeb'),
  ('default_product_bg',      '#ffffff'),
  ('default_button_color',    '#f59e0b'),
  ('default_footer_bg',       '#111827'),
  ('default_footer_text',     '#9ca3af'),
  ('default_whatsapp_number', '919558285403')
ON CONFLICT (key) DO NOTHING;

-- 3. Make sure homepage heading keys exist
INSERT INTO public.site_settings (key, value) VALUES
  ('homepage_heading',    'Where Every Piece Tells a Story'),
  ('homepage_subheading', 'Discover our exquisite collection crafted to make you shine at every occasion.'),
  ('homepage_align',      'left')
ON CONFLICT (key) DO NOTHING;

-- 4. Verify
SELECT key, value FROM public.site_settings ORDER BY key;
