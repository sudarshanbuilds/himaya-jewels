-- ============================================================
--  HIMAYA JEWELS — Migration V3 (Site settings expansion)
--  Run this in: Supabase → SQL Editor → Run
-- ============================================================

-- Ensure site_settings table exists (idempotent)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

-- New default settings for colors, fonts, WhatsApp
INSERT INTO public.site_settings (key, value) VALUES
  -- Colors
  ('color_navbar_bg',       '#111827'),
  ('color_navbar_text',     '#ffffff'),
  ('color_footer_bg',       '#111827'),
  ('color_footer_text',     '#9ca3af'),
  ('color_hero_bg',         '#422006'),
  ('color_banner_bg',       '#7c2d12'),
  ('color_banner_text',     '#ffffff'),
  ('color_category_bg',     '#fffbeb'),
  ('color_product_card_bg', '#ffffff'),
  ('color_btn_primary',     '#f59e0b'),
  ('color_btn_primary_text','#000000'),
  -- Fonts
  ('font_heading',          'Playfair Display'),
  ('font_body',             'Inter'),
  ('font_product_title',    'Inter'),
  ('font_price',            'Poppins'),
  ('font_footer',           'Inter'),
  -- WhatsApp
  ('whatsapp_number',       '919558285403'),
  ('whatsapp_enabled',      'true'),
  ('whatsapp_message',      'Hello! I am interested in your jewelry collection.')
ON CONFLICT (key) DO NOTHING;

-- Verify
SELECT key, value FROM public.site_settings ORDER BY key;
