import { useCallback, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import CartDrawer from './components/CartDrawer.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import PetShowcase from './components/PetShowcase.jsx'
import Testimonials from './components/Testimonials.jsx'
import ShopPage from './pages/ShopPage.jsx'
import { getSeasonalPrice } from './services/seasonalOfferService.js'

export default function App() {
  return (
    <BrowserRouter>
      <StoreLayout />
    </BrowserRouter>
  )
}

function StoreLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const closeCart = useCallback(() => setCartOpen(false), [])
  const addToCart = useCallback((product, unitPriceRupees) => {
    const price = unitPriceRupees ?? getSeasonalPrice(product).priceRupees
    setCartItems((items) => {
      const existing = items.find((item) => item.product.id === product.id)
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        )
      }
      return [...items, { product, quantity: 1, unitPriceRupees: price }]
    })
  }, [])
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

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
      <CartDrawer isOpen={cartOpen} onClose={closeCart} items={cartItems} />
    </div>
  )
}
