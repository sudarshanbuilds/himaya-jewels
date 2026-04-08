import { Link } from 'react-router-dom'

// Maps known category names to curated Unsplash images
const CATEGORY_IMAGES = {
  'Bangles':          'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&q=80',
  'Earrings':         'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
  'Necklaces':        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
  'Rings':            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80',
  'Anklets':          'https://images.unsplash.com/photo-1573408301185-9519ef7b1b4b?w=400&q=80',
  'Mangalsutra':      'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=400&q=80',
  'Bridal Sets':      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
  'Combo Sets':       'https://images.unsplash.com/photo-1573408301185-9519ef7b1b4b?w=400&q=80',
  'Combos':           'https://images.unsplash.com/photo-1573408301185-9519ef7b1b4b?w=400&q=80',
  'Hair Accessories': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',
  'Other':            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80',
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80'

const CATEGORY_EMOJIS = {
  'Bangles': '💛', 'Earrings': '🌸', 'Necklaces': '✨', 'Rings': '💍',
  'Anklets': '🌼', 'Mangalsutra': '❤️', 'Bridal Sets': '👑',
  'Combo Sets': '🎁', 'Combos': '🎁', 'Hair Accessories': '🌺', 'Other': '💎',
}

/**
 * CategoryShowcase — accepts dynamic categories from useCategories hook.
 * Shows up to `maxVisible` categories (default 6). Remaining are accessible via "View All".
 */
export default function CategoryShowcase({ categories = [], maxVisible = 6 }) {
  const visible = categories.slice(0, maxVisible)

  if (visible.length === 0) return null

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-yellow-600 text-sm font-semibold uppercase tracking-widest mb-2">Browse by</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-800">Shop by Category</h2>
        <div className="mt-3 h-0.5 w-16 bg-gradient-to-r from-yellow-400 to-amber-600 mx-auto rounded-full" />
      </div>

      <div className={`grid gap-5 ${visible.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-3'}`}>
        {visible.map((cat, i) => {
          const name = typeof cat === 'string' ? cat : cat.name
          const slug = typeof cat === 'string' ? cat.toLowerCase().replace(/\s+/g, '-') : (cat.slug || name.toLowerCase().replace(/\s+/g, '-'))
          const image = CATEGORY_IMAGES[name] || FALLBACK_IMAGE
          const emoji = CATEGORY_EMOJIS[name] || '💎'

          return (
            <Link
              key={cat.id || name}
              to={`/shop?category=${encodeURIComponent(name)}`}
              id={`category-${slug}`}
              className="category-card group block overflow-hidden animate-fadeInUp"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Image */}
              <div className="img-zoom h-44 sm:h-52 relative">
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover rounded-t-2xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-t-2xl" />
                <div className="absolute bottom-3 left-3">
                  <span className="bg-white/20 backdrop-blur-sm text-white text-xl px-3 py-1 rounded-full">
                    {emoji}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="p-4">
                <h3 className="font-display text-lg font-bold text-gray-800 group-hover:text-yellow-600 transition-colors">
                  {name}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-yellow-600 text-sm font-semibold">
                  <span>Explore</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Show "View All Categories" if there are more */}
      {categories.length > maxVisible && (
        <div className="text-center mt-6">
          <Link to="/shop" className="btn-outline-gold text-sm px-8 py-2.5 inline-block">
            View All {categories.length} Categories
          </Link>
        </div>
      )}
    </section>
  )
}
