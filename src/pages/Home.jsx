import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, RefreshCw, Tag, Clock } from 'lucide-react'
import HeroBanner from '../components/HeroBanner'
import CategoryShowcase from '../components/CategoryShowcase'
import ProductCard from '../components/ProductCard'
import { SkeletonCard } from '../components/LoadingSpinner'
import { supabase } from '../lib/supabase'
import { useCategories } from '../hooks/useCategories'

const FEATURES = [
  { icon: <Truck size={22} className="text-yellow-600" />,    title: 'Free Shipping',   desc: 'On orders above ₹499' },
  { icon: <Shield size={22} className="text-yellow-600" />,   title: 'Quality Assured', desc: 'Every piece checked' },
  { icon: <RefreshCw size={22} className="text-yellow-600" />, title: 'Easy Returns',   desc: '7-day return policy' },
]

export default function Home() {
  const { categories } = useCategories()
  const [featured,      setFeatured]      = useState([])
  const [trending,      setTrending]      = useState([])
  const [combos,        setCombos]        = useState([])
  const [offers,        setOffers]        = useState([])
  const [banners,       setBanners]       = useState([])
  const [siteSettings,  setSiteSettings]  = useState({})
  const [loading,       setLoading]       = useState(true)
  const [bannerIdx,     setBannerIdx]     = useState(0)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, cRes, oRes, sRes, bRes] = await Promise.all([
        supabase.from('products').select('*').eq('is_visible', true).order('created_at', { ascending: false }),
        supabase.from('combo_offers').select('*').eq('is_active', true).eq('show_on_home', true),
        supabase.from('special_offers').select('*').eq('is_active', true),
        supabase.from('site_settings').select('key, value'),
        supabase.from('banners').select('*').eq('is_active', true).order('sort_order'),
      ])

      const all = pRes.data || []
      // Featured: prefer is_featured flag, else fall back to newest 4
      const featuredItems = all.filter(p => p.is_featured)
      setFeatured(featuredItems.length >= 1 ? featuredItems.slice(0, 4) : all.slice(0, 4))
      setTrending([...all].sort((a, b) => b.price - a.price).slice(0, 4))
      setCombos(cRes.data || [])
      setBanners(
        (bRes.data || []).filter(b =>
          b.is_active &&                          // must be active
          (b.image_url?.trim() || b.heading?.trim()) // must have image OR heading text
        )
      )

      // Active + in-date special offers
      const now = new Date()
      const activeOffers = (oRes.data || []).filter(o => {
        const start = o.start_date ? new Date(o.start_date) : null
        const end   = o.end_date   ? new Date(o.end_date)   : null
        if (start && now < start) return false
        if (end   && now > end)   return false
        return true
      })
      setOffers(activeOffers)

      if (sRes.data) setSiteSettings(Object.fromEntries(sRes.data.map(r => [r.key, r.value])))
    } catch (err) {
      console.error('Home fetch error:', err)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Auto-advance banners every 5 s
  useEffect(() => {
    if (banners.length < 2) return
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000)
    return () => clearInterval(t)
  }, [banners.length])

  const heading    = siteSettings.homepage_heading    || 'Where Every\nPiece Tells\na Story'
  const subheading = siteSettings.homepage_subheading || 'Discover our exquisite collection crafted to make you shine at every occasion.'
  const align      = siteSettings.homepage_align      || 'left'

  return (
    <main>
      {/* Hero — dynamic heading from site settings */}
      <HeroBanner heading={heading} subheading={subheading} align={align} />

      {/* ── Admin-managed Banners (FIX 4) ─────────────────────── */}
      {banners.length > 0 && (
        <section className="relative overflow-hidden" style={{ minHeight: '120px' }}>
          {banners.map((banner, idx) => (
            <div key={banner.id}
              className={`transition-opacity duration-700 ${idx === bannerIdx ? 'opacity-100' : 'opacity-0 pointer-events-none absolute inset-0'}`}
              style={{ backgroundColor: banner.bg_color || '#7c2d12' }}>
              {banner.image_url && (
                <div className="absolute inset-0">
                  <img src={banner.image_url} alt={banner.heading || 'Banner'}
                    className="w-full h-full object-cover opacity-40" loading="lazy" />
                </div>
              )}
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
                <div>
                  {banner.heading && (
                    <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: banner.text_color || '#ffffff' }}>
                      {banner.heading}
                    </h2>
                  )}
                  {banner.subtext && (
                    <p className="mt-1 text-sm" style={{ color: banner.text_color ? `${banner.text_color}cc` : '#ffffffcc' }}>
                      {banner.subtext}
                    </p>
                  )}
                </div>
                <Link to="/shop" className="btn-gold flex-shrink-0 ml-4 text-sm">Shop Now</Link>
              </div>
            </div>
          ))}
          {/* Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setBannerIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === bannerIdx ? 'bg-white scale-125' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Feature badges */}
      <section className="bg-amber-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-3 animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Special Offer Banner */}
      {offers.length > 0 && (
        <section className="mx-4 sm:mx-6 lg:mx-auto max-w-7xl mt-8">
          {offers.slice(0, 1).map(offer => (
            <div key={offer.id} className="relative rounded-2xl overflow-hidden"
              style={{ background: offer.banner_url ? undefined : 'linear-gradient(135deg, #dc2626, #b91c1c)' }}>
              {offer.banner_url && (
                <img src={offer.banner_url} alt={offer.title}
                  className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              )}
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 flex items-center justify-between px-6 py-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock size={14} className="text-yellow-300" />
                    <span className="text-yellow-300 text-xs font-semibold uppercase tracking-wide">Limited Time Offer</span>
                  </div>
                  <p className="text-white font-display text-xl font-bold">{offer.title}</p>
                  {offer.description && <p className="text-white/80 text-sm mt-0.5">{offer.description}</p>}
                  {offer.end_date && <p className="text-yellow-300 text-xs mt-1">Ends: {new Date(offer.end_date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>}
                </div>
                <div className="flex-shrink-0 ml-4 text-center">
                  {offer.discount > 0 && (
                    <div className="bg-yellow-400 text-gray-900 font-display font-bold text-2xl rounded-2xl px-4 py-2">
                      {offer.discount}%<br /><span className="text-sm font-normal">OFF</span>
                    </div>
                  )}
                  {/* FIX 6: Link to shop with offer_id so dates are validated */}
                  <Link to={`/shop?offer_id=${offer.id}`} className="block mt-2 bg-white text-gray-900 text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-yellow-50 transition-colors">
                    Shop Offer
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

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

      {/* Combo Offers Section */}
      {!loading && combos.length > 0 && (
        <section className="py-10 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-yellow-600 text-sm font-semibold uppercase tracking-widest mb-1">Best Value</p>
              <h2 className="font-display text-3xl font-bold text-gray-800">Combo Offers</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {combos.map((combo, i) => (
              <div key={combo.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fadeInUp group"
                style={{ animationDelay: `${i * 0.1}s` }}>
                {combo.image_url ? (
                  <img src={combo.image_url} alt={combo.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-amber-100 to-yellow-200 flex items-center justify-center">
                    <Tag size={32} className="text-yellow-500" />
                  </div>
                )}
                <div className="p-4">
                  <p className="font-display font-bold text-gray-800 mb-1">{combo.title}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl font-bold text-yellow-600">₹{combo.combo_price}</span>
                    {combo.discount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">{combo.discount}% OFF</span>
                    )}
                  </div>
                  {/* FIX 5: Navigate to shop with combo_id to show combo products */}
                  <Link to={`/shop?combo_id=${combo.id}`} className="block btn-gold text-center text-sm py-2">
                    View Products
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
