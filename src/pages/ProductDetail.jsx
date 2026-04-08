import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Zap, ChevronLeft, ChevronRight, Minus, Plus, Share2, Truck, Shield } from 'lucide-react'
import { PRODUCTS } from '../data/products'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()

  const product = PRODUCTS.find(p => p.id === id)

  const [activeImg, setActiveImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const [addMsg, setAddMsg] = useState('')
  const [imgError, setImgError] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">💎</div>
        <h2 className="font-display text-2xl font-bold text-gray-700">Product not found</h2>
        <Link to="/shop" className="btn-gold px-6 py-2.5 text-sm">Back to Shop</Link>
      </div>
    )
  }

  const isOutOfStock = product.stock === 0
  const fav = isFavorite(product.id)
  const related = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80']

  const handleAddToCart = () => {
    if (isOutOfStock) return
    const size = selectedSize || product.size?.[0] || 'Free Size'
    addItem(product, qty, size)
    setAddMsg('Added to cart!')
    setTimeout(() => setAddMsg(''), 2000)
  }

  const handleBuyNow = () => {
    if (isOutOfStock) return
    const size = selectedSize || product.size?.[0] || 'Free Size'
    addItem(product, qty, size)
    navigate('/cart')
  }

  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length)
  const nextImg = () => setActiveImg(i => (i + 1) % images.length)

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-yellow-600">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-yellow-600">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-yellow-600">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-700 font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square group">
              <img
                src={!imgError ? images[activeImg] : 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80'}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImgError(true)}
                id="product-main-image"
              />
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
              {product.is_new && <span className="absolute top-3 left-3 badge-new">New</span>}
              {isOutOfStock && <span className="absolute top-3 right-3 badge-out-of-stock">Out of Stock</span>}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImg === i ? 'border-yellow-500 scale-105' : 'border-gray-200 hover:border-yellow-300'}`}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link to={`/shop?category=${product.category}`} className="text-yellow-600 text-sm font-semibold uppercase tracking-wide hover:text-yellow-700">
                  {product.category}
                </Link>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-800 mt-1 leading-tight">
                  {product.name}
                </h1>
              </div>
              <button
                onClick={() => toggleFavorite(product)}
                id="detail-fav-btn"
                className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all ${fav ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-500'}`}
              >
                <Heart size={18} className={fav ? 'fill-white' : ''} />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <span className="text-3xl font-bold text-yellow-600">₹{product.price}</span>
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isOutOfStock ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
              </span>
            </div>

            <hr className="divider-gold my-5" />

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>

            {/* Size Selector */}
            {product.size && product.size.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-gray-700 mb-2.5">
                  Size <span className="text-yellow-600 font-normal">{selectedSize ? `— ${selectedSize}` : '(select one)'}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.size.map(s => (
                    <button
                      key={s}
                      id={`size-btn-${s}`}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                        selectedSize === s
                          ? 'border-yellow-500 bg-yellow-500 text-white shadow-md'
                          : 'border-gray-200 text-gray-600 hover:border-yellow-300 hover:text-yellow-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-5">
              <p className="text-sm font-semibold text-gray-700 mb-2.5">Quantity</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-3 py-2.5 hover:bg-gray-50 transition-colors text-gray-600"
                    id="qty-decrease-btn"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-5 py-2.5 font-semibold text-gray-800 min-w-[3rem] text-center">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                    className="px-3 py-2.5 hover:bg-gray-50 transition-colors text-gray-600"
                    id="qty-increase-btn"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {addMsg && (
                  <span className="text-green-600 text-sm font-medium animate-fadeInUp">✓ {addMsg}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                id="detail-add-cart-btn"
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                  isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-outline-gold'
                }`}
              >
                <ShoppingCart size={18} />
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                id="detail-buy-now-btn"
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all ${
                  isOutOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-gold'
                }`}
              >
                <Zap size={18} />
                Buy Now
              </button>
            </div>

            {/* Trust signals */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: <Truck size={14} />, text: 'Free delivery above ₹499' },
                { icon: <Shield size={14} />, text: '7-day easy returns' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2.5">
                  <span className="text-yellow-600">{item.icon}</span>
                  <span className="text-xs text-gray-600">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-display text-2xl font-bold text-gray-800">You May Also Like</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-yellow-200 to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
