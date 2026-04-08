import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'himaya_categories'

export const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Bangles',           slug: 'bangles' },
  { id: 'cat-2', name: 'Earrings',          slug: 'earrings' },
  { id: 'cat-3', name: 'Necklaces',         slug: 'necklaces' },
  { id: 'cat-4', name: 'Rings',             slug: 'rings' },
  { id: 'cat-5', name: 'Anklets',           slug: 'anklets' },
  { id: 'cat-6', name: 'Mangalsutra',       slug: 'mangalsutra' },
  { id: 'cat-7', name: 'Bridal Sets',       slug: 'bridal-sets' },
  { id: 'cat-8', name: 'Combo Sets',        slug: 'combo-sets' },
  { id: 'cat-9', name: 'Hair Accessories',  slug: 'hair-accessories' },
  { id: 'cat-10', name: 'Other',            slug: 'other' },
]

/** Generate a URL-safe slug from a name */
function toSlug(name) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/** Load cached data from localStorage, returns null if nothing saved */
function loadCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

/** Persist categories to localStorage */
function saveCache(cats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats))
  } catch {}
}

/**
 * useCategories — provides categories with:
 *  1. Instant load from localStorage (no flash)
 *  2. Background sync from Supabase (when configured)
 *  3. Graceful fallback to DEFAULT_CATEGORIES
 *  4. CRUD operations (try Supabase, always update local state)
 */
export function useCategories() {
  const [categories, _setCategories] = useState(() => loadCache() ?? DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  // Persist whenever categories change
  const setCategories = (cats) => {
    _setCategories(cats)
    saveCache(cats)
  }

  // Background fetch from Supabase on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        if (!error && data && data.length > 0 && mounted) {
          setCategories(data)
        }
      } catch {
        // Supabase not configured — keep cached/default data
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  /** Add a new category */
  const addCategory = async (name) => {
    const slug = toSlug(name)
    const localItem = {
      id: 'local_' + Date.now(),
      name: name.trim(),
      slug,
      created_at: new Date().toISOString(),
    }
    // Optimistic update
    const updated = [...categories, localItem]
    setCategories(updated)

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: name.trim(), slug })
        .select()
        .single()
      if (!error && data) {
        // Replace local placeholder with real Supabase record
        setCategories(updated.map(c => c.id === localItem.id ? data : c))
      }
    } catch {}
  }

  /** Update an existing category's name */
  const updateCategory = async (id, name) => {
    const slug = toSlug(name)
    const updated = categories.map(c => c.id === id ? { ...c, name: name.trim(), slug } : c)
    setCategories(updated)
    try {
      await supabase.from('categories').update({ name: name.trim(), slug }).eq('id', id)
    } catch {}
  }

  /** Delete a category by id */
  const deleteCategory = async (id) => {
    setCategories(categories.filter(c => c.id !== id))
    try {
      await supabase.from('categories').delete().eq('id', id)
    } catch {}
  }

  /** Reset to factory defaults */
  const resetToDefaults = () => {
    setCategories(DEFAULT_CATEGORIES)
  }

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    resetToDefaults,
  }
}
