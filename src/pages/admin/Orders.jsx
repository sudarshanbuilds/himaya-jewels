import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

const SAMPLE_ORDERS = [
  { id: 'HJ001', customer_name: 'Priya Sharma', phone: '9876543210', address: '12, Rose Street, Chennai, TN 600001', product: 'Golden Bangle Set', quantity: 2, total_price: 698, order_status: 'delivered', created_at: '2024-01-20T10:30:00Z' },
  { id: 'HJ002', customer_name: 'Meera Patel', phone: '9812345678', address: '45, MG Road, Bengaluru, KA 560001', product: 'Pearl Drop Earrings', quantity: 1, total_price: 199, order_status: 'shipped', created_at: '2024-01-22T14:15:00Z' },
  { id: 'HJ003', customer_name: 'Anjali Kumar', phone: '9988776655', address: '8, Park Lane, Mumbai, MH 400001', product: 'Bridal Combo Set', quantity: 1, total_price: 799, order_status: 'confirmed', created_at: '2024-01-24T09:00:00Z' },
  { id: 'HJ004', customer_name: 'Sunita Verma', phone: '9765432198', address: '22, Lal Bhatia Marg, Jaipur, RJ 302001', product: 'Jhumka Earrings', quantity: 1, total_price: 279, order_status: 'pending', created_at: '2024-01-25T16:45:00Z' },
  { id: 'HJ005', customer_name: 'Divya Nair', phone: '9876012345', address: '3, Kovalam Road, Thiruvananthapuram, KL 695001', product: 'Festival Combo Pack', quantity: 2, total_price: 1298, order_status: 'pending', created_at: '2024-01-26T11:20:00Z' },
]

export default function AdminOrders() {
  const [orders, setOrders] = useState(SAMPLE_ORDERS)
  const [filterStatus, setFilterStatus] = useState('All')

  const updateStatus = (id, newStatus) => {
    setOrders(os => os.map(o => o.id === id ? { ...o, order_status: newStatus } : o))
  }

  const filtered = filterStatus === 'All' ? orders : orders.filter(o => o.order_status === filterStatus)
  const counts = STATUS_OPTIONS.reduce((acc, s) => ({ ...acc, [s]: orders.filter(o => o.order_status === s).length }), {})

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <main className="ml-56 flex-1 p-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">{orders.length} total orders</p>
        </div>

        {/* Status summary chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilterStatus('All')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterStatus === 'All' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            All ({orders.length})
          </button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize ${filterStatus === s ? 'bg-gray-800 text-white' : `${STATUS_COLORS[s]} hover:opacity-80`}`}>
              {s} ({counts[s]})
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-left">
                  {['Order ID', 'Customer', 'Product', 'Total', 'Date', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-5 py-4 text-sm font-mono font-semibold text-gray-700">#{order.id}</td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-gray-800">{order.customer_name}</p>
                      <p className="text-xs text-gray-400">{order.phone}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-[160px] truncate">{order.address}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700 max-w-[160px] line-clamp-2">{order.product}</p>
                      <p className="text-xs text-gray-400">Qty: {order.quantity}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-yellow-600">₹{order.total_price.toLocaleString()}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative">
                        <select value={order.order_status} onChange={e => updateStatus(order.id, e.target.value)}
                          id={`order-status-${order.id}`}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 cursor-pointer appearance-none pr-6 ${STATUS_COLORS[order.order_status]}`}>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s} className="text-gray-800 bg-white capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16"><p className="text-gray-400">No orders with status "{filterStatus}"</p></div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
