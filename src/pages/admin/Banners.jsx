import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff, RefreshCw } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase } from '../../lib/supabase'

const emptyForm = { heading: '', subtext: '', image_url: '', bg_color: '#7c2d12', text_color: '#ffffff', is_active: true, sort_order: 0 }

export default function AdminBanners() {
  const [banners, setBanners]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [modalError, setModalError] = useState('')

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('banners').select('*').order('sort_order')
      setBanners(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchBanners() }, [fetchBanners])

  const openAdd  = () => { setForm(emptyForm); setEditingId(null); setModalError(''); setShowModal(true) }
  const openEdit = (b) => { setForm({ ...b }); setEditingId(b.id); setModalError(''); setShowModal(true) }

  const handleSave = async () => {
    if (!form.heading.trim()) { setModalError('Heading is required'); return }
    setSaving(true); setModalError('')
    try {
      if (editingId) {
        const { error } = await supabase.from('banners').update(form).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('banners').insert([form])
        if (error) throw error
      }
      setShowModal(false)
      await fetchBanners()
    } catch (e) { setModalError('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await supabase.from('banners').delete().eq('id', id)
    setDeleteConfirm(null)
    await fetchBanners()
  }

  const toggleActive = async (b) => {
    await supabase.from('banners').update({ is_active: !b.is_active }).eq('id', b.id)
    setBanners(bs => bs.map(x => x.id === b.id ? { ...x, is_active: !x.is_active } : x))
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Banners</h1>
            <p className="text-gray-400 text-sm mt-1">Manage homepage banner slides</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchBanners} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openAdd} className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Banner
            </button>
          </div>
        </div>

        {/* Banner list */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" /></div>
        ) : banners.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No banners yet. Click "Add Banner" to create one.</div>
        ) : (
          <div className="space-y-4">
            {banners.map(b => (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  {/* Color preview */}
                  <div className="w-16 h-14 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: b.bg_color, color: b.text_color }}>
                    {b.image_url ? (
                      <img src={b.image_url} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : 'Banner'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{b.heading}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{b.subtext}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">Order: {b.sort_order}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className={`text-xs font-semibold ${b.is_active ? 'text-green-500' : 'text-gray-400'}`}>
                        {b.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(b)}
                      className={`p-2 rounded-xl border transition-all ${b.is_active ? 'border-green-200 text-green-500 bg-green-50' : 'border-gray-200 text-gray-400'}`}>
                      {b.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button onClick={() => openEdit(b)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition-all">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteConfirm(b.id)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm">
              <p className="font-semibold text-gray-800 mb-2">Delete Banner?</p>
              <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeInUp">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-display text-xl font-bold text-gray-800">{editingId ? 'Edit Banner' : 'Add Banner'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {modalError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{modalError}</div>}

                {/* Preview */}
                <div className="rounded-xl h-24 flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: form.bg_color }}>
                  {form.image_url && <img src={form.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />}
                  <div className="relative text-center">
                    <p className="font-bold text-lg" style={{ color: form.text_color }}>{form.heading || 'Heading'}</p>
                    <p className="text-sm opacity-80" style={{ color: form.text_color }}>{form.subtext || 'Subtext'}</p>
                  </div>
                </div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Heading *</label>
                  <input className="input-gold" value={form.heading} onChange={e => set('heading', e.target.value)} placeholder="Amazing Bridal Collection" /></div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Subtext</label>
                  <input className="input-gold" value={form.subtext} onChange={e => set('subtext', e.target.value)} placeholder="Up to 40% off" /></div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                  <input className="input-gold" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." /></div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.bg_color} onChange={e => set('bg_color', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                      <input className="input-gold flex-1 font-mono text-sm" value={form.bg_color} onChange={e => set('bg_color', e.target.value)} />
                    </div>
                  </div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.text_color} onChange={e => set('text_color', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                      <input className="input-gold flex-1 font-mono text-sm" value={form.text_color} onChange={e => set('text_color', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input type="number" className="input-gold" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))} /></div>
                  <div className="flex items-center gap-2 mt-6">
                    <input type="checkbox" id="banner-active" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
                    <label htmlFor="banner-active" className="text-sm font-medium text-gray-700">Active (show on site)</label>
                  </div>
                </div>

                <button onClick={handleSave} disabled={saving} className="btn-gold w-full flex items-center justify-center gap-2">
                  <Save size={15} /> {saving ? 'Saving…' : 'Save Banner'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
