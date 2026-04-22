import { useState, useEffect, useCallback } from 'react'
import { Save, RefreshCw, AlignLeft, AlignCenter, AlignRight, Palette, MessageCircle, RotateCcw, AlertTriangle, X, Phone, Mail } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase } from '../../lib/supabase'
import { invalidateSettingsCache, DEFAULTS } from '../../hooks/useSiteSettings'

// ── Color sections config ──────────────────────────────────
const COLOR_FIELDS = [
  { key: 'header_bg_color',       label: 'Header Background',      section: 'Header' },
  { key: 'header_text_color',     label: 'Header Text Color',      section: 'Header' },
  { key: 'footer_bg_color',       label: 'Footer Background',      section: 'Footer' },
  { key: 'footer_text_color',     label: 'Footer Text Color',      section: 'Footer' },
  { key: 'banner_bg_color',       label: 'Banner Background',      section: 'Banners' },
  { key: 'banner_text_color',     label: 'Banner Text Color',      section: 'Banners' },
  { key: 'category_bg_color',     label: 'Category Section BG',    section: 'Shop' },
  { key: 'product_card_bg_color', label: 'Product Card Background', section: 'Shop' },
  { key: 'button_color',          label: 'Button Color',           section: 'Buttons' },
]

const COLOR_SECTIONS = [...new Set(COLOR_FIELDS.map(f => f.section))]

// Validates hex color — returns value or fallback
function safeHex(val, fallback) {
  if (!val) return fallback
  return /^#[0-9a-fA-F]{3,6}$/.test(val.trim()) ? val.trim() : fallback
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

const TABS = [
  { id: 'hero',     label: 'Hero Text',  icon: AlignLeft },
  { id: 'colors',   label: 'Colors',     icon: Palette },
  { id: 'whatsapp', label: 'WhatsApp',   icon: MessageCircle },
  { id: 'email',    label: 'Email',      icon: Mail },
]

// ── Confirmation modal ─────────────────────────────────────
function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fadeInUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Reset All Settings?</h3>
            <p className="text-sm text-gray-500">This will restore all colors and settings to default. This cannot be undone.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-colors">
            Yes, Reset
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────
export default function AdminSiteSettings() {
  const [activeTab, setActiveTab]     = useState('hero')
  const [settings, setSettings]       = useState({ ...DEFAULTS })
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [resetting, setResetting]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [success, setSuccess]         = useState('')
  const [error, setError]             = useState('')

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('site_settings').select('key, value')
      if (data) {
        const map = Object.fromEntries(data.map(r => [r.key, r.value]))
        setSettings(s => ({ ...s, ...map }))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const flash = (msg, isError = false) => {
    if (isError) { setError(msg); setTimeout(() => setError(''), 4000) }
    else         { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }
  }

  // Save specific keys to Supabase
  const handleSave = async (keys) => {
    setSaving(true); setError('')
    try {
      const upserts = keys.map(key => ({ key, value: settings[key] ?? '' }))
      const { error: err } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
      if (err) throw err
      invalidateSettingsCache()
      flash('Saved! Changes are live on the site.')
    } catch (e) { flash('Save failed: ' + e.message, true) }
    finally { setSaving(false) }
  }

  // Reset ALL settings to defaults stored in DB (default_* keys)
  const handleReset = async () => {
    setShowConfirm(false)
    setResetting(true)
    try {
      // Fetch default values from DB
      const { data: defData } = await supabase
        .from('site_settings')
        .select('key, value')
        .like('key', 'default_%')

      // Build reset upserts
      const resetUpserts = [
        { key: 'header_bg_color',       value: '#ffffff' },
        { key: 'header_text_color',     value: '#374151' },
        { key: 'banner_bg_color',       value: '#7c2d12' },
        { key: 'banner_text_color',     value: '#ffffff' },
        { key: 'category_bg_color',     value: '#fffbeb' },
        { key: 'product_card_bg_color', value: '#ffffff' },
        { key: 'button_color',          value: '#f59e0b' },
        { key: 'footer_bg_color',       value: '#111827' },
        { key: 'footer_text_color',     value: '#9ca3af' },
        { key: 'whatsapp_number',       value: '919558285403' },
        { key: 'homepage_heading',      value: 'Where Every Piece Tells a Story' },
        { key: 'homepage_subheading',   value: 'Discover our exquisite collection crafted to make you shine at every occasion.' },
        { key: 'homepage_align',        value: 'left' },
      ]

      // Override with DB defaults if they exist
      if (defData) {
        defData.forEach(row => {
          const activeKey = row.key.replace('default_', '').replace('_bg', '_bg_color').replace('_text', '_text_color').replace('product_bg', 'product_card_bg_color').replace('button_color', 'button_color')
          const found = resetUpserts.find(u => u.key === activeKey)
          if (found) found.value = row.value
        })
      }

      const { error: err } = await supabase.from('site_settings').upsert(resetUpserts, { onConflict: 'key' })
      if (err) throw err

      invalidateSettingsCache()
      await fetchSettings()  // reload UI
      flash('All settings reset to defaults successfully.')
    } catch (e) { flash('Reset failed: ' + e.message, true) }
    finally { setResetting(false) }
  }

  const heroKeys  = ['homepage_heading', 'homepage_subheading', 'homepage_align']
  const colorKeys = COLOR_FIELDS.map(f => f.key)
  const waKeys    = ['whatsapp_number', 'whatsapp_order_template']
  const emailKeys = ['business_email', 'emailjs_service_id', 'emailjs_template_id', 'emailjs_customer_template_id', 'emailjs_public_key']

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8 max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Site Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Customise colors, homepage text, and WhatsApp contact</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchSettings} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            {/* Reset All button */}
            <button onClick={() => setShowConfirm(true)} disabled={resetting}
              id="reset-all-settings-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all">
              <RotateCcw size={14} className={resetting ? 'animate-spin' : ''} />
              {resetting ? 'Resetting…' : 'Reset All to Default'}
            </button>
          </div>
        </div>

        {/* Status messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between animate-fadeInUp">
            <span>✅ {success}</span>
            <button onClick={() => setSuccess('')}><X size={14} /></button>
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>❌ {error}</span>
            <button onClick={() => setError('')}><X size={14} /></button>
          </div>
        )}

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

        {/* ── TAB: Hero Text ── */}
        {activeTab === 'hero' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-800">Hero Banner Text</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Heading
                </label>
                <textarea rows={3} value={settings.homepage_heading || ''}
                  onChange={e => set('homepage_heading', e.target.value)}
                  className="input-gold resize-none font-display text-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
                <textarea rows={3} value={settings.homepage_subheading || ''}
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
            <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 rounded-2xl p-6 flex flex-col justify-center min-h-[280px]">
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
              <div>
                <h2 className="font-semibold text-gray-800">Section Colors</h2>
                <p className="text-xs text-gray-400 mt-0.5">Changes are applied live when saved. Invalid hex values are ignored.</p>
              </div>
              <button onClick={() => handleSave(colorKeys)} disabled={saving}
                className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                <Save size={14} /> {saving ? 'Saving…' : 'Save Colors'}
              </button>
            </div>
            <div className="space-y-7">
              {COLOR_SECTIONS.map(section => (
                <div key={section}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 pb-1 border-b border-gray-100">
                    {section}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COLOR_FIELDS.filter(f => f.section === section).map(field => {
                      const rawVal  = settings[field.key] || DEFAULTS[field.key] || '#ffffff'
                      const safeVal = safeHex(rawVal, DEFAULTS[field.key] || '#ffffff')
                      return (
                        <div key={field.key} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-yellow-200 transition-colors">
                          <input type="color" value={safeVal}
                            onChange={e => set(field.key, e.target.value)}
                            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700">{field.label}</p>
                            <input
                              className="text-xs text-gray-500 font-mono bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5 w-28 mt-0.5 focus:outline-none focus:border-yellow-400"
                              value={rawVal}
                              maxLength={7}
                              onChange={e => set(field.key, e.target.value)} />
                          </div>
                          {/* Preview swatch */}
                          <div className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0 shadow-inner"
                            style={{ backgroundColor: safeVal }} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: WhatsApp ── */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <h2 className="font-semibold text-gray-800">WhatsApp Settings</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-500 text-sm font-mono bg-gray-100 px-3 py-2.5 rounded-xl">+</span>
                    <input className="input-gold flex-1 font-mono"
                      value={settings.whatsapp_number || ''}
                      placeholder="919558285403"
                      onChange={e => set('whatsapp_number', e.target.value.replace(/\D/g, ''))} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Country code + number, digits only. Example: 919558285403</p>
                </div>
                <button onClick={() => handleSave(waKeys)} disabled={saving}
                  className="btn-gold w-full flex items-center justify-center gap-2">
                  <Save size={15} /> {saving ? 'Saving…' : 'Save WhatsApp Settings'}
                </button>
              </div>
              {/* Preview */}
              <div className="bg-gray-900 rounded-2xl p-6 flex flex-col justify-center min-h-[200px]">
                <p className="text-yellow-400 text-xs uppercase tracking-widest mb-4 font-semibold">✦ Footer Link Preview</p>
                <div className="space-y-3">
                  <div className="bg-gray-800 rounded-xl p-3">
                    <p className="text-gray-400 text-xs mb-1">wa.me URL</p>
                    <p className="text-green-400 text-sm font-mono break-all">
                      https://wa.me/{(settings.whatsapp_number || '919558285403').replace(/\D/g, '')}
                    </p>
                  </div>
                  <a href={`https://wa.me/${(settings.whatsapp_number || '919558285403').replace(/\D/g, '')}`}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    <Phone size={14} /> Test WhatsApp Link
                  </a>
                </div>
              </div>
            </div>

            {/* Order notification message template */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-1">Order Notification Message Template</h2>
              <p className="text-xs text-gray-400 mb-4">
                This message is sent to your WhatsApp when a customer places an order.
                Use these placeholders: <code className="bg-gray-100 px-1 rounded">{'{order_id}'}</code> <code className="bg-gray-100 px-1 rounded">{'{customer_name}'}</code> <code className="bg-gray-100 px-1 rounded">{'{phone}'}</code> <code className="bg-gray-100 px-1 rounded">{'{address}'}</code> <code className="bg-gray-100 px-1 rounded">{'{product_list}'}</code> <code className="bg-gray-100 px-1 rounded">{'{total}'}</code>
              </p>
              <textarea rows={10}
                className="input-gold resize-none font-mono text-sm w-full"
                value={settings.whatsapp_order_template || DEFAULT_WA_TEMPLATE}
                onChange={e => set('whatsapp_order_template', e.target.value)}
                placeholder={DEFAULT_WA_TEMPLATE} />
              <div className="flex items-center justify-between mt-3">
                <button onClick={() => set('whatsapp_order_template', DEFAULT_WA_TEMPLATE)}
                  className="text-xs text-gray-400 hover:text-yellow-600 transition-colors underline">
                  Reset to default template
                </button>
                <button onClick={() => handleSave(waKeys)} disabled={saving}
                  className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
                  <Save size={14} /> {saving ? 'Saving…' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: Email ── */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            {/* Business Email */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h2 className="font-semibold text-gray-800">Business Email</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input className="input-gold pl-9"
                    type="email"
                    placeholder="support@himayajewels.com"
                    value={settings.business_email || ''}
                    onChange={e => set('business_email', e.target.value)} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Order notification emails will be sent to this address.</p>
              </div>
            </div>

            {/* EmailJS Config */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <div>
                <h2 className="font-semibold text-gray-800">EmailJS Configuration</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create a free account at{' '}
                  <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="text-yellow-600 underline">emailjs.com</a>.
                  Add a Gmail/SMTP service, create two email templates, then paste the IDs below.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Service ID</label>
                  <input className="input-gold font-mono text-sm"
                    placeholder="service_xxxxxxx"
                    value={settings.emailjs_service_id || ''}
                    onChange={e => set('emailjs_service_id', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Admin Template ID</label>
                  <input className="input-gold font-mono text-sm"
                    placeholder="template_xxxxxxx"
                    value={settings.emailjs_template_id || ''}
                    onChange={e => set('emailjs_template_id', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Customer Template ID</label>
                  <input className="input-gold font-mono text-sm"
                    placeholder="template_xxxxxxx"
                    value={settings.emailjs_customer_template_id || ''}
                    onChange={e => set('emailjs_customer_template_id', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Public Key</label>
                  <input className="input-gold font-mono text-sm"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxx"
                    value={settings.emailjs_public_key || ''}
                    onChange={e => set('emailjs_public_key', e.target.value)} />
                </div>
              </div>

              <button onClick={() => handleSave(emailKeys)} disabled={saving}
                className="btn-gold w-full flex items-center justify-center gap-2">
                <Save size={15} /> {saving ? 'Saving…' : 'Save Email Settings'}
              </button>
            </div>

            {/* Setup guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2"><Mail size={16} /> EmailJS Setup Guide</h3>
              <ol className="text-sm text-blue-700 space-y-1.5 list-decimal list-inside">
                <li>Go to <a href="https://www.emailjs.com" target="_blank" rel="noreferrer" className="underline font-medium">emailjs.com</a> and create a free account</li>
                <li>Add an Email Service (Gmail, Outlook, or SMTP)</li>
                <li>Create an <strong>Admin Order Template</strong> — variables: <code className="bg-blue-100 px-1 rounded text-xs">{'{{order_id}}'}</code> <code className="bg-blue-100 px-1 rounded text-xs">{'{{customer_name}}'}</code> <code className="bg-blue-100 px-1 rounded text-xs">{'{{product_list}}'}</code> <code className="bg-blue-100 px-1 rounded text-xs">{'{{total}}'}</code> <code className="bg-blue-100 px-1 rounded text-xs">{'{{address}}'}</code></li>
                <li>Create a <strong>Customer Confirmation Template</strong> — variables: <code className="bg-blue-100 px-1 rounded text-xs">{'{{customer_name}}'}</code> <code className="bg-blue-100 px-1 rounded text-xs">{'{{order_id}}'}</code> <code className="bg-blue-100 px-1 rounded text-xs">{'{{product_list}}'}</code> <code className="bg-blue-100 px-1 rounded text-xs">{'{{total}}'}</code></li>
                <li>Copy Service ID, both Template IDs, and Public Key → paste above</li>
              </ol>
              <p className="text-xs text-blue-600 mt-3">Free tier: 200 emails/month. No credit card required.</p>
            </div>
          </div>
        )}
      </main>

      {/* Reset confirmation modal */}
      {showConfirm && <ConfirmModal onConfirm={handleReset} onCancel={() => setShowConfirm(false)} />}
    </div>
  )
}
