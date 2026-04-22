import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ── Safe defaults (used if DB is unreachable or value is invalid) ──
export const DEFAULTS = {
  header_bg_color:       '#ffffff',
  header_text_color:     '#374151',
  banner_bg_color:       '#7c2d12',
  banner_text_color:     '#ffffff',
  category_bg_color:     '#fffbeb',
  product_card_bg_color: '#ffffff',
  button_color:          '#f59e0b',
  footer_bg_color:       '#111827',
  footer_text_color:     '#9ca3af',
  whatsapp_number:       '919558285403',
  whatsapp_order_template: '',       // fetched from DB; empty = use built-in default in notifications.js
  business_email:        '',
  emailjs_service_id:    '',
  emailjs_template_id:   '',
  emailjs_customer_template_id: '',
  emailjs_public_key:    '',
  homepage_heading:      'Where Every Piece Tells a Story',
  homepage_subheading:   'Discover our exquisite collection crafted to make you shine at every occasion.',
  homepage_align:        'left',
}


// ── Validate hex color — returns the value or a fallback ──
function safeColor(value, fallback = '#000000') {
  if (!value || typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return /^#[0-9a-fA-F]{3,6}$/.test(trimmed) ? trimmed : fallback
}

// ── Apply CSS custom properties on <html> ──
function applyCSSVars(map) {
  const root = document.documentElement
  const pairs = [
    ['header_bg_color',       '--header-bg',       DEFAULTS.header_bg_color],
    ['header_text_color',     '--header-text',     DEFAULTS.header_text_color],
    ['banner_bg_color',       '--banner-bg',       DEFAULTS.banner_bg_color],
    ['banner_text_color',     '--banner-text',     DEFAULTS.banner_text_color],
    ['category_bg_color',     '--category-bg',     DEFAULTS.category_bg_color],
    ['product_card_bg_color', '--product-card-bg', DEFAULTS.product_card_bg_color],
    ['button_color',          '--btn-color',       DEFAULTS.button_color],
    ['footer_bg_color',       '--footer-bg',       DEFAULTS.footer_bg_color],
    ['footer_text_color',     '--footer-text',     DEFAULTS.footer_text_color],
  ]
  pairs.forEach(([key, cssVar, fallback]) => {
    root.style.setProperty(cssVar, safeColor(map[key], fallback))
  })
}

// ── Module-level cache ──
let _cache = null
let _cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

export function useSiteSettings() {
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...(_cache || {}) }))
  const [loading, setLoading]   = useState(!_cache)

  useEffect(() => {
    if (_cache && Date.now() - _cacheTime < CACHE_TTL) {
      setSettings({ ...DEFAULTS, ..._cache })
      setLoading(false)
      applyCSSVars(_cache)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.from('site_settings').select('key, value')
        if (data && mounted) {
          const map = Object.fromEntries(data.map(r => [r.key, r.value]))
          _cache     = map
          _cacheTime = Date.now()
          const merged = { ...DEFAULTS, ...map }
          setSettings(merged)
          applyCSSVars(merged)
        }
      } catch (e) {
        console.warn('useSiteSettings fetch failed — using defaults:', e.message)
        // Fallback: still apply defaults so page renders correctly
        if (mounted) {
          setSettings({ ...DEFAULTS })
          applyCSSVars(DEFAULTS)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [])

  return { settings, loading }
}

/** Call after admin saves — forces next component mount to re-fetch */
export function invalidateSettingsCache() {
  _cache     = null
  _cacheTime = 0
}
