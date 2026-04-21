import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, RefreshCw, Tag } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase } from '../../lib/supabase'

const emptyForm = { title: '', product_ids: [], combo_price: '', discount: 0, image_url: '', is_active: true, show_on_home: true }

export default function AdminComboOffers() {
  const [combos, setCombos]     = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [modalError, setModalError] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: c }, { data: p }] = await Promise.all([
        supabase.from('combo_offers').select('*').order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, price').order('name'),
      ])
      setCombos(c || [])
      setProducts(p || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const openAdd  = () => { setForm(emptyForm); setEditingId(null); setModalError(''); setShowModal(true) }
  const openEdit = (c) => { setForm({ ...c, combo_price: String(c.combo_price || '') }); setEditingId(c.id); setModalError(''); setShowModal(true) }

  const handleSave = async () => {
    if (!form.title.trim()) { setModalError('Title is required'); return }
    setSaving(true); setModalError('')
    const payload = { ...form, combo_price: Number(form.combo_price) || 0 }
    try {
      if (editingId) {
        const { error } = await supabase.from('combo_offers').update(payload).eq('id', editingId)
        if (error) throw error
      } else {
        const { error } = await supabase.from('combo_offers').insert([payload])
        if (error) throw error
      }
      setShowModal(false)
      await fetchAll()
    } catch (e) { setModalError('Save failed: ' + e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    await supabase.from('combo_offers').delete().eq('id', id)
    setDeleteConfirm(null)
    await fetchAll()
  }

  const toggleProduct = (id) => {
    setForm(f => ({
      ...f,
      product_ids: f.product_ids.includes(id)
        ? f.product_ids.filter(x => x !== id)
        : [...f.product_ids, id],
    }))
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Combo Offers</h1>
            <p className="text-gray-400 text-sm mt-1">Create product bundles with special prices</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAll} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 transition-all">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openAdd} className="btn-gold flex items-center gap-2 px-4 py-2 text-sm">
              <Plus size={16} /> Add Combo
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" /></div>
        ) : combos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No combo offers yet. Create one to show bundles on your homepage.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {combos.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {c.image_url && <img src={c.image_url} alt={c.title} className="w-full h-36 object-cover" />}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-800">{c.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${c.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {c.is_active ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-yellow-600 font-bold">₹{c.combo_price}</span>
                    {c.discount > 0 && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{c.discount}% off</span>}
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    <Tag size={11} className="inline mr-1" />
                    {c.product_ids?.length || 0} products · {c.show_on_home ? 'Shows on homepage' : 'Hidden from homepage'}
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-600 text-xs transition-all">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-xl border border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-500 transition-all">
                      <Trash2 size={13} />
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
              <p className="font-semibold text-gray-800 mb-2">Delete Combo Offer?</p>
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
                <h2 className="font-display text-xl font-bold text-gray-800">{editingId ? 'Edit Combo' : 'Add Combo Offer'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                {modalError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{modalError}</div>}

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Combo Title *</label>
                  <input className="input-gold" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Bridal Jewellery Set" /></div>

                <div><label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input className="input-gold" value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." /></div>

                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Combo Price (₹)</label>
                    <input type="number" className="input-gold" value={form.combo_price} onChange={e => set('combo_price', e.target.value)} placeholder="999" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
                    <input type="number" className="input-gold" value={form.discount} onChange={e => set('discount', Number(e.target.value))} placeholder="20" /></div>
                </div>

                {/* Product selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Products ({form.product_ids.length} selected)</label>
                  <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-50">
                    {products.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-gray-400">No products found</p>
                    ) : products.map(p => (
                      <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 cursor-pointer">
                        <input type="checkbox" checked={form.product_ids.includes(p.id)} onChange={() => toggleProduct(p.id)} className="rounded" />
                        <span className="text-sm text-gray-700 flex-1 truncate">{p.name}</span>
                        <span className="text-xs text-yellow-600 font-semibold">₹{p.price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} className="rounded" />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.show_on_home} onChange={e => set('show_on_home', e.target.checked)} className="rounded" />
                    <span className="text-sm font-medium text-gray-700">Show on Homepage</span>
                  </label>
                </div>

                <button onClick={handleSave} disabled={saving} className="btn-gold w-full flex items-center justify-center gap-2">
                  <Save size={15} /> {saving ? 'Saving…' : 'Save Combo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
