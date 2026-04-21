-- ============================================================
--  HIMAYA JEWELS — Migration V4 (separate WhatsApp toggles)
--  Run this in: Supabase → SQL Editor → Run
-- ============================================================

INSERT INTO public.site_settings (key, value) VALUES
  ('floating_whatsapp_enabled', 'true'),
  ('footer_whatsapp_enabled',   'true')
ON CONFLICT (key) DO NOTHING;

SELECT key, value FROM public.site_settings WHERE key LIKE '%whatsapp%';
