import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Search, Menu, X, Gem } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useFavorites } from '../context/FavoritesContext'

export default function Navbar() {
  const { totalItems } = useCart()
  const { favorites } = useFavorites()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/shop?category=Bangles', label: 'Bangles' },
    { to: '/shop?category=Earrings', label: 'Earrings' },
    { to: '/shop?category=Combos', label: 'Combos' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'glass-nav shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <Gem size={16} className="text-white" />
              </div>
              <span className="font-display text-xl font-bold text-gradient-gold tracking-wide">
                Himaya Jewels
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-gray-600 hover:text-yellow-600 transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-full hover:bg-amber-50 transition-colors text-gray-600 hover:text-yellow-600"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              {/* Favorites */}
              <Link
                to="/favorites"
                className="relative p-2 rounded-full hover:bg-amber-50 transition-colors text-gray-600 hover:text-yellow-600"
                aria-label="Favorites"
              >
                <Heart size={20} />
                {favorites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-amber-50 transition-colors text-gray-600 hover:text-yellow-600"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse-gold">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full hover:bg-amber-50 transition-colors text-gray-600"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search Bar (dropdown) */}
          {searchOpen && (
            <div className="pb-3 animate-fadeInUp">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  className="input-gold flex-1"
                  placeholder="Search bangles, earrings, combos..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                  id="nav-search-input"
                />
                <button type="submit" className="btn-gold px-5 py-2 text-sm">
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-amber-100 animate-fadeInUp">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 px-3 rounded-lg text-gray-700 hover:bg-amber-50 hover:text-yellow-700 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="divider-gold my-2" />
              <Link
                to="/about" onClick={() => setMobileOpen(false)}
                className="block py-2 px-3 text-sm text-gray-500 hover:text-yellow-600 transition-colors"
              >About Us</Link>
              <Link
                to="/contact" onClick={() => setMobileOpen(false)}
                className="block py-2 px-3 text-sm text-gray-500 hover:text-yellow-600 transition-colors"
              >Contact</Link>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div className="h-16" />
    </>
  )
}
