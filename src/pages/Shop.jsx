import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Grid3X3, LayoutList, Tag, Clock } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import FilterPanel, { PRICE_RANGES, SORT_OPTIONS } from '../components/FilterPanel'
import { SkeletonCard } from '../components/LoadingSpinner'
import { useCategories } from '../hooks/useCategories'
import { supabase } from '../lib/supabase'

const RESET_FILTERS = { category: 'All', priceRange: 0, sort: 'newest', search: '' }

export default function Shop() {
  const { categories } = useCategories()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [allProducts, setAllProducts]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [showFilters, setShowFilters]   = useState(false)
  const [view, setView]                 = useState('grid')
  const [searchInput, setSearchInput]   = useState(searchParams.get('search') || '')

  // Combo / Special-offer context from URL
  const [comboInfo,   setComboInfo]   = useState(null)  // { title, productIds }
  const [offerInfo,   setOfferInfo]   = useState(null)  // { title, discount, expired }
  const [contextLoading, setCtxLoad] = useState(false)

  const [filters, setFilters] = useState({
    ...RESET_FILTERS,
    category: searchParams.get('category') || 'All',
    search:   searchParams.get('search')   || '',
  })

  // ── Fetch all visible products from Supabase ─────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      // Try fetching with is_visible filter; fall back if column doesn't exist
      let query = supabase.from('products').select('*').order('created_at', { ascending: false })
      const { data, error } = await query
      if (error) throw error
      // Client-side visibility filter (handles missing column gracefully)
      const visible = (data || []).filter(p => p.is_visible !== false)
      setAllProducts(visible)
    } catch (err) {
      console.error('Shop fetch error:', err)
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  // ── Sync URL search/category params → filters ────────────────
  useEffect(() => {
    const cat    = searchParams.get('category')
    const search = searchParams.get('search')
    const combo  = searchParams.get('combo_id')
    const offer  = searchParams.get('offer_id')

    // Clear context if no special params
    if (!combo) setComboInfo(null)
    if (!offer) setOfferInfo(null)

    setFilters(f => ({
      ...f,
      category: cat || 'All',
      search:   search || '',
    }))
    if (search !== null) setSearchInput(search || '')
  }, [searchParams])

  // ── Load combo info when combo_id is in URL ──────────────────
  const comboId = searchParams.get('combo_id')
  useEffect(() => {
    if (!comboId) { setComboInfo(null); return }
    setCtxLoad(true)
    ;(async () => {
      try {
        const { data: combo } = await supabase.from('combo_offers').select('*').eq('id', comboId).single()
        if (combo && combo.is_active) {
          setComboInfo({ title: combo.title, productIds: combo.product_ids || [] })
        } else {
          setComboInfo({ title: 'Combo Offer', productIds: [] })
        }
      } catch { setComboInfo(null) }
      finally { setCtxLoad(false) }
    })()
  }, [comboId])

  // ── Load offer info when offer_id is in URL ────────────────
  const offerId = searchParams.get('offer_id')
  useEffect(() => {
    if (!offerId) { setOfferInfo(null); return }
    setCtxLoad(true)
    ;(async () => {
      try {
        const { data: offer } = await supabase.from('special_offers').select('*').eq('id', offerId).single()
        if (!offer) { setOfferInfo(null); return }
        const now   = new Date()
        const start = offer.start_date ? new Date(offer.start_date) : null
        const end   = offer.end_date   ? new Date(offer.end_date)   : null
        if ((start && now < start) || (end && now > end)) {
          setOfferInfo({ ...offer, expired: true })
        } else {
          setOfferInfo({ ...offer, expired: false })
        }
      } catch { setOfferInfo(null) }
      finally { setCtxLoad(false) }
    })()
  }, [offerId])

  // ── Filter/sort products ─────────────────────────────────────
  // ✅ FIX: allProducts is now in the dependency array
  const filtered = useMemo(() => {
    // Combo context: show only combo products, ignore other filters
    if (comboId && comboInfo) {
      return allProducts.filter(p => comboInfo.productIds.includes(p.id))
    }

    let result = [...allProducts]

    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }

    // Category
    if (filters.category && filters.category !== 'All') {
      result = result.filter(p => p.category === filters.category)
    }

    // Price
    const range = PRICE_RANGES[filters.priceRange]
    if (range && filters.priceRange !== 0) {
      result = result.filter(p => p.price >= range.min && p.price <= range.max)
    }

    // Sort
    switch (filters.sort) {
      case 'price_asc':  result.sort((a, b) => a.price - b.price); break
      case 'price_desc': result.sort((a, b) => b.price - a.price); break
      case 'name_asc':   result.sort((a, b) => a.name.localeCompare(b.name)); break
      default:           result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return result
  }, [filters, allProducts, comboId, comboInfo]) // ← allProducts required here

  // ── Handlers ──────────────────────────────────────────────────
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    // Clear combo/offer context if category/price/sort changed manually
    if (comboId || offerId) {
      const params = new URLSearchParams(searchParams)
      params.delete('combo_id')
      params.delete('offer_id')
      setSearchParams(params, { replace: true })
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(f => ({ ...f, search: searchInput }))
  }

  const handleReset = () => {
    setFilters(RESET_FILTERS)
    setSearchInput('')
    setComboInfo(null)
    setOfferInfo(null)
    // Clear all URL params
    setSearchParams({}, { replace: true })
  }

  // ── Context banner text ────────────────────────────────────────
  const hasCombo  = comboId && comboInfo
  const hasOffer  = offerId && offerInfo && !offerInfo.expired
  const activeCategory = filters.category !== 'All' ? filters.category : null
  const hasActiveFilters = filters.category !== 'All' || filters.priceRange !== 0 || filters.sort !== 'newest' || filters.search || comboId || offerId

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-gradient-to-r from-amber-900 to-yellow-800 text-white py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-amber-200 text-sm uppercase tracking-widest mb-1">Our Collection</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            {hasCombo ? comboInfo.title
              : hasOffer ? offerInfo.title
              : activeCategory ? activeCategory
              : 'All Products'}
          </h1>
          {activeCategory && !hasCombo && !hasOffer && (
            <p className="text-amber-200 text-sm mt-1">
              Showing all products in <span className="font-semibold text-white">{activeCategory}</span>
            </p>
          )}
        </div>
      </div>

      {/* Offer notice banner */}
      {hasOffer && (
        <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span className="text-sm font-semibold">{offerInfo.title}</span>
              {offerInfo.discount > 0 && <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{offerInfo.discount}% OFF</span>}
              {offerInfo.description && <span className="text-red-100 text-sm hidden sm:inline">— {offerInfo.description}</span>}
            </div>
            <button onClick={handleReset} className="text-xs text-red-200 hover:text-white flex items-center gap-1">
              <X size={12} /> Clear
            </button>
          </div>
        </div>
      )}

      {offerInfo?.expired && (
        <div className="bg-gray-100 text-gray-600 px-4 sm:px-6 py-3 text-sm text-center">
          This offer has expired. Showing all products.
        </div>
      )}

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
            {/* Reset button — always visible when any filter active */}
            {hasActiveFilters && (
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition-colors"
                id="reset-all-btn">
                <X size={13} /> Reset
              </button>
            )}

            {/* Mobile filter toggle */}
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-yellow-400 transition-colors lg:hidden"
              id="toggle-filters-btn">
              <SlidersHorizontal size={15} /> Filters
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
            {/* Results count + active filter tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <p className="text-sm text-gray-500">
                {loading || contextLoading
                  ? 'Loading products…'
                  : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
              </p>

              {/* Active filter chips */}
              {activeCategory && !hasCombo && (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Tag size={10} /> {activeCategory}
                  <button onClick={() => handleFilterChange({ ...filters, category: 'All' })} className="hover:text-yellow-900"><X size={10} /></button>
                </span>
              )}
              {hasCombo && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  🎁 Combo: {comboInfo.title}
                  <button onClick={handleReset}><X size={10} /></button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <Search size={10} /> "{filters.search}"
                  <button onClick={() => { setSearchInput(''); setFilters(f => ({ ...f, search: '' })) }}><X size={10} /></button>
                </span>
              )}
            </div>

            {loading || contextLoading ? (
              <div className={`grid gap-4 sm:gap-6 ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">💎</div>
                <h3 className="font-display text-xl font-bold text-gray-700 mb-2">
                  {activeCategory ? `No products in "${activeCategory}"` : 'No products found'}
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  {activeCategory
                    ? `No products are currently available in the ${activeCategory} category.`
                    : 'Try adjusting your filters or search terms.'}
                </p>
                <button onClick={handleReset} className="btn-outline-gold text-sm px-6">
                  View All Products
                </button>
              </div>
            ) : (
              <div className={`grid gap-4 sm:gap-6 ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                {filtered.map((product, i) => (
                  <div key={product.id} className="animate-fadeInUp" style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}>
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
