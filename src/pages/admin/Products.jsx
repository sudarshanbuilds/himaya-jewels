import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Save, RefreshCw } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

// UUID regex — real Supabase UUIDs match this; fake ids like 'cat-1' or '1' do NOT
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const emptyForm = {
  name: '', price: '', description: '',
  category_id: '',  // UUID from Supabase categories table
  category: '',     // human-readable name (text column fallback)
  size: '', images: '', stock: '',
}

export default function AdminProducts() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm]           = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [modalError, setModalError] = useState('')

  // ─────────────────────────────────────────
  // Categories – fetched DIRECTLY from Supabase
  // so we always get real UUIDs, never stale cache
  // ─────────────────────────────────────────
  const [dbCats, setDbCats] = useState([])
  const [catsLoading, setCatsLoading] = useState(false)

  const fetchCategories = useCallback(async () => {
    if (!isSupabaseConfigured) return
    setCatsLoading(true)
    try {
      const { data, error: catErr } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')
      if (!catErr && data && data.length > 0) {
        console.log('Categories loaded from Supabase:', data)
        setDbCats(data)
      }
    } catch (e) {
      console.warn('Could not fetch categories:', e)
    } finally {
      setCatsLoading(false)
    }
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const flash = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // ─────────────────────────────────────────
  // Fetch products — Supabase only, no mock fallback
  // ─────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (fetchError) {
        setError('Failed to load products: ' + fetchError.message)
        setProducts([])
      } else {
        setProducts(data || [])  // empty array if no products — never mock data
      }
    } catch {
      setError('Network error. Could not reach Supabase.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // ─────────────────────────────────────────
  // Open modal helpers
  // ─────────────────────────────────────────
  const openAdd = () => {
    // Use FIRST real Supabase category (guaranteed UUID)
    const first = dbCats[0] || {}
    console.log('openAdd – first category:', first)
    setForm({
      ...emptyForm,
      category_id: first.id  || '',   // real UUID
      category:    first.name || '',
    })
    setEditingId(null)
    setModalError('')
    setShowModal(true)
  }

  const openEdit = (p) => {
    // Fix edit-mode: if stored category_id is not a UUID, reset it to empty
    const storedCatId = UUID_REGEX.test(String(p.category_id || '')) ? p.category_id : ''

    // Match against fresh Supabase categories
    const matched =
      dbCats.find(c => c.id   === storedCatId) ||
      dbCats.find(c => c.name === p.category)  ||
      dbCats[0] || {}

    const resolvedId = UUID_REGEX.test(String(matched.id || '')) ? matched.id : ''
    console.log('openEdit – resolved category_id:', resolvedId, '| name:', matched.name)

    setForm({
      name:        p.name,
      price:       String(p.price),
      description: p.description || '',
      category_id: resolvedId,           // '' if no real UUID found
      category:    matched.name || p.category || '',
      size:   Array.isArray(p.size)   ? p.size.join(', ')  : (p.size   || ''),
      images: Array.isArray(p.images) ? p.images.join('\n') : (p.images || ''),
      stock:  String(p.stock ?? 0),
    })
    setEditingId(p.id)
    setModalError('')
    setShowModal(true)
  }

  // ─────────────────────────────────────────
  // Save (insert / update)
  // ─────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    setModalError('')

    // Debug: log what category_id is about to be sent
    console.log('Final category_id:', form.category_id)

    // Validate category_id directly from form state
    const isRealUUID = UUID_REGEX.test(String(form.category_id || ''))

    // Resolve display name
    const resolvedCat  = dbCats.find(c => c.id === form.category_id) || {}
    const categoryName = resolvedCat.name || form.category || 'Other'

    console.log('isUUID:', isRealUUID, '| name:', categoryName)

    const payload = {
      name:        form.name.trim(),
      price:       Number(form.price),
      description: form.description.trim(),
      category:    categoryName,                              // TEXT — always sent
      ...(isRealUUID ? { category_id: form.category_id } : {}), // UUID — omitted if invalid
      size:   form.size.split(',').map(s => s.trim()).filter(Boolean),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      stock:  Number(form.stock) || 0,
      is_new: !editingId,
    }

    console.log('Payload to Supabase:', payload)


    try {
      if (isSupabaseConfigured) {
        if (editingId) {
          console.log('Updating product id:', editingId)
          const { error: updateErr } = await supabase
            .from('products')
            .update(payload)
            .eq('id', editingId)
          if (updateErr) throw updateErr
        } else {
          console.log('Inserting new product')
          const { error: insertErr } = await supabase
            .from('products')
            .insert([payload])
          if (insertErr) throw insertErr
        }
        await fetchProducts()
      } else {
        // Dev mode – local only
        if (editingId) {
          setProducts(ps => ps.map(p => p.id === editingId ? { ...p, ...payload } : p))
        } else {
          setProducts(ps => [{ id: String(Date.now()), ...payload, created_at: new Date().toISOString() }, ...ps])
        }
      }
      setShowModal(false)
      flash(editingId ? 'Product updated successfully!' : 'Product added successfully!')
    } catch (err) {
      console.error('Save error:', err)
      setModalError('Error saving product: ' + (err.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      if (isSupabaseConfigured) {
        const { error: delErr } = await supabase.from('products').delete().eq('id', id)
        if (delErr) throw delErr
        await fetchProducts()
      } else {
        setProducts(ps => ps.filter(p => p.id !== id))
      }
      setDeleteConfirm(null)
      flash('Product deleted.')
    } catch (err) {
      setError('Delete failed: ' + (err.message || 'Unknown error'))
    }
  }

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-400 text-sm mt-1">
              {loading ? 'Loading...' : `${products.length} products in catalogue`}
              {!isSupabaseConfigured && <span className="ml-2 text-xs text-amber-500">(Dev mode)</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 hover:text-yellow-600 transition-all"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={openAdd} id="add-product-btn" className="btn-gold flex items-center gap-2 text-sm px-5 py-2.5">
              <Plus size={16} /> Add Product
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        )}
        {successMsg && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm animate-fadeInUp">
            ✓ {successMsg}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={Array.isArray(p.images) ? p.images[0] : p.images}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80'}
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{p.description?.slice(0, 50)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                          {p.category || 'Other'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-bold text-yellow-600">₹{p.price}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          p.stock === 0 ? 'bg-red-100 text-red-600'
                          : p.stock < 5 ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-600'
                        }`}>
                          {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(p)} id={`edit-${p.id}`}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" aria-label="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => setDeleteConfirm(p.id)} id={`del-${p.id}`}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors" aria-label="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeInUp">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display text-xl font-bold text-gray-800">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Modal error */}
              {modalError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  ❌ {modalError}
                </div>
              )}

              {/* Dev mode warning */}
              {!isSupabaseConfigured && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2.5 rounded-xl text-xs">
                  ⚡ Dev mode: saves locally only.
                </div>
              )}

              {/* Name */}
              <div>
                <label htmlFor="prod-name" className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input id="prod-name" type="text" placeholder="e.g. Golden Bangle Set"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-gold" />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="prod-price" className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                <input id="prod-price" type="number" placeholder="299"
                  value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className="input-gold" />
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="prod-stock" className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                <input id="prod-stock" type="number" placeholder="25"
                  value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                  className="input-gold" />
              </div>

              {/* ── Category Dropdown – direct Supabase fetch, UUID validated on change ── */}
              <div>
                <label htmlFor="prod-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category {catsLoading && <span className="text-xs text-gray-400 ml-1">(loading…)</span>}
                </label>
                <select
                  id="prod-category"
                  value={form.category_id}
                  onChange={e => {
                    const selectedId = e.target.value

                    // Validate UUID format before accepting
                    const isUUID = UUID_REGEX.test(selectedId)
                    if (!isUUID) {
                      console.warn('Invalid UUID selected — ignoring:', selectedId)
                      return   // reject numeric or fake ids
                    }

                    const selectedCat = dbCats.find(c => c.id === selectedId) || {}
                    console.log('Dropdown → category_id:', selectedId, '| name:', selectedCat.name)
                    setForm(f => ({
                      ...f,
                      category_id: selectedCat.id   || '',
                      category:    selectedCat.name || '',
                    }))
                  }}
                  className="input-gold"
                >
                  {dbCats.length === 0 && (
                    <option value="">— no categories loaded —</option>
                  )}
                  {dbCats.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {/* Debug: shows id that will be sent to Supabase */}
                <p className="text-xs mt-1 font-mono">
                  {form.category_id
                    ? <span className="text-green-600">✓ id: {form.category_id}</span>
                    : <span className="text-amber-500">⚠ no category selected</span>}
                </p>
              </div>

              {/* Sizes */}
              <div>
                <label htmlFor="prod-size" className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
                <input id="prod-size" type="text" placeholder="2.4, 2.6, 2.8 or Free Size"
                  value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))}
                  className="input-gold" />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="prod-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="prod-description" rows={3} placeholder="Product description..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-gold resize-none" />
              </div>

              {/* Images */}
              <div>
                <label htmlFor="prod-images" className="block text-sm font-medium text-gray-700 mb-1">Image URLs (one per line)</label>
                <textarea id="prod-images" rows={3} placeholder="https://example.com/image1.jpg"
                  value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))}
                  className="input-gold resize-none font-mono text-xs" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-outline-gold flex-1 py-2.5 text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.price}
                  id="save-product-btn"
                  className="btn-gold flex-1 flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50"
                >
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Save size={15} />}
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-fadeInUp">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="font-display text-xl font-bold text-gray-800 mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-outline-gold flex-1 py-2.5 text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} id="confirm-delete-btn"
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
