import { useCallback, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import CartDrawer from './components/CartDrawer.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'

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
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Coming together for pets
          </p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight">Pet Hut</h1>
        </div>
      </main>
      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={closeCart} />
    </div>
  )
}
