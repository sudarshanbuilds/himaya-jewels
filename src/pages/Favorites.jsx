import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import { useFavorites } from '../context/FavoritesContext'
import { useCart } from '../context/CartContext'

export default function Favorites() {
  const { favorites, removeFavorite } = useFavorites()
  const { addItem } = useCart()

  if (favorites.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart size={40} className="text-rose-300" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-700 mb-2">No favorites yet</h2>
          <p className="text-gray-400 mb-8 text-sm">Save your favorite jewelry pieces to revisit them later.</p>
          <Link to="/shop" className="btn-gold px-8 py-3 text-sm">Browse Jewelry</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-yellow-600 text-sm font-semibold uppercase tracking-widest mb-1">Saved Items</p>
          <h1 className="font-display text-3xl font-bold text-gray-800 flex items-center gap-3">
            My Favorites
            <Heart size={24} className="text-rose-400 fill-rose-400" />
          </h1>
          <p className="text-gray-400 text-sm mt-1">{favorites.length} item{favorites.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map((product, i) => {
            const isOutOfStock = product.stock === 0
            const imgUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80'

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group animate-fadeInUp"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className="relative img-zoom aspect-square bg-gray-50">
                  <Link to={`/product/${product.id}`}>
                    <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                  </Link>
                  {isOutOfStock && (
                    <span className="absolute top-2 left-2 badge-out-of-stock">Out of Stock</span>
                  )}
                  <button
                    onClick={() => removeFavorite(product.id)}
                    id={`remove-fav-${product.id}`}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-md"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-4">
                  <p className="text-xs text-yellow-600 font-medium uppercase tracking-wide">{product.category}</p>
                  <Link to={`/product/${product.id}`} className="block mt-0.5">
                    <h3 className="font-semibold text-gray-800 text-sm hover:text-yellow-600 transition-colors line-clamp-2">{product.name}</h3>
                  </Link>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-lg font-bold text-yellow-600">₹{product.price}</span>
                    <button
                      onClick={() => !isOutOfStock && addItem(product, 1, product.size?.[0] || 'Free Size')}
                      disabled={isOutOfStock}
                      id={`fav-add-cart-${product.id}`}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full transition-all ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-yellow-500 hover:bg-yellow-600 text-white hover:shadow-md active:scale-95'
                      }`}
                    >
                      <ShoppingCart size={13} />
                      {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Continue shopping */}
        <div className="mt-10 text-center">
          <Link to="/shop" className="btn-outline-gold text-sm px-8 py-2.5 inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  )
}
