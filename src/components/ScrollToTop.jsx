import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop – Scrolls window to (0,0) on every route change.
 * Place inside <BrowserRouter> so it has access to location.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
