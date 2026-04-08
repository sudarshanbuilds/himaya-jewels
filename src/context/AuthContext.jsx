import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

// Dev-mode is active when Supabase is not properly configured
const IS_DEV_MODE = !isSupabaseConfigured

// Dev-mode hardcoded credentials (only used when Supabase is not set up)
const DEV_CREDENTIALS = { email: 'admin@himayajewels.com', password: 'admin123' }
const DEV_USER = { id: 'dev-admin', email: DEV_CREDENTIALS.email, role: 'admin' }
const DEV_STORAGE_KEY = 'himaya_dev_admin'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ── DEV MODE: No Supabase — use sessionStorage ──
    if (IS_DEV_MODE) {
      const stored = sessionStorage.getItem(DEV_STORAGE_KEY)
      setUser(stored ? DEV_USER : null)
      setLoading(false)
      return
    }

    // ── REAL MODE: Supabase configured ──
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        setUser(null)
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, password) => {
    // ── DEV MODE login ──
    if (IS_DEV_MODE) {
      if (
        email.trim().toLowerCase() === DEV_CREDENTIALS.email &&
        password === DEV_CREDENTIALS.password
      ) {
        sessionStorage.setItem(DEV_STORAGE_KEY, 'true')
        setUser(DEV_USER)
        return { user: DEV_USER }
      }
      throw new Error(
        `Dev mode: use ${DEV_CREDENTIALS.email} / ${DEV_CREDENTIALS.password}`
      )
    }

    // ── REAL MODE login ──
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const logout = async () => {
    if (IS_DEV_MODE) {
      sessionStorage.removeItem(DEV_STORAGE_KEY)
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAdmin: !!user, isDevMode: IS_DEV_MODE }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
