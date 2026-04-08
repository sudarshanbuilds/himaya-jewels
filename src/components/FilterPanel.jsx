import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react'

const PRICE_RANGES = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ₹250', min: 0, max: 250 },
  { label: '₹250 – ₹500', min: 250, max: 500 },
  { label: '₹500 – ₹800', min: 500, max: 800 },
  { label: 'Above ₹800', min: 800, max: Infinity },
]

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
]

// categories prop: array of { id, name, slug } objects or plain strings
export default function FilterPanel({ filters, onChange, categories = [] }) {
  // Normalise to just name strings for filtering
  const categoryNames = ['All', ...categories.map(c => (typeof c === 'string' ? c : c.name))]
  const [openSection, setOpenSection] = useState('category')

  const toggle = (section) => setOpenSection(s => s === section ? null : section)

  const hasActiveFilters = filters.category !== 'All' || filters.priceRange !== 0 || filters.sort !== 'newest'

  const resetFilters = () => {
    onChange({ category: 'All', priceRange: 0, sort: 'newest' })
  }

  return (
    <aside className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-yellow-600" />
          <span className="font-semibold text-sm text-gray-800">Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium"
            id="reset-filters-btn"
          >
            <X size={12} />
            Reset
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => toggle('sort')}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-amber-50 transition-colors"
        >
          Sort By
          {openSection === 'sort' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {openSection === 'sort' && (
          <div className="px-4 pb-3 space-y-1.5 animate-fadeInUp">
            {SORT_OPTIONS.map((opt, i) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  id={`sort-${opt.value}`}
                  value={opt.value}
                  checked={filters.sort === opt.value}
                  onChange={() => onChange({ ...filters, sort: opt.value })}
                  className="accent-yellow-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-yellow-700 transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => toggle('category')}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-amber-50 transition-colors"
        >
          Category
          {openSection === 'category' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {openSection === 'category' && (
          <div className="px-4 pb-3 space-y-1.5 animate-fadeInUp">
            {categoryNames.map(cat => (
              <button
                key={cat}
                id={`filter-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onChange({ ...filters, category: cat })}
                className={`block w-full text-left text-sm px-3 py-1.5 rounded-lg transition-all ${
                  filters.category === cat
                    ? 'bg-yellow-500 text-white font-semibold'
                    : 'text-gray-600 hover:bg-amber-50 hover:text-yellow-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div>
        <button
          onClick={() => toggle('price')}
          className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-amber-50 transition-colors"
        >
          Price Range
          {openSection === 'price' ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {openSection === 'price' && (
          <div className="px-4 pb-3 space-y-1.5 animate-fadeInUp">
            {PRICE_RANGES.map((range, i) => (
              <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  id={`price-range-${i}`}
                  value={i}
                  checked={filters.priceRange === i}
                  onChange={() => onChange({ ...filters, priceRange: i })}
                  className="accent-yellow-500"
                />
                <span className="text-sm text-gray-600 group-hover:text-yellow-700 transition-colors">
                  {range.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export { PRICE_RANGES, SORT_OPTIONS }
