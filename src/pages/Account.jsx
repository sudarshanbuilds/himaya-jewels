import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, LogOut, ShoppingBag, Search, Package } from 'lucide-react'
import { useUserAuth } from '../context/UserAuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function Account() {
  const { user, isLoggedIn, loading: authLoading, logout, displayName } = useUserAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState([])
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/login', { replace: true })
    }
  }, [isLoggedIn, authLoading, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const fetchOrders = async (e) => {
    e.preventDefault()
    if (!phone.trim()) return
    setOrderLoading(true)
    setOrderError('')
    setSearched(true)

    try {
      if (!isSupabaseConfigured) {
        // Show sample orders in dev mode
        setOrders([{
          id: 'dev-sample', customer_name: displayName, phone: phone,
          products: [{ name: 'Golden Bangle Set', quantity: 2, price: 349 }],
          total_price: 698, order_status: 'delivered',
          created_at: new Date().toISOString()
        }])
      } else {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('phone', phone.trim())
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data || [])
      }
    } catch (err) {
      setOrderError('Could not fetch orders. Please try again.')
    } finally {
      setOrderLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) return null

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white font-bold text-xl">{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-800">{displayName}</h1>
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                  <Mail size={14} />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              id="logout-btn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium transition-colors"
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag size={20} className="text-yellow-600" />
            <h2 className="font-display text-xl font-bold text-gray-800">My Orders</h2>
          </div>

          {/* Phone lookup */}
          <div className="bg-amber-50 rounded-2xl p-5 mb-6">
            <p className="text-sm text-gray-600 mb-3 flex items-center gap-1.5">
              <Phone size={14} className="text-yellow-600" />
              Enter the mobile number you used at checkout to view your orders.
            </p>
            <form onSubmit={fetchOrders} className="flex gap-2">
              <input
                type="tel"
                id="order-phone"
                placeholder="10-digit mobile number"
                value={phone}
                maxLength={10}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                className="input-gold flex-1"
              />
              <button type="submit" id="search-orders-btn"
                disabled={orderLoading || phone.length < 10}
                className="btn-gold flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50">
                {orderLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={15} />}
                {orderLoading ? 'Searching...' : 'Find Orders'}
              </button>
            </form>
          </div>

          {/* Order error */}
          {orderError && (
            <p className="text-red-500 text-sm mb-4">{orderError}</p>
          )}

          {/* Orders list */}
          {searched && !orderLoading && (
            orders.length === 0 ? (
              <div className="text-center py-10">
                <Package size={40} className="text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No orders found for this number.</p>
                <p className="text-gray-300 text-xs mt-1">Double-check the number you used at checkout.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-100 rounded-2xl p-5 hover:border-amber-200 transition-colors">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                      <div>
                        <p className="text-xs font-mono font-semibold text-gray-500">
                          Order #{String(order.id).slice(-6).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-yellow-600">₹{Number(order.total_price).toLocaleString()}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                          {order.order_status}
                        </span>
                      </div>
                    </div>

                    {/* Products */}
                    {Array.isArray(order.products) && order.products.length > 0 && (
                      <ul className="space-y-1.5">
                        {order.products.map((item, i) => (
                          <li key={i} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{item.name} {item.quantity > 1 ? `×${item.quantity}` : ''}</span>
                            <span className="text-gray-500">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                      📍 {order.address}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-400">
          Need help?{' '}
          <a href="https://wa.me/919558285403" target="_blank" rel="noreferrer" className="text-yellow-600 hover:underline font-medium">
            WhatsApp us
          </a>
        </p>
      </div>
    </main>
  )
}
