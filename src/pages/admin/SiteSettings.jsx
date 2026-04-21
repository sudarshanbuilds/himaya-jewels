import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Save, RefreshCw, AlignLeft, AlignCenter, AlignRight,
  Palette, Type, MessageCircle, RotateCcw, Eye, EyeOff, Check, X
} from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase } from '../../lib/supabase'
import { invalidateSettingsCache } from '../../hooks/useSiteSettings'

// ── Constants (unchanged) ───────────────────────────────────
const FONTS = ['Inter', 'Poppins', 'Roboto', 'Playfair Display', 'Montserrat']

const COLOR_FIELDS = [
  { key: 'color_navbar_bg',        label: 'Header Background',      section: 'Header' },
  { key: 'color_navbar_text',      label: 'Header Text',            section: 'Header' },
  { key: 'color_footer_bg',        label: 'Footer Background',      section: 'Footer' },
  { key: 'color_footer_text',      label: 'Footer Text',            section: 'Footer' },
  { key: 'color_hero_bg',          label: 'Hero Banner Background', section: 'Hero' },
  { key: 'color_banner_bg',        label: 'Promo Banner Background',section: 'Banners' },
  { key: 'color_banner_text',      label: 'Promo Banner Text',      section: 'Banners' },
  { key: 'color_category_bg',      label: 'Category Section BG',   section: 'Shop' },
  { key: 'color_product_card_bg',  label: 'Product Card Background',section: 'Shop' },
  { key: 'color_btn_primary',      label: 'Primary Button Color',   section: 'Buttons' },
  { key: 'color_btn_primary_text', label: 'Primary Button Text',    section: 'Buttons' },
]

const FONT_FIELDS = [
  { key: 'font_heading',       label: 'Heading / Title Font' },
  { key: 'font_body',          label: 'Body Text Font' },
  { key: 'font_product_title', label: 'Product Name Font' },
  { key: 'font_price',         label: 'Price Font' },
  { key: 'font_footer',        label: 'Footer Font' },
]

// ── Default theme (used for Reset to Default) ───────────────
const DEFAULT_THEME = {
  color_navbar_bg:        '#111827',
  color_navbar_text:      '#ffffff',
  color_footer_bg:        '#111827',
  color_footer_text:      '#9ca3af',
  color_hero_bg:          '#422006',
  color_banner_bg:        '#7c2d12',
  color_banner_text:      '#ffffff',
  color_category_bg:      '#fffbeb',
  color_product_card_bg:  '#ffffff',
  color_btn_primary:      '#f59e0b',
  color_btn_primary_text: '#000000',
  font_heading:           'Playfair Display',
  font_body:              'Inter',
  font_product_title:     'Inter',
  font_price:             'Poppins',
  font_footer:            'Inter',
}

const HERO_DEFAULTS = {
  homepage_heading:    'Where Every\nPiece Tells\na Story',
  homepage_subheading: 'Discover our exquisite collection crafted to make you shine at every occasion.',
  homepage_align:      'left',
}
const COLOR_DEFAULTS = Object.fromEntries(COLOR_FIELDS.map(f => [f.key, '#ffffff']))
const FONT_DEFAULTS  = Object.fromEntries(FONT_FIELDS.map(f => [f.key, 'Inter']))
const WA_DEFAULTS    = {
  whatsapp_number:           '919558285403',
  whatsapp_message:          "Hello! I'm interested in your jewelry collection.",
  floating_whatsapp_enabled: 'true',
  footer_whatsapp_enabled:   'true',
}

// ── CSS var helper (mirrors useSiteSettings.js) ─────────────
const CSS_COLOR_MAP = Object.fromEntries(
  COLOR_FIELDS.map(f => [f.key, '--' + f.key.replace(/_/g, '-')])
)
const CSS_FONT_MAP = Object.fromEntries(
  FONT_FIELDS.map(f => [f.key, '--' + f.key.replace(/_/g, '-')])
)

function applyCSS(s) {
  const root = document.documentElement
  Object.entries(CSS_COLOR_MAP).forEach(([key, cssVar]) => {
    if (s[key]) root.style.setProperty(cssVar, s[key])
  })
  Object.entries(CSS_FONT_MAP).forEach(([key, cssVar]) => {
    if (s[key]) root.style.setProperty(cssVar, `"${s[key]}", sans-serif`)
  })
}

// ── Toggle helper ───────────────────────────────────────────
function Toggle({ checked, onChange, id }) {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500" />
    </label>
  )
}

// ── Tabs ────────────────────────────────────────────────────
const TABS = [
  { id: 'hero',     label: 'Hero Text',  icon: AlignLeft },
  { id: 'colors',   label: 'Colors',     icon: Palette },
  { id: 'fonts',    label: 'Fonts',      icon: Type },
  { id: 'whatsapp', label: 'WhatsApp',   icon: MessageCircle },
]

// ══════════════════════════════════════════════════════════════
export default function AdminSiteSettings() {
  const [activeTab, setActiveTab] = useState('hero')

  // All settings (merged DB + defaults)
  const [settings, setSettings] = useState({
    ...HERO_DEFAULTS, ...COLOR_DEFAULTS, ...FONT_DEFAULTS, ...WA_DEFAULTS,
  })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState('')
  const [error,   setError]   = useState('')

  // ── Preview Mode state ──────────────────────────────────────
  const [previewMode, setPreviewMode] = useState(false)
  // Snapshot of settings when preview started (for Cancel Preview)
  const originalSettingsRef = useRef(null)

  // ── Reset Confirmation state ────────────────────────────────
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  // ── Fetch ───────────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('site_settings').select('key, value')
      if (data) {
        setSettings(s => {
          const updated = { ...s, ...Object.fromEntries(data.map(r => [r.key, r.value])) }
          return updated
        })
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  // ── Apply CSS vars LIVE during preview ──────────────────────
  useEffect(() => {
    if (previewMode) applyCSS(settings)
  }, [settings, previewMode])

  // ── Helpers ─────────────────────────────────────────────────
  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  // Save specific keys to DB
  const handleSave = async (keys) => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const upserts = keys.map(key => ({ key, value: settings[key] ?? '' }))
      const { error: err } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
      if (err) throw err
      invalidateSettingsCache()
      // If we were in preview, exit it now (changes are saved)
      if (previewMode) {
        setPreviewMode(false)
        originalSettingsRef.current = null
      }
      setSuccess('Saved! Changes are now live.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  // ── Preview Mode controls ────────────────────────────────────
  const startPreview = () => {
    // Store current saved state so Cancel can restore it
    originalSettingsRef.current = { ...settings }
    setPreviewMode(true)
    // Apply CSS vars immediately
    applyCSS(settings)
  }

  const cancelPreview = () => {
    if (originalSettingsRef.current) {
      // Restore settings to what they were before preview
      setSettings(originalSettingsRef.current)
      // Restore CSS vars from original settings
      applyCSS(originalSettingsRef.current)
    }
    setPreviewMode(false)
    originalSettingsRef.current = null
  }

  const applyChanges = async () => {
    // "Apply Changes" = save colors+fonts then exit preview
    const keys = [...COLOR_FIELDS.map(f => f.key), ...FONT_FIELDS.map(f => f.key)]
    await handleSave(keys)
  }

  // ── Reset to Default Theme ───────────────────────────────────
  const handleResetToDefault = async () => {
    setResetting(true); setError('')
    try {
      const upserts = Object.entries(DEFAULT_THEME).map(([key, value]) => ({ key, value }))
      const { error: err } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
      if (err) throw err
      // Apply to local state and CSS vars immediately
      setSettings(s => ({ ...s, ...DEFAULT_THEME }))
      applyCSS(DEFAULT_THEME)
      if (previewMode) { setPreviewMode(false); originalSettingsRef.current = null }
      invalidateSettingsCache()
      setShowResetConfirm(false)
      setSuccess('Theme reset to default! All colors and fonts restored.')
      setTimeout(() => setSuccess(''), 4000)
    } catch (e) { setError('Reset failed: ' + e.message) }
    finally { setResetting(false) }
  }

  // Key groups (unchanged)
  const heroKeys  = ['homepage_heading', 'homepage_subheading', 'homepage_align']
  const colorKeys = COLOR_FIELDS.map(f => f.key)
  const fontKeys  = FONT_FIELDS.map(f => f.key)
  const waKeys    = ['whatsapp_number', 'whatsapp_message', 'floating_whatsapp_enabled', 'footer_whatsapp_enabled']

  const colorSections = [...new Set(COLOR_FIELDS.map(f => f.section))]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      {/* ── Preview Mode Banner ─────────────────────────────── */}
      {previewMode && (
        <div className="fixed top-0 left-56 right-0 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <Eye size={16} />
            <span className="text-sm font-semibold">Preview Mode Active</span>
            <span className="text-purple-200 text-xs">— Changes are NOT saved yet</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={cancelPreview}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-all">
              <X size={13} /> Cancel Preview
            </button>
            <button onClick={applyChanges} disabled={saving}
              className="flex items-center gap-1.5 bg-white text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all">
              <Check size={13} /> {saving ? 'Saving…' : 'Apply Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Reset Confirmation Modal ───────────────────────── */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowResetConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fadeInUp">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <RotateCcw size={22} className="text-orange-600" />
            </div>
            <h3 className="font-display text-lg font-bold text-gray-800 text-center mb-2">Reset to Default Theme?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              This will restore all colors and fonts to their original defaults.
              Any custom theme changes will be lost.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleResetToDefault} disabled={resetting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2">
                <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
                {resetting ? 'Resetting…' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className={`ml-56 flex-1 p-8 max-w-5xl ${previewMode ? 'mt-12' : ''}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Site Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Customize homepage content, colors, fonts and WhatsApp</p>
          </div>
          <button onClick={fetchSettings} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 mb-6 shadow-sm">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}>
                <Icon size={15} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Status messages */}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm animate-fadeInUp">✅ {success}</div>}
        {error   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">❌ {error}</div>}

        {/* ── TAB: Hero Text (unchanged logic) ── */}
        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-800 mb-2">Hero Banner Text</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Heading <span className="text-xs text-gray-400">(use Enter for line breaks)</span>
                </label>
                <textarea rows={3} value={settings.homepage_heading}
                  onChange={e => set('homepage_heading', e.target.value)}
                  className="input-gold resize-none font-display text-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
                <textarea rows={3} value={settings.homepage_subheading}
                  onChange={e => set('homepage_subheading', e.target.value)}
                  className="input-gold resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Alignment</label>
                <div className="flex gap-2">
                  {[
                    { val: 'left',   Icon: AlignLeft,   label: 'Left' },
                    { val: 'center', Icon: AlignCenter, label: 'Center' },
                    { val: 'right',  Icon: AlignRight,  label: 'Right' },
                  ].map(({ val, Icon, label }) => (
                    <button key={val} onClick={() => set('homepage_align', val)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${
                        settings.homepage_align === val ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-200 text-gray-600 hover:border-yellow-400'
                      }`}>
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={() => handleSave(heroKeys)} disabled={saving}
                className="btn-gold w-full flex items-center justify-center gap-2">
                <Save size={15} /> {saving ? 'Saving…' : 'Save Hero Text'}
              </button>
            </div>
            {/* Live preview */}
            <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 rounded-2xl p-6 flex flex-col justify-center">
              <p className="text-yellow-400 text-xs uppercase tracking-widest mb-3 font-semibold">✦ Live Preview</p>
              <div className={settings.homepage_align === 'center' ? 'text-center' : settings.homepage_align === 'right' ? 'text-right' : 'text-left'}>
                <h2 className="font-display text-2xl font-bold text-white leading-tight whitespace-pre-line mb-3">
                  {settings.homepage_heading || 'Your Heading'}
                </h2>
                <p className="text-gray-300 text-sm leading-relaxed">{settings.homepage_subheading || 'Your subheading'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Colors ── */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            {/* Color action bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700 mr-auto">Section Colors</span>

                {!previewMode ? (
                  <button onClick={startPreview}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-all">
                    <Eye size={14} /> Preview Theme
                  </button>
                ) : (
                  <button onClick={cancelPreview}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
                    <EyeOff size={14} /> Cancel Preview
                  </button>
                )}

                {previewMode && (
                  <button onClick={applyChanges} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all">
                    <Check size={14} /> {saving ? 'Saving…' : 'Apply Changes'}
                  </button>
                )}

                {!previewMode && (
                  <button onClick={() => handleSave(colorKeys)} disabled={saving}
                    className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                    <Save size={14} /> {saving ? 'Saving…' : 'Save Colors'}
                  </button>
                )}

                <button onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100 transition-all">
                  <RotateCcw size={14} /> Reset to Default
                </button>
              </div>
            </div>

            {/* Color pickers by section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              {colorSections.map(section => (
                <div key={section}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{section}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COLOR_FIELDS.filter(f => f.section === section).map(field => (
                      <div key={field.key} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-yellow-200 transition-colors">
                        <input type="color" value={settings[field.key] || '#ffffff'}
                          onChange={e => set(field.key, e.target.value)}
                          className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 block flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">{field.label}</p>
                          <input className="text-xs text-gray-500 font-mono bg-transparent border-none outline-none w-full"
                            value={settings[field.key] || '#ffffff'}
                            onChange={e => set(field.key, e.target.value)} />
                        </div>
                        <div className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0 shadow-inner"
                          style={{ backgroundColor: settings[field.key] || '#fff' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Reset to Default — bottom button (additional placement) */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-900">Reset to Default Theme</p>
                <p className="text-xs text-orange-600 mt-0.5">Restores all colors and fonts to original Himaya defaults</p>
              </div>
              <button onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all shadow-sm">
                <RotateCcw size={14} /> Reset to Default
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: Fonts ── */}
        {activeTab === 'fonts' && (
          <div className="space-y-5">
            {/* Font action bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700 mr-auto">Section Fonts</span>

                {!previewMode ? (
                  <button onClick={startPreview}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 text-sm font-medium hover:bg-purple-100 transition-all">
                    <Eye size={14} /> Preview Theme
                  </button>
                ) : (
                  <button onClick={cancelPreview}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
                    <EyeOff size={14} /> Cancel Preview
                  </button>
                )}

                {previewMode && (
                  <button onClick={applyChanges} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-all">
                    <Check size={14} /> {saving ? 'Saving…' : 'Apply Changes'}
                  </button>
                )}

                {!previewMode && (
                  <button onClick={() => handleSave(fontKeys)} disabled={saving}
                    className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                    <Save size={14} /> {saving ? 'Saving…' : 'Save Fonts'}
                  </button>
                )}

                <button onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 text-sm font-medium hover:bg-orange-100 transition-all">
                  <RotateCcw size={14} /> Reset to Default
                </button>
              </div>
            </div>

            {/* Font selectors */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              {FONT_FIELDS.map(field => (
                <div key={field.key} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-2">{field.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {FONTS.map(font => (
                        <button key={font} onClick={() => set(field.key, font)}
                          style={{ fontFamily: `${font}, sans-serif` }}
                          className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                            settings[field.key] === font
                              ? 'border-yellow-500 bg-yellow-50 text-yellow-700 font-semibold'
                              : 'border-gray-200 text-gray-600 hover:border-yellow-300'
                          }`}>
                          {font}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Preview</p>
                    <p className="text-lg font-semibold text-gray-800"
                      style={{ fontFamily: `${settings[field.key] || 'Inter'}, sans-serif` }}>
                      Aa Bb 123
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reset to Default — bottom button */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-900">Reset to Default Theme</p>
                <p className="text-xs text-orange-600 mt-0.5">Restores all colors and fonts to original Himaya defaults</p>
              </div>
              <button onClick={() => setShowResetConfirm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-all shadow-sm">
                <RotateCcw size={14} /> Reset to Default
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: WhatsApp ── */}
        {activeTab === 'whatsapp' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="font-semibold text-gray-800">WhatsApp Settings</h2>

              {/* Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <div className="flex gap-2 items-center">
                  <span className="text-gray-500 text-sm font-mono bg-gray-100 px-3 py-2.5 rounded-xl">+</span>
                  <input className="input-gold flex-1 font-mono"
                    value={settings.whatsapp_number} placeholder="919558285403"
                    onChange={e => set('whatsapp_number', e.target.value.replace(/\D/g, ''))} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Country code + number, digits only. Example: 919558285403</p>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Message</label>
                <textarea rows={3} className="input-gold resize-none"
                  value={settings.whatsapp_message}
                  onChange={e => set('whatsapp_message', e.target.value)}
                  placeholder="Hello! I'm interested in your jewelry." />
              </div>

              {/* ── Floating WhatsApp Button toggle (NEW) */}
              <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Floating WhatsApp Button</p>
                  <p className="text-xs text-gray-500 mt-0.5">Round button on all pages (bottom-right)</p>
                </div>
                <Toggle
                  id="toggle-floating-wa"
                  checked={settings.floating_whatsapp_enabled !== 'false'}
                  onChange={e => set('floating_whatsapp_enabled', e.target.checked ? 'true' : 'false')}
                />
              </div>

              {/* ── Footer WhatsApp Link toggle (NEW) */}
              <div className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Footer WhatsApp Link</p>
                  <p className="text-xs text-gray-500 mt-0.5">WhatsApp button in the footer contact section</p>
                </div>
                <Toggle
                  id="toggle-footer-wa"
                  checked={settings.footer_whatsapp_enabled !== 'false'}
                  onChange={e => set('footer_whatsapp_enabled', e.target.checked ? 'true' : 'false')}
                />
              </div>

              <button onClick={() => handleSave(waKeys)} disabled={saving}
                className="btn-gold w-full flex items-center justify-center gap-2">
                <Save size={15} /> {saving ? 'Saving…' : 'Save WhatsApp Settings'}
              </button>
            </div>

            {/* Live Preview panel */}
            <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4 min-h-[340px]">
              <p className="text-yellow-400 text-xs uppercase tracking-widest font-semibold">✦ Preview</p>

              <div className="space-y-3">
                {/* Floating button preview */}
                <div className={`p-4 rounded-xl transition-all ${settings.floating_whatsapp_enabled !== 'false' ? 'bg-gray-800' : 'bg-gray-800/40 opacity-40'}`}>
                  <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Floating Button</p>
                  <div className="flex items-center gap-3">
                    {settings.floating_whatsapp_enabled !== 'false' ? (
                      <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                        💬 WhatsApp Us
                      </div>
                    ) : (
                      <span className="text-red-400 text-sm font-medium">● Disabled</span>
                    )}
                  </div>
                </div>

                {/* Footer link preview */}
                <div className={`p-4 rounded-xl transition-all ${settings.footer_whatsapp_enabled !== 'false' ? 'bg-gray-800' : 'bg-gray-800/40 opacity-40'}`}>
                  <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Footer Link</p>
                  {settings.footer_whatsapp_enabled !== 'false' ? (
                    <div className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium w-fit">
                      📞 WhatsApp Us
                    </div>
                  ) : (
                    <span className="text-red-400 text-sm font-medium">● Disabled</span>
                  )}
                </div>

                {/* Number preview */}
                <div className="p-4 bg-gray-800 rounded-xl">
                  <p className="text-gray-400 text-xs mb-1">Number</p>
                  <p className="text-white font-mono text-sm">+{settings.whatsapp_number || '91XXXXXXXXXX'}</p>
                </div>

                {/* Message preview */}
                <div className="p-4 bg-gray-800 rounded-xl">
                  <p className="text-gray-400 text-xs mb-1">Default Message</p>
                  <p className="text-white text-sm italic">"{settings.whatsapp_message || 'Hello!'}"</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
