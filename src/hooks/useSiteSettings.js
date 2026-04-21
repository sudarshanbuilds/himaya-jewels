import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Cache to avoid repeated fetches across components
let _cache = null
let _cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

export function useSiteSettings() {
  const [settings, setSettings] = useState(_cache || {})
  const [loading, setLoading] = useState(!_cache)

  useEffect(() => {
    // Return cached value if fresh
    if (_cache && Date.now() - _cacheTime < CACHE_TTL) {
      setSettings(_cache)
      setLoading(false)
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.from('site_settings').select('key, value')
        if (data && mounted) {
          const map = Object.fromEntries(data.map(r => [r.key, r.value]))
          _cache = map
          _cacheTime = Date.now()
          setSettings(map)
          // Apply CSS custom properties
          applyCSSVars(map)
          // Inject Google Fonts
          injectFonts(map)
        }
      } catch (e) {
        console.warn('useSiteSettings fetch failed:', e.message)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [])

  return { settings, loading }
}

/** Invalidate cache — call after admin saves settings */
export function invalidateSettingsCache() {
  _cache = null
  _cacheTime = 0
}

function applyCSSVars(map) {
  const root = document.documentElement
  const colorKeys = {
    color_navbar_bg:        '--color-navbar-bg',
    color_navbar_text:      '--color-navbar-text',
    color_footer_bg:        '--color-footer-bg',
    color_footer_text:      '--color-footer-text',
    color_hero_bg:          '--color-hero-bg',
    color_banner_bg:        '--color-banner-bg',
    color_banner_text:      '--color-banner-text',
    color_category_bg:      '--color-category-bg',
    color_product_card_bg:  '--color-product-card-bg',
    color_btn_primary:      '--color-btn-primary',
    color_btn_primary_text: '--color-btn-primary-text',
  }
  Object.entries(colorKeys).forEach(([key, cssVar]) => {
    if (map[key]) root.style.setProperty(cssVar, map[key])
  })
  const fontKeys = {
    font_heading:       '--font-heading',
    font_body:          '--font-body',
    font_product_title: '--font-product-title',
    font_price:         '--font-price',
    font_footer:        '--font-footer',
  }
  Object.entries(fontKeys).forEach(([key, cssVar]) => {
    if (map[key]) root.style.setProperty(cssVar, `"${map[key]}", sans-serif`)
  })
}

const INJECTED_FONTS = new Set()
function injectFonts(map) {
  const fontValues = [
    map.font_heading, map.font_body, map.font_product_title,
    map.font_price, map.font_footer,
  ].filter(Boolean)

  fontValues.forEach(font => {
    if (INJECTED_FONTS.has(font)) return
    INJECTED_FONTS.add(font)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`
    document.head.appendChild(link)
  })
}
