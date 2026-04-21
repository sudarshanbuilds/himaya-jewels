import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Gem, Package, ShoppingBag, LayoutDashboard, LogOut, Tag, Settings, Image, Gift, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/admin/dashboard',      icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products',       icon: Package,         label: 'Products' },
  { to: '/admin/categories',     icon: Tag,             label: 'Categories' },
  { to: '/admin/orders',         icon: ShoppingBag,     label: 'Orders' },
  { to: '/admin/banners',        icon: Image,           label: 'Banners' },
  { to: '/admin/combo-offers',   icon: Gift,            label: 'Combo Offers' },
  { to: '/admin/special-offers', icon: Sparkles,        label: 'Special Offers' },
  { to: '/admin/site-settings',  icon: Settings,        label: 'Site Settings' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className="w-56 bg-gray-900 flex flex-col fixed top-0 left-0 h-full z-30">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center">
            <Gem size={15} className="text-white" />
          </div>
          <span className="font-display text-base font-bold text-yellow-400">Himaya Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}>
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-gray-800">
        {user && (
          <div className="mb-3 px-3">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-xs text-gray-300 font-medium truncate">{user.email}</p>
          </div>
        )}
        <Link to="/" className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all text-sm mb-1">
          <Gem size={15} /> View Store
        </Link>
        <button onClick={handleLogout} id="admin-sidebar-logout-btn"
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-all text-sm">
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
