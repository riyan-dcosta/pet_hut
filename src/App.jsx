import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CartDrawer from './components/CartDrawer.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import PetShowcase from './components/PetShowcase.jsx'
import Testimonials from './components/Testimonials.jsx'
import ShopPage from './pages/ShopPage.jsx'
import { getCartSummary, loadCart, saveCart } from './services/cartService.js'

export default function App() {
  return (
    <BrowserRouter>
      <StoreLayout />
    </BrowserRouter>
  )
}

function StoreLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState(loadCart)
  const closeCart = useCallback(() => setCartOpen(false), [])
  useEffect(() => {
    saveCart(cartItems)
  }, [cartItems])

  const addToCart = useCallback((product) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.productId === product.id)
      if (existing) {
        return items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...items, { productId: product.id, quantity: 1 }]
    })
  }, [])
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const updateCartQuantity = useCallback((productId, change) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + change }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [])
  const cartSummary = getCartSummary(cartItems)

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <Navbar onCartClick={() => setCartOpen(true)} cartCount={cartCount} />
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <PetShowcase />
                <Testimonials />
              </>
            }
          />
          <Route path="/shop" element={<ShopPage onAddToCart={addToCart} />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer
        isOpen={cartOpen}
        onClose={closeCart}
        onQuantityChange={updateCartQuantity}
        {...cartSummary}
      />
    </div>
  )
}
