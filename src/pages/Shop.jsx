import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Grid3X3, LayoutList } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import FilterPanel, { PRICE_RANGES, SORT_OPTIONS } from '../components/FilterPanel'
import { SkeletonCard } from '../components/LoadingSpinner'
import { PRODUCTS } from '../data/products'
import { useCategories } from '../hooks/useCategories'

export default function Shop() {
  const { categories } = useCategories()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [view, setView] = useState('grid')
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'All',
    priceRange: 0,
    sort: 'newest',
    search: searchParams.get('search') || '',
  })

  // Simulate loading
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [filters])

  // Sync URL params
  useEffect(() => {
    const cat = searchParams.get('category')
    const search = searchParams.get('search')
    if (cat && cat !== filters.category) setFilters(f => ({ ...f, category: cat }))
    if (search !== null && search !== filters.search) {
      setFilters(f => ({ ...f, search }))
      setSearchInput(search)
    }
  }, [searchParams])

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(f => ({ ...f, search: searchInput }))
  }

  const filtered = useMemo(() => {
    let result = [...PRODUCTS]

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }

    // Category
    if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.category === filters.category)
    }

    // Price
    const range = PRICE_RANGES[filters.priceRange]
    if (range) {
      result = result.filter(p => p.price >= range.min && p.price <= range.max)
    }

    // Sort
    switch (filters.sort) {
      case 'price_asc': result.sort((a, b) => a.price - b.price); break
      case 'price_desc': result.sort((a, b) => b.price - a.price); break
      case 'name_asc': result.sort((a, b) => a.name.localeCompare(b.name)); break
      default: result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return result
  }, [filters])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gradient-to-r from-amber-900 to-yellow-800 text-white py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-amber-200 text-sm uppercase tracking-widest mb-1">Our Collection</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Shop Jewelry</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                id="shop-search-input"
                type="text"
                placeholder="Search bangles, earrings, combos..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                className="input-gold pl-9 w-full"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: '' })) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit" className="btn-gold text-sm px-5 py-2">Search</button>
          </form>

          <div className="flex items-center gap-2">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-yellow-400 transition-colors lg:hidden"
              id="toggle-filters-btn"
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>

            {/* View toggle */}
            <div className="flex border border-gray-200 bg-white rounded-xl overflow-hidden">
              <button onClick={() => setView('grid')} className={`p-2.5 ${view === 'grid' ? 'bg-yellow-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`} aria-label="Grid view">
                <Grid3X3 size={16} />
              </button>
              <button onClick={() => setView('list')} className={`p-2.5 ${view === 'list' ? 'bg-yellow-500 text-white' : 'text-gray-500 hover:bg-gray-50'}`} aria-label="List view">
                <LayoutList size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters – desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <FilterPanel filters={filters} onChange={handleFilterChange} categories={categories} />
          </aside>

          {/* Mobile filter drawer */}
          {showFilters && (
            <div className="lg:hidden fixed inset-0 z-40 flex">
              <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
              <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto animate-fadeInUp shadow-2xl">
                <div className="flex items-center justify-between px-4 py-4 border-b">
                  <span className="font-semibold text-gray-800">Filters</span>
                  <button onClick={() => setShowFilters(false)}><X size={20} /></button>
                </div>
                <div className="p-4">
                  <FilterPanel filters={filters} onChange={(f) => { handleFilterChange(f); setShowFilters(false) }} categories={categories} />
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">
                {loading ? 'Searching...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
              </p>
              {filters.search && (
                <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs px-3 py-1 rounded-full">
                  <Search size={11} />
                  "{filters.search}"
                  <button onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: '' })) }}>
                    <X size={11} />
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className={`grid gap-4 sm:gap-6 ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">💎</div>
                <h3 className="font-display text-xl font-bold text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => { setFilters({ category: 'All', priceRange: 0, sort: 'newest', search: '' }); setSearchInput('') }}
                  className="btn-outline-gold text-sm px-6"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 sm:gap-6 ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {filtered.map((product, i) => (
                  <div key={product.id} className="animate-fadeInUp" style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
