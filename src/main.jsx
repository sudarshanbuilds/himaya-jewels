import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ── Global safety net for Supabase auth token errors ──────────
// When a stored Supabase refresh token expires, the client throws
// an unhandled AuthApiError that React (in production) treats as
// a fatal error and unmounts the entire app (blank white page).
// This handler catches it silently and lets React keep running.
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || ''
  if (
    msg.includes('Refresh Token') ||
    msg.includes('Invalid Refresh Token') ||
    msg.includes('AuthApiError') ||
    event.reason?.name === 'AuthApiError'
  ) {
    console.warn('[Himaya] Expired auth token detected — clearing session silently.')
    event.preventDefault() // stop React from treating this as a fatal crash

    // Clear all Supabase auth keys from both storages
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('sb-') || k.includes('supabase'))
        .forEach(k => localStorage.removeItem(k))
      Object.keys(sessionStorage)
        .filter(k => k.startsWith('sb-') || k.includes('supabase'))
        .forEach(k => sessionStorage.removeItem(k))
    } catch {}
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
