import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, updateQty, removeItem, totalPrice, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-yellow-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-8 text-sm">Looks like you haven't added any jewelry yet.</p>
          <Link to="/shop" id="empty-cart-shop-btn" className="btn-gold px-8 py-3 text-sm">
            Start Shopping
          </Link>
        </div>
      </main>
    )
  }

  const shipping = totalPrice >= 499 ? 0 : 49
  const grandTotal = totalPrice + shipping

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link to="/shop" className="text-gray-500 hover:text-yellow-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-800">Your Cart</h1>
            <p className="text-sm text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items list */}
          <div className="flex-1 space-y-4">
            {items.map((item, i) => {
              const imgUrl = item.images?.[0] || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200&q=80'
              return (
                <div
                  key={`${item.id}-${item.selectedSize}`}
                  className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-gray-100 animate-fadeInUp"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Image */}
                  <Link to={`/product/${item.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
                    <img src={imgUrl} alt={item.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className="text-xs text-yellow-600 font-medium">{item.category}</p>
                        <Link to={`/product/${item.id}`} className="font-semibold text-gray-800 text-sm hover:text-yellow-600 transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        {item.selectedSize && item.selectedSize !== 'Free Size' && (
                          <p className="text-xs text-gray-400 mt-0.5">Size: {item.selectedSize}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.selectedSize)}
                        id={`remove-item-${item.id}`}
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, item.selectedSize, item.quantity - 1)}
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                          id={`cart-qty-dec-${item.id}`}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, item.selectedSize, item.quantity + 1)}
                          className="px-2.5 py-1.5 hover:bg-gray-50 transition-colors text-gray-600"
                          id={`cart-qty-inc-${item.id}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span className="font-bold text-yellow-600">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Clear cart */}
            <button
              onClick={clearCart}
              id="clear-cart-btn"
              className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 mt-2"
            >
              <Trash2 size={14} />
              Clear cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-20">
              <h2 className="font-display text-lg font-bold text-gray-800 mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                    {shipping === 0 ? 'Free' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    Add ₹{499 - totalPrice} more for free shipping!
                  </p>
                )}
                <hr className="divider-gold" />
                <div className="flex justify-between font-bold text-base text-gray-800">
                  <span>Total</span>
                  <span className="text-yellow-600">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                id="checkout-btn"
                className="btn-gold w-full text-center block mt-6 py-3.5 text-sm"
              >
                Proceed to Checkout
              </Link>

              <Link to="/shop" className="block text-center mt-3 text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
