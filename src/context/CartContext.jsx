import { createContext, useContext, useEffect, useReducer } from 'react'

const CartContext = createContext(null)

const initialState = {
  items: [],
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { items: action.payload }

    case 'ADD_ITEM': {
      const { product, quantity, size } = action.payload
      const existingIndex = state.items.findIndex(
        item => item.id === product.id && item.selectedSize === size
      )
      if (existingIndex >= 0) {
        const updated = [...state.items]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return { items: updated }
      }
      return {
        items: [...state.items, { ...product, quantity, selectedSize: size }],
      }
    }

    case 'REMOVE_ITEM':
      return { items: state.items.filter(item => !(item.id === action.payload.id && item.selectedSize === action.payload.size)) }

    case 'UPDATE_QTY': {
      const { id, size, quantity } = action.payload
      if (quantity <= 0) {
        return { items: state.items.filter(item => !(item.id === id && item.selectedSize === size)) }
      }
      return {
        items: state.items.map(item =>
          item.id === id && item.selectedSize === size ? { ...item, quantity } : item
        ),
      }
    }

    case 'CLEAR':
      return { items: [] }

    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('himaya_cart')
      if (saved) {
        dispatch({ type: 'LOAD', payload: JSON.parse(saved) })
      }
    } catch {}
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('himaya_cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (product, quantity = 1, size = 'Free Size') => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity, size } })
  }

  const removeItem = (id, size) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, size } })
  }

  const updateQty = (id, size, quantity) => {
    dispatch({ type: 'UPDATE_QTY', payload: { id, size, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR' })
    localStorage.removeItem('himaya_cart')
  }

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
