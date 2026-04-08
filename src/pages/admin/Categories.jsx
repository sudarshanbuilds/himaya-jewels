import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Save, Check, Tag, RefreshCw } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { useCategories } from '../../hooks/useCategories'

export default function AdminCategories() {
  const { categories, loading, addCategory, updateCategory, deleteCategory, resetToDefaults } = useCategories()

  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  const flash = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) { setAddError('Category name is required.'); return }
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      setAddError('This category already exists.')
      return
    }
    setAddError('')
    setAdding(true)
    await addCategory(name)
    setNewName('')
    setAdding(false)
    flash(`"${name}" added successfully!`)
  }

  const startEdit = (cat) => {
    setEditId(cat.id)
    setEditName(cat.name)
  }

  const handleEditSave = async (id) => {
    const name = editName.trim()
    if (!name) return
    await updateCategory(id, name)
    setEditId(null)
    flash(`Category updated to "${name}"`)
  }

  const handleDelete = async (id) => {
    const cat = categories.find(c => c.id === id)
    await deleteCategory(id)
    setDeleteConfirm(null)
    flash(`"${cat?.name}" deleted.`)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="ml-56 flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Categories</h1>
            <p className="text-gray-400 text-sm mt-1">{categories.length} categories configured</p>
          </div>
          <button
            onClick={resetToDefaults}
            id="reset-categories-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 hover:text-yellow-600 transition-all"
          >
            <RefreshCw size={14} />
            Reset to Defaults
          </button>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mb-5 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm animate-fadeInUp">
            <Check size={15} />
            {successMsg}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={16} className="text-yellow-600" />
                Add New Category
              </h2>
              <form onSubmit={handleAdd} id="add-category-form" className="space-y-3">
                <div>
                  <label htmlFor="new-category-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category Name *
                  </label>
                  <input
                    id="new-category-name"
                    type="text"
                    placeholder="e.g. Ankle Bracelets"
                    value={newName}
                    onChange={e => { setNewName(e.target.value); setAddError('') }}
                    className={`input-gold w-full ${addError ? 'border-red-400' : ''}`}
                    maxLength={50}
                  />
                  {addError && <p className="text-red-500 text-xs mt-1">{addError}</p>}
                  {newName.trim() && (
                    <p className="text-xs text-gray-400 mt-1">
                      Slug: <span className="font-mono">{newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</span>
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={adding || !newName.trim()}
                  id="save-category-btn"
                  className="btn-gold w-full flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {adding ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : <Plus size={15} />}
                  {adding ? 'Adding...' : 'Add Category'}
                </button>
              </form>

              {/* Info box */}
              <div className="mt-5 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                <div className="flex items-start gap-2">
                  <Tag size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-gray-500 leading-relaxed">
                    <p className="font-semibold text-gray-600 mb-1">How categories work</p>
                    <p>Categories are stored in Supabase and cached locally. Changes sync automatically when Supabase is connected.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">All Categories</h2>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full font-medium">
                  {categories.length} total
                </span>
              </div>

              {loading ? (
                <div className="py-12 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
                </div>
              ) : categories.length === 0 ? (
                <div className="py-12 text-center">
                  <Tag size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No categories yet. Add one above.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {categories.map((cat, i) => (
                    <div
                      key={cat.id}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-amber-50/40 transition-colors group animate-fadeInUp"
                      style={{ animationDelay: `${i * 0.03}s` }}
                    >
                      {/* Index badge */}
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-400 text-xs flex items-center justify-center flex-shrink-0 font-medium">
                        {i + 1}
                      </span>

                      {/* Name / Edit input */}
                      <div className="flex-1 min-w-0">
                        {editId === cat.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleEditSave(cat.id)
                              if (e.key === 'Escape') setEditId(null)
                            }}
                            className="input-gold text-sm py-1.5 w-full max-w-xs"
                            autoFocus
                            id={`edit-input-${cat.id}`}
                          />
                        ) : (
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {editId === cat.id ? (
                          <>
                            <button
                              onClick={() => handleEditSave(cat.id)}
                              id={`save-edit-${cat.id}`}
                              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                              aria-label="Save"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => setEditId(null)}
                              className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                              aria-label="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(cat)}
                              id={`edit-cat-${cat.id}`}
                              className="p-2 rounded-lg text-blue-400 hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(cat.id)}
                              id={`delete-cat-${cat.id}`}
                              className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                              aria-label="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (() => {
        const cat = categories.find(c => c.id === deleteConfirm)
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-fadeInUp">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="font-display text-xl font-bold text-gray-800 mb-1">Delete Category?</h3>
              <p className="text-gray-500 text-sm mb-1">
                You are about to delete <span className="font-semibold text-gray-700">"{cat?.name}"</span>.
              </p>
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-5">
                Products using this category will show as uncategorized.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-outline-gold flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  id="confirm-delete-cat-btn"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-full text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
