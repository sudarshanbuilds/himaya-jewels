import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, RefreshCw, ShoppingBag } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped:   'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

// Sample data shown in dev mode (Supabase not configured)
const DEV_ORDERS = [
  { id: 'dev-1', customer_name: 'Priya Sharma', phone: '9876543210', address: '12, Rose Street, Chennai, TN 600001', products: [{ name: 'Golden Bangle Set', quantity: 2, price: 349 }], total_price: 698, order_status: 'delivered', created_at: '2024-01-20T10:30:00Z' },
  { id: 'dev-2', customer_name: 'Meera Patel', phone: '9812345678', address: '45, MG Road, Bengaluru, KA 560001', products: [{ name: 'Pearl Drop Earrings', quantity: 1, price: 199 }], total_price: 199, order_status: 'shipped', created_at: '2024-01-22T14:15:00Z' },
  { id: 'dev-3', customer_name: 'Anjali Kumar', phone: '9988776655', address: '8, Park Lane, Mumbai, MH 400001', products: [{ name: 'Bridal Combo Set', quantity: 1, price: 799 }], total_price: 799, order_status: 'pending', created_at: '2024-01-24T09:00:00Z' },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filterStatus, setFilterStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError('')

    if (!isSupabaseConfigured) {
      // Dev mode — show sample data
      setOrders(DEV_ORDERS)
      setLoading(false)
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError('Failed to load orders: ' + fetchError.message)
        setOrders([])
      } else {
        setOrders(data || [])
      }
    } catch (err) {
      setError('Network error: ' + (err.message || 'Could not connect to database'))
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateStatus = async (id, newStatus) => {
    // Optimistic update
    setOrders(os => os.map(o => o.id === id ? { ...o, order_status: newStatus } : o))
    setUpdatingId(id)

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ order_status: newStatus })
          .eq('id', id)

        if (error) {
          // Revert on failure
          fetchOrders()
        }
      } catch {
        fetchOrders()
      }
    }
    setUpdatingId(null)
  }

  const filtered = filterStatus === 'All' ? orders : orders.filter(o => o.order_status === filterStatus)
  const counts = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.order_status === s).length }), {})

  const formatProducts = (products) => {
    if (!products || !Array.isArray(products) || products.length === 0) return '—'
    return products.map(p => `${p.name}${p.quantity > 1 ? ` ×${p.quantity}` : ''}`).join(', ')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Orders</h1>
            <p className="text-gray-400 text-sm mt-1">
              {loading ? 'Loading...' : `${orders.length} total orders`}
              {!isSupabaseConfigured && <span className="ml-2 text-xs text-amber-500">(Dev mode — sample data)</span>}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            disabled={loading}
            id="refresh-orders-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 hover:text-yellow-600 transition-all"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterStatus('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === 'All' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${filterStatus === s ? 'bg-gray-800 text-white' : `${STATUS_COLORS[s]} hover:opacity-80`}`}
            >
              {s} ({counts[s]})
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-400">Loading orders...</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    {['Order ID', 'Customer', 'Products', 'Total', 'Date', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(order => (
                    <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Order ID */}
                      <td className="px-5 py-4 text-xs font-mono font-semibold text-gray-600 whitespace-nowrap">
                        #{String(order.id).slice(-6).toUpperCase()}
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-800">{order.customer_name}</p>
                        <p className="text-xs text-gray-400">{order.phone}</p>
                        <p className="text-xs text-gray-400 mt-0.5 max-w-[160px] line-clamp-2">{order.address}</p>
                      </td>

                      {/* Products JSONB */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700 max-w-[200px] line-clamp-2">
                          {formatProducts(order.products)}
                        </p>
                        {Array.isArray(order.products) && order.products.length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {order.products.reduce((s, p) => s + (p.quantity || 1), 0)} item{order.products.reduce((s, p) => s + (p.quantity || 1), 0) !== 1 ? 's' : ''}
                          </p>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 text-sm font-bold text-yellow-600 whitespace-nowrap">
                        ₹{Number(order.total_price).toLocaleString()}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <br />
                        <span className="text-gray-400">{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>

                      {/* Status dropdown */}
                      <td className="px-5 py-4">
                        <div className="relative">
                          <select
                            value={order.order_status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            id={`order-status-${order.id}`}
                            disabled={updatingId === order.id}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer appearance-none pr-6 transition-opacity ${STATUS_COLORS[order.order_status]} ${updatingId === order.id ? 'opacity-50' : ''}`}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s} className="text-gray-800 bg-white capitalize">
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && !loading && (
                <div className="text-center py-16">
                  <ShoppingBag size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    {filterStatus === 'All' ? 'No orders yet.' : `No orders with status "${filterStatus}"`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
