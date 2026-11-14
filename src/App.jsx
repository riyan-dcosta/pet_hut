import { useCallback, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import CartDrawer from './components/CartDrawer.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import PetShowcase from './components/PetShowcase.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <StoreLayout />
    </BrowserRouter>
  )
}

function StoreLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  const closeCart = useCallback(() => setCartOpen(false), [])

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <Navbar onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">
        <PetShowcase />
      </main>
      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
    </div>
  )
}
