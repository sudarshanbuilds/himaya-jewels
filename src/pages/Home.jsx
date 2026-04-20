import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw } from 'lucide-react'
import HeroBanner from '../components/HeroBanner'
import CategoryShowcase from '../components/CategoryShowcase'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/LoadingSpinner'
import { supabase } from '../lib/supabase'
import { useCategories } from '../hooks/useCategories'

const FEATURES = [
  { icon: <Truck size={22} className="text-yellow-600" />, title: 'Free Shipping', desc: 'On orders above ₹499' },
  { icon: <Shield size={22} className="text-yellow-600" />, title: 'Quality Assured', desc: 'Every piece checked' },
  { icon: <RefreshCw size={22} className="text-yellow-600" />, title: 'Easy Returns', desc: '7-day return policy' },
]

export default function Home() {
  const { categories } = useCategories()
  const [featured, setFeatured] = useState([])
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      const all = data || []
      // Featured = newest products (is_new flag or first 4)
      setFeatured(all.filter(p => p.is_new).slice(0, 4).length >= 4
        ? all.filter(p => p.is_new).slice(0, 4)
        : all.slice(0, 4))
      // Trending = highest priced (gives premium feel)
      setTrending([...all].sort((a, b) => b.price - a.price).slice(0, 4))
    } catch (err) {
      console.error('Home fetch error:', err)
      setFeatured([])
      setTrending([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return (
    <main>
      {/* Hero */}
      <HeroBanner />

      {/* Feature badges */}
      <section className="bg-amber-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
          {loading
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : featured.length === 0
              ? <p className="col-span-4 text-center text-gray-400 py-8">No products yet — add some from the admin panel.</p>
              : featured.map((product, i) => (
                  <div key={product.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                    <ProductCard product={product} />
                  </div>
                ))
          }
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/shop" className="btn-outline-gold inline-block text-sm px-6 py-2.5">View All Products</Link>
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
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-2 mb-3">Bridal Collection 2026</h2>
            <p className="text-amber-200 max-w-md mx-auto mb-6">
              Complete bridal sets starting at just ₹799. Make your special day unforgettable with Himaya Jewels.
            </p>
            <Link to="/shop?category=Bridal Sets" id="promo-shop-combos" className="btn-gold inline-block">Shop Bridal Sets</Link>
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
          {loading
            ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />)
            : trending.length === 0
              ? <p className="col-span-4 text-center text-gray-400 py-8">No products yet.</p>
              : trending.map((product, i) => (
                  <div key={product.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                    <ProductCard product={product} />
                  </div>
                ))
          }
        </div>
      </section>
    </main>
  )
}
