/**
 * Notification utilities — Himaya Jewels
 *
 * Sends WhatsApp + Email notifications when an order is placed.
 * Both functions fail silently — order placement is NEVER blocked.
 *
 * WhatsApp: Opens a pre-filled wa.me link (no API key needed).
 * Email:    Uses EmailJS REST API (free tier — 200 emails/month).
 *           Requires EmailJS account configured in Site Settings.
 */

// ── Format the WhatsApp message from template ──────────────────
function buildWhatsAppMessage(template, order) {
  const productLines = order.products
    .map(p => `  - ${p.name} x${p.quantity} (₹${p.price * p.quantity})`)
    .join('\n')

  return (template || DEFAULT_WA_TEMPLATE)
    .replace('{order_id}',       order.orderId       || '—')
    .replace('{customer_name}',  order.customerName  || '—')
    .replace('{phone}',          order.phone         || '—')
    .replace('{address}',        order.address       || '—')
    .replace('{product_list}',   productLines        || '—')
    .replace('{total}',          order.total         || '0')
}

const DEFAULT_WA_TEMPLATE = `🛍️ *New Order — Himaya Jewels*

🔖 Order ID: {order_id}
👤 Customer: {customer_name}
📱 Phone: {phone}
🏠 Address: {address}

📦 Products:
{product_list}

💰 Total: ₹{total}

Please confirm order with customer.`

// ── Build EmailJS template parameters ──────────────────────────
function buildEmailParams(order) {
  const productLines = order.products
    .map(p => `${p.name} × ${p.quantity}  —  ₹${p.price * p.quantity}`)
    .join('\n')

  return {
    // Admin notification
    to_email:       order.businessEmail,
    order_id:       order.orderId       || '—',
    customer_name:  order.customerName  || '—',
    customer_phone: order.phone         || '—',
    customer_email: order.email         || '—',
    address:        order.address       || '—',
    product_list:   productLines        || '—',
    total:          `₹${order.total}`,
    order_date:     new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  }
}

function buildCustomerEmailParams(order) {
  const productLines = order.products
    .map(p => `${p.name} × ${p.quantity}  —  ₹${p.price * p.quantity}`)
    .join('\n')

  return {
    to_email:      order.email         || '',
    customer_name: order.customerName  || '',
    order_id:      order.orderId       || '—',
    product_list:  productLines        || '—',
    total:         `₹${order.total}`,
    phone:         order.phone         || '—',
    address:       order.address       || '—',
    order_date:    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    shop_name:     'Himaya Jewels',
  }
}

// ── WhatsApp Notification (opens wa.me link in new tab) ────────
export async function sendWhatsAppNotification(settings, order) {
  try {
    const number   = (settings.whatsapp_number || '919558285403').replace(/\D/g, '')
    const template = settings.whatsapp_order_template || DEFAULT_WA_TEMPLATE
    const message  = buildWhatsAppMessage(template, order)
    const url      = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

    // Open in new tab — admin receives the notification on their WhatsApp
    window.open(url, '_blank', 'noopener,noreferrer')
    return { success: true }
  } catch (err) {
    console.warn('WhatsApp notification failed (non-critical):', err.message)
    return { success: false, error: err.message }
  }
}

// ── Email to Admin via EmailJS REST API ────────────────────────
export async function sendAdminEmailNotification(settings, order) {
  const serviceId    = settings.emailjs_service_id
  const templateId   = settings.emailjs_template_id
  const publicKey    = settings.emailjs_public_key

  if (!serviceId || !templateId || !publicKey) {
    console.info('EmailJS not configured — skipping admin email notification.')
    return { success: false, reason: 'not_configured' }
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:      serviceId,
        template_id:     templateId,
        user_id:         publicKey,
        template_params: buildEmailParams({ ...order, businessEmail: settings.business_email }),
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`EmailJS responded: ${response.status} — ${text}`)
    }

    return { success: true }
  } catch (err) {
    console.warn('Admin email notification failed (non-critical):', err.message)
    return { success: false, error: err.message }
  }
}

// ── Confirmation Email to Customer ─────────────────────────────
export async function sendCustomerEmailConfirmation(settings, order) {
  const serviceId    = settings.emailjs_service_id
  const templateId   = settings.emailjs_customer_template_id
  const publicKey    = settings.emailjs_public_key

  // Skip silently if customer has no email or EmailJS not set up
  if (!order.email || !serviceId || !templateId || !publicKey) {
    return { success: false, reason: 'not_configured' }
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id:      serviceId,
        template_id:     templateId,
        user_id:         publicKey,
        template_params: buildCustomerEmailParams(order),
      }),
    })

    if (!response.ok) throw new Error(`EmailJS error: ${response.status}`)
    return { success: true }
  } catch (err) {
    console.warn('Customer email confirmation failed (non-critical):', err.message)
    return { success: false, error: err.message }
  }
}

// ── Send all notifications (single entry point) ────────────────
export async function sendOrderNotifications(settings, order) {
  // Fire all in parallel — never await before showing success screen
  Promise.allSettled([
    sendWhatsAppNotification(settings, order),
    sendAdminEmailNotification(settings, order),
    sendCustomerEmailConfirmation(settings, order),
  ]).then(results => {
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.warn(`Notification ${i} failed:`, r.reason)
      }
    })
  })
}
