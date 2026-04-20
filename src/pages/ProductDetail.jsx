import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, ArrowLeft, Star, Package, Truck, RefreshCw, Shield } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'
import ProductCard from '../components/ProductCard'
import { supabase } from '../lib/supabase'

export default function ProductDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { addItem }        = useCart()
  const { toggleFavorite, isFavorite } = useFavorites()

  const [product, setProduct]   = useState(null)
  const [related, setRelated]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImg,  setSelectedImg]  = useState(0)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setNotFound(false)

    ;(async () => {
      try {
        // Fetch the single product
        const { data: prod, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !prod) {
          if (mounted) setNotFound(true)
          return
        }

        if (mounted) {
          setProduct(prod)
          setSelectedImg(0)
          setSelectedSize(Array.isArray(prod.size) && prod.size.length > 0 ? prod.size[0] : '')

          // Fetch related products (same category, not this product)
          const { data: rel } = await supabase
            .from('products')
            .select('*')
            .eq('category', prod.category)
            .neq('id', id)
            .limit(4)

          if (mounted) setRelated(rel || [])
        }
      } catch (err) {
        console.error('ProductDetail fetch error:', err)
        if (mounted) setNotFound(true)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
    addItem({ ...product, selectedSize })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    )
  }

  // ── Not found ──
  if (notFound || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">💎</div>
        <h2 className="font-display text-2xl font-bold text-gray-700 mb-2">Product Not Found</h2>
        <p className="text-gray-400 text-sm mb-6">This product may have been removed or doesn't exist.</p>
        <Link to="/shop" className="btn-gold px-6 py-2.5 text-sm">Back to Shop</Link>
      </div>
    )
  }

  const images   = Array.isArray(product.images) ? product.images.filter(Boolean) : [product.images].filter(Boolean)
  const sizes    = Array.isArray(product.size)   ? product.size   : product.size ? product.size.split(',').map(s => s.trim()) : []
  const inStock  = product.stock > 0

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-yellow-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* ── Images ── */}
            <div className="p-6 sm:p-8">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4">
                <img
                  src={images[selectedImg] || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'}
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImg(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImg === i ? 'border-yellow-500' : 'border-gray-200'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover"
                        onError={e => e.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80'} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ── */}
            <div className="p-6 sm:p-8 lg:border-l border-gray-100 flex flex-col">
              {product.is_new && (
                <span className="inline-block bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full mb-3 w-fit">NEW ARRIVAL</span>
              )}
              <span className="text-xs text-gray-400 uppercase tracking-widest mb-2">{product.category}</span>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{product.name}</h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-bold text-yellow-600">₹{product.price}</span>
              </div>

              {/* Rating display */}
              <div className="flex items-center gap-1 mb-4">
                {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />)}
                <span className="text-xs text-gray-400 ml-1">(4.8)</span>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{product.description}</p>
              )}

              {/* Size selector */}
              {sizes.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Size: <span className="font-normal text-gray-500">{selectedSize}</span></p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                      <button key={s} onClick={() => setSelectedSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${selectedSize === s ? 'bg-yellow-500 text-white border-yellow-500' : 'border-gray-200 text-gray-600 hover:border-yellow-400'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock badge */}
              <div className="flex items-center gap-2 mb-6">
                <Package size={14} className={inStock ? 'text-green-500' : 'text-red-400'} />
                <span className={`text-xs font-semibold ${inStock ? 'text-green-500' : 'text-red-400'}`}>
                  {inStock ? `In Stock (${product.stock} left)` : 'Out of Stock'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <button onClick={handleAddToCart} disabled={!inStock || added}
                  id="add-to-cart-btn"
                  className="btn-gold flex-1 flex items-center justify-center gap-2 py-3 disabled:opacity-50">
                  <ShoppingCart size={18} />
                  {added ? '✓ Added!' : inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button onClick={() => toggleFavorite(product)}
                  id="wishlist-btn"
                  className={`p-3 rounded-full border-2 transition-all ${isFavorite(product.id) ? 'border-red-400 text-red-400 bg-red-50' : 'border-gray-200 text-gray-400 hover:border-red-300'}`}>
                  <Heart size={20} className={isFavorite(product.id) ? 'fill-red-400' : ''} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
                {[
                  { icon: <Truck size={16} />,    label: 'Free Shipping', sub: 'Above ₹499' },
                  { icon: <RefreshCw size={16} />, label: 'Easy Returns',  sub: '7-day policy' },
                  { icon: <Shield size={16} />,    label: 'Authentic',     sub: 'Quality assured' },
                ].map((b, i) => (
                  <div key={i} className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-1 text-yellow-600">{b.icon}</div>
                    <p className="text-xs font-semibold text-gray-700">{b.label}</p>
                    <p className="text-xs text-gray-400">{b.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <div key={p.id} className="animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
