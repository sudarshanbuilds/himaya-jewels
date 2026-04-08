import { createContext, useContext, useEffect, useState } from 'react'

const FavoritesContext = createContext(null)

function getSessionId() {
  let sid = localStorage.getItem('himaya_session_id')
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 11)
    localStorage.setItem('himaya_session_id', sid)
  }
  return sid
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  const sessionId = getSessionId()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`himaya_favs_${sessionId}`)
      if (saved) setFavorites(JSON.parse(saved))
    } catch {}
  }, [])

  const saveFavorites = (items) => {
    setFavorites(items)
    localStorage.setItem(`himaya_favs_${sessionId}`, JSON.stringify(items))
  }

  const isFavorite = (productId) => favorites.some(f => f.id === productId)

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      saveFavorites(favorites.filter(f => f.id !== product.id))
    } else {
      saveFavorites([...favorites, product])
    }
  }

  const removeFavorite = (productId) => {
    saveFavorites(favorites.filter(f => f.id !== productId))
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => useContext(FavoritesContext)
