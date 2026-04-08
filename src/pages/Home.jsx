import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Star } from 'lucide-react'
import HeroBanner from '../components/HeroBanner'
import CategoryShowcase from '../components/CategoryShowcase'
import ProductCard from '../components/ProductCard'
import { FEATURED_PRODUCTS, TRENDING_PRODUCTS } from '../data/products'
import { useCategories } from '../hooks/useCategories'

const FEATURES = [
  { icon: <Truck size={22} className="text-yellow-600" />, title: 'Free Shipping', desc: 'On orders above ₹499' },
  { icon: <Shield size={22} className="text-yellow-600" />, title: 'Quality Assured', desc: 'Every piece checked' },
  { icon: <RefreshCw size={22} className="text-yellow-600" />, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: <Star size={22} className="text-yellow-600" />, title: 'Top Rated', desc: '4.9★ customer rating' },
]

const TESTIMONIALS = [
  { name: 'Priya S.', text: 'Absolutely love my bangle set! The quality is amazing for the price. Will definitely order again.', rating: 5 },
  { name: 'Nisha K.', text: 'The earrings are even more beautiful in person. Fast delivery and gorgeous packaging!', rating: 5 },
  { name: 'Meera R.', text: 'Ordered the bridal combo for my sister\'s wedding. Everyone complimented it!', rating: 5 },
]

export default function Home() {
  const { categories } = useCategories()
  return (
    <main>
      {/* Hero */}
      <HeroBanner />

      {/* Feature badges */}
      <section className="bg-amber-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3 animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <CategoryShowcase categories={categories} maxVisible={6} />

      {/* Featured Products */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-yellow-600 text-sm font-semibold uppercase tracking-widest mb-1">Just In</p>
            <h2 className="font-display text-3xl font-bold text-gray-800">Featured Products</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 font-semibold text-sm group">
            View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {FEATURED_PRODUCTS.map((product, i) => (
            <div key={product.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/shop" className="btn-outline-gold inline-block text-sm px-6 py-2.5">
            View All Products
          </Link>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl mb-12">
        <div className="rounded-3xl overflow-hidden relative bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 p-8 sm:p-12 text-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full bg-yellow-400 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-amber-300 blur-3xl" />
          </div>
          <div className="relative z-10">
            <span className="text-yellow-300 text-sm font-semibold uppercase tracking-widest">Limited Offer</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2 mb-3">
              Bridal Collection 2024
            </h2>
            <p className="text-amber-200 max-w-md mx-auto mb-6">
              Complete bridal sets starting at just ₹799. Make your special day unforgettable with Himaya Jewels.
            </p>
            <Link to="/shop?category=Combos" id="promo-shop-combos" className="btn-gold inline-block">
              Shop Bridal Sets
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-yellow-600 text-sm font-semibold uppercase tracking-widest mb-1">Hot Right Now</p>
            <h2 className="font-display text-3xl font-bold text-gray-800">Trending Now</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 font-semibold text-sm group">
            Browse All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRENDING_PRODUCTS.map((product, i) => (
            <div key={product.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-amber-50 to-rose-50 py-14 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-yellow-600 text-sm font-semibold uppercase tracking-widest mb-2">Reviews</p>
            <h2 className="font-display text-3xl font-bold text-gray-800">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 animate-fadeInUp"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-3">"{t.text}"</p>
                <p className="text-gray-800 font-semibold text-sm">– {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-14 px-4 sm:px-6 max-w-2xl mx-auto text-center">
        <p className="text-yellow-600 text-sm font-semibold uppercase tracking-widest mb-2">Stay Updated</p>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
          Get New Arrivals First
        </h2>
        <p className="text-gray-500 mb-6 text-sm">Subscribe and be the first to know about new jewelry drops and exclusive offers.</p>
        <form className="flex gap-2 max-w-md mx-auto" onSubmit={e => e.preventDefault()}>
          <input
            type="email"
            placeholder="Your email address"
            className="input-gold flex-1"
            id="newsletter-email"
          />
          <button type="submit" className="btn-gold text-sm px-5 py-2.5 whitespace-nowrap">
            Subscribe
          </button>
        </form>
      </section>
    </main>
  )
}
