import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [imgError, setImgError] = useState(false)
  const [added, setAdded] = useState(false)

  const isOutOfStock = product.stock === 0
  const fav = isFavorite(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addItem(product, 1, product.size?.[0] || 'Free Size')
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const handleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(product)
  }

  const imageUrl = !imgError && product.images?.[0]
    ? product.images[0]
    : 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80'

  return (
    <div className="product-card group relative flex flex-col">
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block img-zoom relative">
        <div className="aspect-square bg-gray-50 overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white rounded-full p-2.5 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={18} className="text-gray-700" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new && <span className="badge-new">New</span>}
          {isOutOfStock && <span className="badge-out-of-stock">Out of Stock</span>}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
            fav
              ? 'bg-rose-500 text-white scale-110'
              : 'bg-white/90 text-gray-500 hover:bg-rose-50 hover:text-rose-500'
          }`}
          aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          id={`fav-btn-${product.id}`}
        >
          <Heart size={15} className={fav ? 'fill-white' : ''} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="hover:text-yellow-600 transition-colors">
          <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide mb-0.5">
            {product.category}
          </p>
          <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <span className="text-lg font-bold text-yellow-600">₹{product.price}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            id={`add-cart-btn-${product.id}`}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-all duration-200 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-green-500 text-white scale-95'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:shadow-md active:scale-95'
            }`}
          >
            <ShoppingCart size={13} />
            {added ? 'Added!' : isOutOfStock ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
