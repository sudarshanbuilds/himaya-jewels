import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { PRODUCTS as initialProducts } from '../../data/products'
import { useCategories } from '../../hooks/useCategories'

const emptyForm = { name: '', price: '', description: '', category: '', size: '', images: '', stock: '' }

export default function AdminProducts() {
  const { categories } = useCategories()
  const [products, setProducts] = useState(initialProducts)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const openAdd = () => {
    setForm({ ...emptyForm, category: categories[0]?.name || '' })
    setEditingId(null)
    setShowModal(true)
  }

  const openEdit = (p) => {
    setForm({
      name: p.name, price: String(p.price), description: p.description || '',
      category: p.category, size: p.size?.join(', ') || '', images: p.images?.join('\n') || '',
      stock: String(p.stock),
    })
    setEditingId(p.id)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))
    const updated = {
      id: editingId || String(Date.now()),
      name: form.name,
      price: Number(form.price),
      description: form.description,
      category: form.category || categories[0]?.name || 'Other',
      size: form.size.split(',').map(s => s.trim()).filter(Boolean),
      images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
      stock: Number(form.stock) || 0,
      created_at: new Date().toISOString(),
      is_new: !editingId,
    }
    if (editingId) {
      setProducts(ps => ps.map(p => p.id === editingId ? updated : p))
    } else {
      setProducts(ps => [updated, ...ps])
    }
    setShowModal(false)
    setSaving(false)
    setSuccessMsg(editingId ? 'Product updated!' : 'Product added!')
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  const handleDelete = (id) => {
    setProducts(ps => ps.filter(p => p.id !== id))
    setDeleteConfirm(null)
    setSuccessMsg('Product deleted.')
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="ml-56 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Products</h1>
            <p className="text-gray-400 text-sm mt-1">{products.length} products in catalogue</p>
          </div>
          <button onClick={openAdd} id="add-product-btn" className="btn-gold flex items-center gap-2 text-sm px-5 py-2.5">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {successMsg && (
          <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm animate-fadeInUp">
            ✓ {successMsg}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                        <img src={p.images?.[0]} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" onError={e => e.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80'} />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400 line-clamp-1">{p.description?.slice(0, 50)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">{p.category || 'Other'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-yellow-600">₹{p.price}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : p.stock < 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-600'}`}>
                        {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} id={`edit-product-${p.id}`} className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors" aria-label="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteConfirm(p.id)} id={`delete-product-${p.id}`} className="p-2 rounded-lg hover:bg-red-50 text-red-400 transition-colors" aria-label="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeInUp">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-display text-xl font-bold text-gray-800">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { id: 'prod-name', label: 'Product Name *', key: 'name', type: 'text', placeholder: 'e.g. Golden Bangle Set' },
                { id: 'prod-price', label: 'Price (₹) *', key: 'price', type: 'number', placeholder: '299' },
                { id: 'prod-stock', label: 'Stock Quantity', key: 'stock', type: 'number', placeholder: '25' },
              ].map(field => (
                <div key={field.key}>
                  <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input id={field.id} type={field.type} placeholder={field.placeholder} value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} className="input-gold" />
                </div>
              ))}

              {/* Dynamic Category Dropdown */}
              <div>
                <label htmlFor="prod-category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                  <span className="ml-2 text-xs text-gray-400 font-normal">({categories.length} available)</span>
                </label>
                <select
                  id="prod-category"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="input-gold"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                  {categories.length === 0 && <option value="Other">Other</option>}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Manage categories in{' '}
                  <a href="/admin/categories" className="text-yellow-600 hover:underline">Admin → Categories</a>
                </p>
              </div>

              <div>
                <label htmlFor="prod-size" className="block text-sm font-medium text-gray-700 mb-1">Sizes (comma separated)</label>
                <input id="prod-size" type="text" placeholder="2.4, 2.6, 2.8 or Free Size" value={form.size}
                  onChange={e => setForm(f => ({ ...f, size: e.target.value }))} className="input-gold" />
              </div>
              <div>
                <label htmlFor="prod-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea id="prod-description" rows={3} placeholder="Product description..." value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-gold resize-none" />
              </div>
              <div>
                <label htmlFor="prod-images" className="block text-sm font-medium text-gray-700 mb-1">Image URLs (one per line)</label>
                <textarea id="prod-images" rows={3} placeholder="https://example.com/image1.jpg" value={form.images}
                  onChange={e => setForm(f => ({ ...f, images: e.target.value }))} className="input-gold resize-none font-mono text-xs" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-outline-gold flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving} id="save-product-btn" className="btn-gold flex-1 flex items-center justify-center gap-2 py-2.5 text-sm">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
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
              <button onClick={() => handleDelete(deleteConfirm)} id="confirm-delete-btn" className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
