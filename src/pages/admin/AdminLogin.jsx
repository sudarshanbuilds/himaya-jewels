import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Gem, Mail, Lock, Eye, EyeOff, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAdmin, isDevMode } = useAuth()
  const navigate = useNavigate()

  // Auto-fill dev credentials
  const fillDevCredentials = () => {
    setForm({ email: 'admin@himayajewels.com', password: 'admin123' })
    setError('')
  }

  if (isAdmin) {
    navigate('/admin/dashboard', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Please fill all fields.'); return }
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/admin/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fadeInUp">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
              <Gem size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold text-yellow-400">Himaya Jewels</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white">Admin Portal</h1>
          <p className="text-amber-200/70 mt-2 text-sm">Sign in to manage your store</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          {error && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-400/30 text-red-300 rounded-xl p-3.5 mb-5 animate-fadeInUp">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} id="admin-login-form" className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-amber-100 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/60" />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@himayajewels.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl px-4 pl-10 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:bg-white/15 transition-all"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-amber-100 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/60" />
                <input
                  id="admin-password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-xl px-4 pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-yellow-400 focus:bg-white/15 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="admin-login-btn"
              disabled={loading}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10">
            <p className="text-center text-xs text-amber-200/50">
              Admin access only. Not an admin?{' '}
              <Link to="/" className="text-yellow-400 hover:text-yellow-300 font-medium">Visit Store</Link>
            </p>
          </div>
        </div>

        {/* Dev mode banner / Setup note */}
        <div className={`mt-4 rounded-2xl p-4 animate-fadeInUp border ${isDevMode ? 'bg-blue-500/10 border-blue-400/20' : 'bg-amber-500/10 border-amber-400/20'}`} style={{ animationDelay: '0.2s' }}>
          {isDevMode ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Info size={14} className="text-blue-300" />
                <p className="text-blue-300 text-xs font-semibold">Development Mode — Supabase not configured</p>
              </div>
              <p className="text-blue-200/70 text-xs mb-3">Use these test credentials to access the admin panel:</p>
              <div className="bg-white/10 rounded-xl p-3 mb-3 text-left space-y-1">
                <p className="text-xs text-white/80"><span className="text-amber-300 font-medium">Email:</span> admin@himayajewels.com</p>
                <p className="text-xs text-white/80"><span className="text-amber-300 font-medium">Password:</span> admin123</p>
              </div>
              <button
                type="button"
                onClick={fillDevCredentials}
                id="autofill-dev-btn"
                className="text-xs text-blue-300 hover:text-blue-100 font-semibold underline underline-offset-2"
              >
                ⚡ Click to Auto-Fill Credentials
              </button>
            </div>
          ) : (
            <p className="text-amber-200/70 text-xs text-center">
              <span className="font-semibold text-amber-300">Production mode:</span> Use your Supabase admin credentials to sign in.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
