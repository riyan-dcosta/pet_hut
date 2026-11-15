import { useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AuthDialog from './components/AuthDialog.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Footer from './components/Footer.jsx'
import Navbar from './components/Navbar.jsx'
import PincodeChecker from './components/PincodeChecker.jsx'
import PetShowcase from './components/PetShowcase.jsx'
import Testimonials from './components/Testimonials.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrderConfirmationPage from './pages/OrderConfirmationPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import ShopPage from './pages/ShopPage.jsx'
import { getCartSummary, loadCart, saveCart } from './services/cartService.js'
import { getCurrentUser } from './services/authService.js'
import { placeOrder } from './services/orderService.js'
import { checkPincodeServiceability } from './services/pincodeService.js'

export default function App() {
  return (
    <BrowserRouter>
      <StoreLayout />
    </BrowserRouter>
  )
}

function StoreLayout() {
  const navigate = useNavigate()
  const [cartOpen, setCartOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [continueAfterAuth, setContinueAfterAuth] = useState(false)
  const [user, setUser] = useState(getCurrentUser)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [cartItems, setCartItems] = useState(loadCart)
  const [pincode, setPincode] = useState(
    () => window.localStorage.getItem('pet-hut-pincode') ?? '',
  )
  const [pincodeResult, setPincodeResult] = useState(() => {
    const savedPincode = window.localStorage.getItem('pet-hut-pincode')
    return savedPincode ? checkPincodeServiceability(savedPincode) : null
  })
  const closeCart = useCallback(() => setCartOpen(false), [])
  useEffect(() => {
    saveCart(cartItems)
  }, [cartItems])
  useEffect(() => {
    if (pincode) {
      window.localStorage.setItem('pet-hut-pincode', pincode)
    } else {
      window.localStorage.removeItem('pet-hut-pincode')
    }
  }, [pincode])
  const handlePincodeChange = useCallback((value) => {
    setPincode(value)
    setPincodeResult(null)
  }, [])
  const handlePincodeCheck = useCallback(() => {
    setPincodeResult(checkPincodeServiceability(pincode))
  }, [pincode])

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
  const canCheckout = Boolean(pincodeResult?.serviceable && cartItems.length > 0)
  const handleCheckout = useCallback(() => {
    if (!pincodeResult?.serviceable) {
      setCheckoutMessage('Check a serviceable Karnataka pincode before checkout.')
      return
    }
    setCheckoutMessage('')
    if (user) {
      setCartOpen(false)
      navigate('/checkout')
      return
    }
    setContinueAfterAuth(true)
    setAuthOpen(true)
  }, [navigate, pincodeResult, user])
  const handleAuthenticated = useCallback((signedInUser) => {
    setUser(signedInUser)
    setAuthOpen(false)
    if (continueAfterAuth) {
      setContinueAfterAuth(false)
      setCartOpen(false)
      navigate('/checkout')
    }
  }, [continueAfterAuth, navigate])
  const handleSignedOut = useCallback(() => setUser(null), [])
  const handlePlaceOrder = useCallback((address) => {
    const order = placeOrder({ user, cartItems, address, pincodeResult })
    setCartItems([])
    setCartOpen(false)
    navigate(`/orders/${order.id}/confirmation`)
  }, [cartItems, navigate, pincodeResult, user])

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <Navbar
        onCartClick={() => setCartOpen(true)}
        onSignInClick={() => setAuthOpen(true)}
        cartCount={cartCount}
        isAuthenticated={Boolean(user)}
      />
      <main className="flex-1">
        <Routes>
          <Route
            path="*"
            element={
              <>
                <PetShowcase />
                <Testimonials />
              </>
            }
          />
          <Route
            path="/shop"
            element={
              <ShopPage
                onAddToCart={addToCart}
                pincode={pincode}
                pincodeResult={pincodeResult}
                onPincodeChange={handlePincodeChange}
                onPincodeCheck={handlePincodeCheck}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              user && cartItems.length > 0 ? (
                <CheckoutPage
                  user={user}
                  pincodeResult={pincodeResult}
                  cartItems={cartSummary.items}
                  subtotalRupees={cartSummary.subtotalRupees}
                  discountRupees={cartSummary.discountRupees}
                  totalRupees={cartSummary.totalRupees}
                  onPlaceOrder={handlePlaceOrder}
                />
              ) : (
                <Navigate to="/shop" replace />
              )
            }
          />
          <Route
            path="/orders"
            element={user ? <OrdersPage user={user} /> : <Navigate to="/" replace />}
          />
          <Route path="/orders/:orderId/confirmation" element={<OrderConfirmationPage />} />
        </Routes>
      </main>
      <Footer onSignInClick={() => setAuthOpen(true)} isAuthenticated={Boolean(user)} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={closeCart}
        onQuantityChange={updateCartQuantity}
        pincode={pincode}
        pincodeResult={pincodeResult}
        onPincodeChange={handlePincodeChange}
        onPincodeCheck={handlePincodeCheck}
        canCheckout={canCheckout}
        checkoutMessage={checkoutMessage}
        onCheckout={handleCheckout}
        isAuthenticated={Boolean(user)}
        {...cartSummary}
      />
      <AuthDialog
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        user={user}
        onAuthenticated={handleAuthenticated}
        onSignedOut={handleSignedOut}
      />
    </div>
  )
}
