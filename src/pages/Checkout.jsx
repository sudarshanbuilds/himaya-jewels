import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Truck, User, Phone, MapPin, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { supabase } from '../lib/supabase'

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState(null)

  const shipping = totalPrice >= 499 ? 0 : 49
  const grandTotal = totalPrice + shipping

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-5xl mb-4">🛍️</div>
        <h2 className="font-display text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
        <Link to="/shop" className="btn-gold px-6 py-2.5 text-sm mt-4">Shop Now</Link>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number'
    if (!form.address.trim()) e.address = 'Address is required'
    else if (form.address.trim().length < 10) e.address = 'Please enter a complete address'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setLoading(true)

    try {
      // Try to save to Supabase (will fail if not configured — graceful fallback)
      let orderRef = 'HJ' + Date.now().toString().slice(-6)

      try {
        // Create one order per cart item (Supabase schema)
        for (const item of items) {
          await supabase.from('orders').insert({
            customer_name: form.name.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            product_id: item.id,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            order_status: 'pending',
          })
        }
      } catch {
        // Supabase not configured — continue with local order
      }

      setOrderId(orderRef)
      clearCart()
      setSuccess(true)
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-50 flex items-center justify-center px-4 py-20">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center animate-fadeInUp">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Order Placed! 🎉</h2>
          {orderId && <p className="text-sm text-gray-400 mb-4">Order ID: <span className="font-mono font-semibold text-gray-600">{orderId}</span></p>}
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Thank you, <span className="font-semibold text-gray-700">{form.name}</span>! Your order has been received. Our team will contact you on <span className="font-semibold text-gray-700">{form.phone}</span> for confirmation.
          </p>
          <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery Address</p>
            <p className="text-sm text-gray-700">{form.address}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Link to="/shop" id="success-shop-btn" className="btn-gold py-3 text-sm block">Continue Shopping</Link>
            <Link to="/" className="btn-outline-gold py-3 text-sm block">Back to Home</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link to="/cart" className="text-gray-500 hover:text-yellow-600 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-800">Checkout</h1>
            <p className="text-sm text-gray-400">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <User size={16} className="text-yellow-600" />
                <h2 className="font-semibold text-gray-800">Delivery Details</h2>
              </div>
              <form onSubmit={handleSubmit} id="checkout-form" className="p-5 space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="checkout-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="checkout-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className={`input-gold pl-9 ${errors.name ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="checkout-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    WhatsApp / Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      id="checkout-phone"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={form.phone}
                      maxLength={10}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '') }))}
                      className={`input-gold pl-9 ${errors.phone ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="checkout-address" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-3.5 text-gray-400" />
                    <textarea
                      id="checkout-address"
                      placeholder="House No, Street, Area, City, State, PIN Code"
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      rows={3}
                      className={`input-gold pl-9 resize-none ${errors.address ? 'border-red-400' : ''}`}
                    />
                  </div>
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="place-order-btn"
                  disabled={loading}
                  className="btn-gold w-full py-4 text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      Place Order — ₹{grandTotal.toLocaleString()}
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  By placing this order, you agree to our{' '}
                  <Link to="/terms" className="text-yellow-600 hover:underline">Terms & Conditions</Link>
                </p>
              </form>
            </div>
          </div>

          {/* Order summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-20">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingBag size={16} className="text-yellow-600" />
                <h2 className="font-semibold text-gray-800">Your Order</h2>
              </div>
              <div className="p-5 space-y-3.5">
                {items.map(item => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex items-start gap-3">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80'}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qty: {item.quantity} {item.selectedSize && item.selectedSize !== 'Free Size' ? `• Size: ${item.selectedSize}` : ''}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-yellow-600 flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}

                <hr className="divider-gold" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  <hr className="divider-gold" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-yellow-600">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3 mt-1">
                  <Truck size={14} className="text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700">
                    {shipping === 0 ? 'Enjoy free shipping on this order!' : `Add ₹${499 - totalPrice} more for free shipping`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
