import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const UserAuthContext = createContext(null)

export function UserAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const register = async (email, password, name) => {
    if (!isSupabaseConfigured)
      throw new Error('Authentication requires Supabase to be configured. Please contact the store admin.')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, display_name: name } },
    })
    if (error) throw error
    return data
  }

  const login = async (email, password) => {
    if (!isSupabaseConfigured)
      throw new Error('Authentication requires Supabase to be configured. Please contact the store admin.')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const logout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut()
    setUser(null)
  }

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Customer'

  return (
    <UserAuthContext.Provider
      value={{ user, loading, login, logout, register, isLoggedIn: !!user, displayName }}
    >
      {children}
    </UserAuthContext.Provider>
  )
}

export const useUserAuth = () => useContext(UserAuthContext)
