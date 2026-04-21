import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, RefreshCw, Calendar } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase } from '../../lib/supabase'

const emptyForm = { title: '', description: '', banner_url: '', discount: 0, start_date: '', end_date: '', is_active: true }

const today = () => new Date().toISOString().slice(0, 10)

export default function AdminSpecialOffers() {
  const [offers, setOffers]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [modalError, setModalError] = useState('')

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('special_offers').select('*').order('created_at', { ascending: false })
      setOffers(data || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchOffers() }, [fetchOffers])

  const openAdd  = () => { setForm({ ...emptyForm, start_date: today() }); setEditingId(null); setModalError(''); setShowModal(true) }
  const openEdit = (o) => { setForm({ ...o, start_date: o.start_date || '', end_date: o.end_date || '' }); setEditingId(o.id); setModalError(''); setShowModal(true) }

  const handleSave = async () => {
    if (!form.title.trim()) { setModalError('Title is required'); return }
    setSaving(true); setModalError('')
    const payload = { ...form, discount: Number(form.discount) || 0,
      start_date: form.start_date || null, end_date: form.end_date || null }
    try {
      if (editingId) {
        const { error } = await supabase.from('special_offers').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('special_offers').insert([payload])
        if (error) throw error
      }
      setShowModal(false)
      await fetchOffers()
    } catch (e) { setModalError('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await supabase.from('special_offers').delete().eq('id', id)
    setDeleteConfirm(null)
    await fetchOffers()
  }

  const toggleActive = async (o) => {
    await supabase.from('special_offers').update({ is_active: !o.is_active }).eq('id', o.id)
    setOffers(os => os.map(x => x.id === o.id ? { ...x, is_active: !x.is_active } : x))
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const isExpired = (o) => o.end_date && new Date(o.end_date) < new Date()
  const isUpcoming = (o) => o.start_date && new Date(o.start_date) > new Date()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Special Offers</h1>
            <p className="text-gray-400 text-sm mt-1">Timed discount campaigns and offer banners</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchOffers} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openAdd} className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Offer
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" /></div>
        ) : offers.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No special offers yet.</div>
        ) : (
          <div className="space-y-4">
            {offers.map(o => (
              <div key={o.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${isExpired(o) ? 'border-red-100 opacity-60' : 'border-gray-100'}`}>
                <div className="flex gap-4 p-4">
                  {o.banner_url && <img src={o.banner_url} alt={o.title} className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-800">{o.title}</p>
                      {o.discount > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{o.discount}% OFF</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-auto ${
                        isExpired(o) ? 'bg-red-100 text-red-500' :
                        isUpcoming(o) ? 'bg-blue-100 text-blue-600' :
                        o.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {isExpired(o) ? 'Expired' : isUpcoming(o) ? 'Upcoming' : o.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {o.description && <p className="text-sm text-gray-500 mb-1 line-clamp-1">{o.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {o.start_date && <span className="flex items-center gap-1"><Calendar size={10} /> {o.start_date}</span>}
                      {o.end_date && <span>→ {o.end_date}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(o)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${o.is_active ? 'bg-green-50 border-green-200 text-green-600' : 'border-gray-200 text-gray-400'}`}>
                      {o.is_active ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={() => openEdit(o)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-yellow-400 hover:text-yellow-600 transition-all">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeleteConfirm(o.id)} className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all">
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
              <p className="font-semibold text-gray-800 mb-2">Delete Offer?</p>
              <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
              <div className="flex gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold">Delete</button>
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
                <h2 className="font-display text-xl font-bold text-gray-800">{editingId ? 'Edit Offer' : 'Add Special Offer'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {modalError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{modalError}</div>}

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Offer Title *</label>
                  <input className="input-gold" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Eid Special Sale" /></div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea rows={2} className="input-gold resize-none" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Get up to 40% off…" /></div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Banner Image URL</label>
                  <input className="input-gold" value={form.banner_url} onChange={e => set('banner_url', e.target.value)} placeholder="https://..." />
                  {form.banner_url && <img src={form.banner_url} alt="" className="mt-2 w-full h-24 object-cover rounded-xl" />}
                </div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
                  <input type="number" className="input-gold" value={form.discount} onChange={e => set('discount', e.target.value)} placeholder="30" /></div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" className="input-gold" value={form.start_date} onChange={e => set('start_date', e.target.value)} /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" className="input-gold" value={form.end_date} onChange={e => set('end_date', e.target.value)} /></div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
                  <span className="text-sm font-medium text-gray-700">Active (show on site)</span>
                </label>

                <button onClick={handleSave} disabled={saving} className="btn-gold w-full flex items-center justify-center gap-2">
                  <Save size={15} /> {saving ? 'Saving…' : 'Save Offer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
