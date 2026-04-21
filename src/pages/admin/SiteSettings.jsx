import { useState, useEffect, useCallback } from 'react'
import { Save, RefreshCw, AlignLeft, AlignCenter, AlignRight, Palette, Type, MessageCircle } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase } from '../../lib/supabase'
import { invalidateSettingsCache } from '../../hooks/useSiteSettings'

// ── Constants ──────────────────────────────────────────────
const FONTS = ['Inter', 'Poppins', 'Roboto', 'Playfair Display', 'Montserrat']

const COLOR_FIELDS = [
  { key: 'color_navbar_bg',        label: 'Header Background',     section: 'Header' },
  { key: 'color_navbar_text',      label: 'Header Text',           section: 'Header' },
  { key: 'color_footer_bg',        label: 'Footer Background',     section: 'Footer' },
  { key: 'color_footer_text',      label: 'Footer Text',           section: 'Footer' },
  { key: 'color_hero_bg',          label: 'Hero Banner Background', section: 'Hero' },
  { key: 'color_banner_bg',        label: 'Promo Banner Background',section: 'Banners' },
  { key: 'color_banner_text',      label: 'Promo Banner Text',     section: 'Banners' },
  { key: 'color_category_bg',      label: 'Category Section BG',   section: 'Shop' },
  { key: 'color_product_card_bg',  label: 'Product Card Background',section: 'Shop' },
  { key: 'color_btn_primary',      label: 'Primary Button Color',  section: 'Buttons' },
  { key: 'color_btn_primary_text', label: 'Primary Button Text',   section: 'Buttons' },
]

const FONT_FIELDS = [
  { key: 'font_heading',       label: 'Heading / Title Font' },
  { key: 'font_body',          label: 'Body Text Font' },
  { key: 'font_product_title', label: 'Product Name Font' },
  { key: 'font_price',         label: 'Price Font' },
  { key: 'font_footer',        label: 'Footer Font' },
]

const HERO_DEFAULTS = {
  homepage_heading:    'Where Every\nPiece Tells\na Story',
  homepage_subheading: 'Discover our exquisite collection crafted to make you shine at every occasion.',
  homepage_align:      'left',
}

const COLOR_DEFAULTS = Object.fromEntries(COLOR_FIELDS.map(f => [f.key, '#ffffff']))
const FONT_DEFAULTS  = Object.fromEntries(FONT_FIELDS.map(f => [f.key, 'Inter']))
const WA_DEFAULTS    = { whatsapp_number: '919558285403', whatsapp_enabled: 'true', whatsapp_message: "Hello! I'm interested in your jewelry collection." }

// ── Component ──────────────────────────────────────────────
const TABS = [
  { id: 'hero',      label: 'Hero Text',   icon: AlignLeft },
  { id: 'colors',    label: 'Colors',      icon: Palette },
  { id: 'fonts',     label: 'Fonts',       icon: Type },
  { id: 'whatsapp',  label: 'WhatsApp',    icon: MessageCircle },
]

export default function AdminSiteSettings() {
  const [activeTab, setActiveTab] = useState('hero')
  const [settings, setSettings]   = useState({ ...HERO_DEFAULTS, ...COLOR_DEFAULTS, ...FONT_DEFAULTS, ...WA_DEFAULTS })
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('site_settings').select('key, value')
      if (data) setSettings(s => ({ ...s, ...Object.fromEntries(data.map(r => [r.key, r.value])) }))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const handleSave = async (keys) => {
    setSaving(true); setError(''); setSuccess('')
    try {
      const upserts = keys.map(key => ({ key, value: settings[key] ?? '' }))
      const { error: err } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
      if (err) throw err
      invalidateSettingsCache()   // force refresh in other components
      setSuccess('Saved successfully! Changes are live.')
      setTimeout(() => setSuccess(''), 3000)
    } catch (e) { setError('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  const heroKeys    = ['homepage_heading', 'homepage_subheading', 'homepage_align']
  const colorKeys   = COLOR_FIELDS.map(f => f.key)
  const fontKeys    = FONT_FIELDS.map(f => f.key)
  const waKeys      = ['whatsapp_number', 'whatsapp_enabled', 'whatsapp_message']

  // Group color fields by section
  const colorSections = [...new Set(COLOR_FIELDS.map(f => f.section))]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8 max-w-5xl">
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
                  activeTab === tab.id
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}>
                <Icon size={15} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* Status messages */}
        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm animate-fadeInUp">✅ {success}</div>}
        {error   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">❌ {error}</div>}

        {/* ── TAB: Hero Text ── */}
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
                  {[{ val:'left', Icon:AlignLeft, label:'Left' }, { val:'center', Icon:AlignCenter, label:'Center' }, { val:'right', Icon:AlignRight, label:'Right' }].map(({ val, Icon, label }) => (
                    <button key={val} onClick={() => set('homepage_align', val)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${settings.homepage_align === val ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-200 text-gray-600 hover:border-yellow-400'}`}>
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
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Section Colors</h2>
              <button onClick={() => handleSave(colorKeys)} disabled={saving}
                className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                <Save size={14} /> {saving ? 'Saving…' : 'Save Colors'}
              </button>
            </div>
            <div className="space-y-6">
              {colorSections.map(section => (
                <div key={section}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{section}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COLOR_FIELDS.filter(f => f.section === section).map(field => (
                      <div key={field.key} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                        <div className="relative">
                          <input type="color" value={settings[field.key] || '#ffffff'}
                            onChange={e => set(field.key, e.target.value)}
                            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 block" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700">{field.label}</p>
                          <input className="text-xs text-gray-500 font-mono bg-transparent border-none outline-none w-full"
                            value={settings[field.key] || '#ffffff'} onChange={e => set(field.key, e.target.value)} />
                        </div>
                        {/* Swatch */}
                        <div className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: settings[field.key] || '#fff' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: Fonts ── */}
        {activeTab === 'fonts' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-800">Section Fonts</h2>
              <button onClick={() => handleSave(fontKeys)} disabled={saving}
                className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                <Save size={14} /> {saving ? 'Saving…' : 'Save Fonts'}
              </button>
            </div>
            <div className="space-y-4">
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
                  {/* Live preview of selected font */}
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
          </div>
        )}

        {/* ── TAB: WhatsApp ── */}
        {activeTab === 'whatsapp' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-800 mb-2">WhatsApp Settings</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <div className="flex gap-2 items-center">
                  <span className="text-gray-500 text-sm font-mono bg-gray-100 px-3 py-2.5 rounded-xl">+</span>
                  <input className="input-gold flex-1 font-mono"
                    value={settings.whatsapp_number} placeholder="919558285403"
                    onChange={e => set('whatsapp_number', e.target.value.replace(/\D/g, ''))} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Include country code, no spaces or dashes. Example: 919558285403</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Message</label>
                <textarea rows={3} className="input-gold resize-none"
                  value={settings.whatsapp_message}
                  onChange={e => set('whatsapp_message', e.target.value)}
                  placeholder="Hello! I'm interested in your jewelry." />
              </div>

              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-gray-700">Show WhatsApp Button</p>
                  <p className="text-xs text-gray-400">Enables floating button + footer WhatsApp link</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={settings.whatsapp_enabled !== 'false'}
                    onChange={e => set('whatsapp_enabled', e.target.checked ? 'true' : 'false')}
                    className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>

              <button onClick={() => handleSave(waKeys)} disabled={saving}
                className="btn-gold w-full flex items-center justify-center gap-2">
                <Save size={15} /> {saving ? 'Saving…' : 'Save WhatsApp Settings'}
              </button>
            </div>

            {/* Preview */}
            <div className="bg-gray-900 rounded-2xl p-6 flex flex-col justify-center min-h-[280px]">
              <p className="text-yellow-400 text-xs uppercase tracking-widest mb-4 font-semibold">✦ Preview</p>
              {settings.whatsapp_enabled !== 'false' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-full w-fit font-medium text-sm">
                    <span>💬</span> WhatsApp Us
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Number</p>
                    <p className="text-white font-mono text-sm">+{settings.whatsapp_number || '91XXXXXXXXXX'}</p>
                  </div>
                  <div className="bg-gray-800 rounded-2xl p-4">
                    <p className="text-gray-400 text-xs mb-1">Default Message</p>
                    <p className="text-white text-sm italic">"{settings.whatsapp_message || 'Hello!'}"</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <p className="text-4xl mb-2">💬</p>
                  <p className="text-sm">WhatsApp button is DISABLED</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
