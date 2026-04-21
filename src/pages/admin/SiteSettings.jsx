import { useState, useEffect, useCallback } from 'react'
import { Save, RefreshCw, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

const DEFAULTS = {
  homepage_heading:    'Where Every\nPiece Tells\na Story',
  homepage_subheading: 'Discover our exquisite collection of bangles, earrings, and combo sets — crafted to make you shine at every occasion.',
  homepage_align:      'left',
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState(DEFAULTS)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')

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

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      const upserts = Object.entries(settings).map(([key, value]) => ({ key, value }))
      const { error: err } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
      if (err) throw err
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError('Save failed: ' + e.message)
    } finally { setSaving(false) }
  }

  const set = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  if (!isSupabaseConfigured) return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8 flex items-center justify-center">
        <p className="text-gray-400">Supabase not configured.</p>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Site Settings</h1>
            <p className="text-gray-400 text-sm mt-1">Edit homepage content — changes appear live on the website</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchSettings} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button onClick={handleSave} disabled={saving}
              className="btn-gold flex items-center gap-2 px-5 py-2">
              <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">✅ Settings saved successfully!</div>}
        {error   && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">❌ {error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Hero Banner Text</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Heading <span className="text-xs text-gray-400">(use ↵ for line breaks)</span>
                </label>
                <textarea rows={3}
                  value={settings.homepage_heading}
                  onChange={e => set('homepage_heading', e.target.value)}
                  className="input-gold resize-none font-display text-lg"
                  placeholder="Where Every&#10;Piece Tells&#10;a Story" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subheading</label>
                <textarea rows={3}
                  value={settings.homepage_subheading}
                  onChange={e => set('homepage_subheading', e.target.value)}
                  className="input-gold resize-none"
                  placeholder="Discover our collection…" />
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
                        settings.homepage_align === val
                          ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'border-gray-200 text-gray-600 hover:border-yellow-400'
                      }`}>
                      <Icon size={14} /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 rounded-2xl p-6 flex flex-col justify-center">
            <p className="text-yellow-400 text-xs uppercase tracking-widest mb-2 font-semibold">✦ Preview</p>
            <div className={`${settings.homepage_align === 'center' ? 'text-center' : settings.homepage_align === 'right' ? 'text-right' : 'text-left'}`}>
              <h2 className="font-display text-2xl font-bold text-white leading-tight whitespace-pre-line mb-3">
                {settings.homepage_heading || 'Your Heading'}
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                {settings.homepage_subheading || 'Your subheading text'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
