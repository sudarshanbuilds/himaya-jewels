import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AuthProvider } from './context/AuthContext'
import { UserAuthProvider } from './context/UserAuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/ProtectedRoute'

// Customer Pages
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Favorites from './pages/Favorites'
import Account from './pages/Account'

// Auth Pages (customer)
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminOrders from './pages/admin/Orders'
import AdminCategories from './pages/admin/Categories'
import AdminBanners from './pages/admin/Banners'
import AdminComboOffers from './pages/admin/ComboOffers'
import AdminSpecialOffers from './pages/admin/SpecialOffers'
import AdminSiteSettings from './pages/admin/SiteSettings'

// Policy Pages
import { AboutUs, Contact, Shipping, Returns, Privacy, Terms } from './pages/policies/PolicyPages'

// Layout wrapper for customer-facing pages
function CustomerLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UserAuthProvider>
          <CartProvider>
            <FavoritesProvider>
              {/* Scroll to top on every route change */}
              <ScrollToTop />
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
                <Route path="/shop" element={<CustomerLayout><Shop /></CustomerLayout>} />
                <Route path="/product/:id" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
                <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
                <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
                <Route path="/favorites" element={<CustomerLayout><Favorites /></CustomerLayout>} />
                <Route path="/account" element={<CustomerLayout><Account /></CustomerLayout>} />

                {/* Auth Routes (no navbar/footer — standalone pages) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Policy Pages */}
                <Route path="/about" element={<CustomerLayout><AboutUs /></CustomerLayout>} />
                <Route path="/contact" element={<CustomerLayout><Contact /></CustomerLayout>} />
                <Route path="/shipping" element={<CustomerLayout><Shipping /></CustomerLayout>} />
                <Route path="/returns" element={<CustomerLayout><Returns /></CustomerLayout>} />
                <Route path="/privacy" element={<CustomerLayout><Privacy /></CustomerLayout>} />
                <Route path="/terms" element={<CustomerLayout><Terms /></CustomerLayout>} />

                {/* Admin Routes */}
                <Route path="/admin/login"          element={<AdminLogin />} />
                <Route path="/admin/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/admin/products"       element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/categories"     element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
                <Route path="/admin/orders"         element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/banners"        element={<ProtectedRoute><AdminBanners /></ProtectedRoute>} />
                <Route path="/admin/combo-offers"   element={<ProtectedRoute><AdminComboOffers /></ProtectedRoute>} />
                <Route path="/admin/special-offers" element={<ProtectedRoute><AdminSpecialOffers /></ProtectedRoute>} />
                <Route path="/admin/site-settings"  element={<ProtectedRoute><AdminSiteSettings /></ProtectedRoute>} />

                {/* 404 fallback */}
                <Route path="*" element={
                  <CustomerLayout>
                    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
                      <div className="text-7xl mb-4">💎</div>
                      <h1 className="font-display text-4xl font-bold text-gray-800 mb-3">404 – Page Not Found</h1>
                      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist.</p>
                      <a href="/" className="btn-gold px-8 py-3">Go Home</a>
                    </div>
                  </CustomerLayout>
                } />
              </Routes>
            </FavoritesProvider>
          </CartProvider>
        </UserAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
