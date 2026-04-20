import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Package, ShoppingBag, TrendingUp, ChevronRight, RefreshCw } from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import { useCategories } from '../../hooks/useCategories'

export default function AdminDashboard() {
  const { categories } = useCategories()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    if (!isSupabaseConfigured) { setLoading(false); return }
    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, price, stock, category, images')
        .order('created_at', { ascending: false })
      setProducts(data || [])
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const totalProducts  = products.length
  const outOfStock     = products.filter(p => p.stock === 0).length
  const totalValue     = products.reduce((s, p) => s + p.price * p.stock, 0)

  const stats = [
    { label: 'Total Products',   value: totalProducts,               icon: <Package size={22} />,     color: 'from-yellow-400 to-amber-500',  link: '/admin/products' },
    { label: 'Out of Stock',     value: outOfStock,                  icon: <TrendingUp size={22} />,  color: 'from-red-400 to-rose-500',      link: '/admin/products' },
    { label: 'Categories',       value: categories.length,           icon: <ShoppingBag size={22} />, color: 'from-blue-400 to-indigo-500',   link: '/admin/categories' },
    { label: 'Inventory Value',  value: `₹${totalValue.toLocaleString()}`, icon: <TrendingUp size={22} />, color: 'from-green-400 to-emerald-500', link: '/admin/products' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="ml-56 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back! Here's your store overview.</p>
          </div>
          <button onClick={fetchProducts} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 hover:border-yellow-400 hover:text-yellow-600 transition-all">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, i) => (
            <Link key={i} to={stat.link}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
              <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium mt-3 group-hover:gap-2 transition-all">
                View <ChevronRight size={12} />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { title: 'Product Management',  desc: 'Add, edit, or delete products. Manage stock levels and images.',   link: '/admin/products',   id: 'admin-manage-products-btn',   label: 'Manage Products' },
            { title: 'Category Management', desc: 'Add, rename, or remove product categories dynamically.',           link: '/admin/categories', id: 'admin-manage-categories-btn', label: 'Manage Categories' },
            { title: 'Order Management',    desc: 'View all customer orders, update status, and track deliveries.',  link: '/admin/orders',     id: 'admin-manage-orders-btn',     label: 'Manage Orders' },
          ].map(card => (
            <div key={card.link} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-800 mb-2">{card.title}</h2>
              <p className="text-sm text-gray-500 mb-4">{card.desc}</p>
              <Link to={card.link} id={card.id} className="btn-gold text-sm px-5 py-2.5 inline-block">{card.label}</Link>
            </div>
          ))}
        </div>

        {/* Recent Products — from Supabase only */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Recent Products</h2>
            <Link to="/admin/products" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-yellow-200 border-t-yellow-500 rounded-full animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">
                No products yet. <Link to="/admin/products" className="text-yellow-600 hover:underline">Add your first product →</Link>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.slice(0, 5).map(p => (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={Array.isArray(p.images) ? p.images[0] : p.images} alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                            onError={e => e.target.src = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=100&q=80'} />
                          <span className="text-sm font-medium text-gray-800 line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">{p.category}</span>
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-yellow-600">₹{p.price}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {p.stock === 0 ? 'Out of Stock' : p.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
