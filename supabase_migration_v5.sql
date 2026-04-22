-- ============================================================
--  HIMAYA JEWELS — Migration V5
--  Add Email + WhatsApp template settings
--  Run in: Supabase → SQL Editor → Run
-- ============================================================

-- New settings keys for notifications
INSERT INTO public.site_settings (key, value) VALUES
  -- Email settings
  ('business_email',          'support@himayajewels.com'),
  ('emailjs_service_id',      ''),
  ('emailjs_template_id',     ''),
  ('emailjs_customer_template_id', ''),
  ('emailjs_public_key',      ''),
  -- WhatsApp order message template
  ('whatsapp_order_template',
   '🛍️ *New Order — Himaya Jewels*

🔖 Order ID: {order_id}
👤 Customer: {customer_name}
📱 Phone: {phone}
🏠 Address: {address}

📦 Products:
{product_list}

💰 Total: ₹{total}

Please confirm order with customer.')
ON CONFLICT (key) DO NOTHING;

-- Add default values for reset
INSERT INTO public.site_settings (key, value) VALUES
  ('default_business_email', 'support@himayajewels.com'),
  ('default_whatsapp_order_template',
   '🛍️ *New Order — Himaya Jewels*

🔖 Order ID: {order_id}
👤 Customer: {customer_name}
📱 Phone: {phone}
🏠 Address: {address}

📦 Products:
{product_list}

💰 Total: ₹{total}

Please confirm order with customer.')
ON CONFLICT (key) DO NOTHING;

-- Verify
SELECT key, left(value, 60) AS value_preview FROM public.site_settings ORDER BY key;
