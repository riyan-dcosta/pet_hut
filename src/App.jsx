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
import {
  getCartSummary,
  loadCart,
  MAX_CART_QUANTITY,
  saveCart,
} from './services/cartService.js'
import {
  getCurrentUser,
  getAccountUser,
  subscribeToAuthChanges,
} from './services/authService.js'
import { placeOrder } from './services/orderService.js'
import { checkPincodeServiceability } from './services/pincodeService.js'
import { getGoogleCallbackError, takeGoogleAuthIntent, takeGoogleLinkIntent } from './services/googleAuthFlow.js'
import { getAppPath } from './services/appPaths.js'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <StoreLayout />
    </BrowserRouter>
  )
}

function StoreLayout() {
  const navigate = useNavigate()
  const [cartOpen, setCartOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [continueAfterAuth, setContinueAfterAuth] = useState(false)
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [backendError, setBackendError] = useState('')
  const [accountNotice, setAccountNotice] = useState('')
  const [callbackError] = useState(() =>
    window.location.pathname === getAppPath('/auth/callback')
      ? getGoogleCallbackError(window.location)
      : '',
  )
  const [isGoogleCallback] = useState(() => window.location.pathname === getAppPath('/auth/callback'))
  const [googleCallbackHandled, setGoogleCallbackHandled] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState('')
  const [cartItems, setCartItems] = useState(loadCart)
  const [cartSummary, setCartSummary] = useState({
    items: [],
    subtotalRupees: 0,
    discountRupees: 0,
    totalRupees: 0,
  })
  const [isCartLoading, setIsCartLoading] = useState(true)
  const [cartError, setCartError] = useState('')
  const [cartRetry, setCartRetry] = useState(0)
  const [pincode, setPincode] = useState(
    () => window.localStorage.getItem('pet-hut-pincode') ?? '',
  )
  const [pincodeResult, setPincodeResult] = useState(null)
  const [isPincodeChecking, setIsPincodeChecking] = useState(() =>
    Boolean(window.localStorage.getItem('pet-hut-pincode')),
  )
  const [pincodeError, setPincodeError] = useState('')
  const closeCart = useCallback(() => setCartOpen(false), [])

  useEffect(() => {
    let active = true
    let unsubscribe

    try {
      unsubscribe = subscribeToAuthChanges((nextUser) => {
        if (active) setUser(nextUser)
      })
      getCurrentUser()
        .then((currentUser) => {
          if (active) {
            setUser(currentUser)
            setBackendError('')
          }
        })
        .catch((error) => {
          if (active) setBackendError(error.message)
        })
        .finally(() => {
          if (active) setIsAuthLoading(false)
        })
    } catch (error) {
      setBackendError(error.message)
      setIsAuthLoading(false)
    }

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    saveCart(cartItems)
  }, [cartItems])

  useEffect(() => {
    let active = true
    setIsCartLoading(true)
    setCartError('')
    getCartSummary(cartItems)
      .then((summary) => {
        if (active) setCartSummary(summary)
      })
      .catch((error) => {
        if (active) {
          setCartError(error.message)
        }
      })
      .finally(() => {
        if (active) setIsCartLoading(false)
      })

    return () => {
      active = false
    }
  }, [cartItems, cartRetry])

  useEffect(() => {
    if (pincode) {
      window.localStorage.setItem('pet-hut-pincode', pincode)
    } else {
      window.localStorage.removeItem('pet-hut-pincode')
    }
  }, [pincode])

  useEffect(() => {
    if (!pincode) return undefined

    let active = true
    setIsPincodeChecking(true)
    checkPincodeServiceability(pincode)
      .then((result) => {
        if (active) setPincodeResult(result)
      })
      .catch((error) => {
        if (active) setPincodeError(error.message)
      })
      .finally(() => {
        if (active) setIsPincodeChecking(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handlePincodeChange = useCallback((value) => {
    setPincode(value)
    setPincodeResult(null)
    setPincodeError('')
  }, [])
  const handlePincodeCheck = useCallback(async () => {
    setIsPincodeChecking(true)
    setPincodeError('')
    try {
      setPincodeResult(await checkPincodeServiceability(pincode))
    } catch (error) {
      setPincodeResult(null)
      setPincodeError(error.message)
    } finally {
      setIsPincodeChecking(false)
    }
  }, [pincode])

  const addToCart = useCallback((product) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.productId === product.id)
      if (existing) {
        return items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_CART_QUANTITY) }
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
            ? { ...item, quantity: Math.min(item.quantity + change, MAX_CART_QUANTITY) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [])
  const canCheckout = Boolean(
    pincodeResult?.serviceable &&
      pincodeResult.pincode === pincode.trim() &&
      cartItems.length > 0 &&
      !isCartLoading &&
      !cartError &&
      !cartSummary.items.some((item) => item.unavailable) &&
      !isAuthLoading,
  )
  useEffect(() => {
    if (!isGoogleCallback || googleCallbackHandled || isAuthLoading || isCartLoading || isPincodeChecking) return

    setGoogleCallbackHandled(true)
    const linkUserId = takeGoogleLinkIntent(window.sessionStorage)
    if (linkUserId) {
      const finishLink = async () => {
        try {
          if (callbackError) throw new Error('Google linking was cancelled or failed. If this Google account already belongs to a Pet Hut account, sign in with Google to access that account. Orders remain with their original accounts; nothing was transferred or merged.')
          if (backendError || !user || user.id !== linkUserId) throw new Error('Your original account session is unavailable. Please sign in and try again.')
          const current = await getAccountUser()
          if (current.id !== linkUserId || !current.providers.includes('google')) {
            throw new Error('Google was not linked. If this Google account already belongs to another Pet Hut account, sign in with Google to access that account. Orders remain with their original accounts; nothing was transferred or merged.')
          }
          setUser(current)
          setAccountNotice('Google is linked to your account.')
        } catch (error) {
          if (!user || user.id !== linkUserId) {
            setBackendError(error.message)
          } else {
            setAccountNotice(error.message)
          }
        }
        if (user && user.id === linkUserId) setAuthOpen(true)
        navigate('/shop', { replace: true })
      }
      finishLink()
      return
    }
    const intent = takeGoogleAuthIntent(window.sessionStorage)
    if (callbackError || backendError || !user) {
      setBackendError(callbackError || backendError || 'Google sign-in could not be completed. Please try again.')
      navigate('/shop', { replace: true })
      return
    }

    if (intent === 'checkout' && canCheckout) {
      navigate('/checkout', { replace: true })
    } else {
      if (intent === 'checkout') {
        setCartOpen(true)
        setCheckoutMessage('Please check your cart and delivery pincode before checkout.')
      }
      navigate('/shop', { replace: true })
    }
  }, [backendError, callbackError, canCheckout, googleCallbackHandled, isAuthLoading, isCartLoading, isGoogleCallback, isPincodeChecking, navigate, user])

  const handleCheckout = useCallback(() => {
    if (!pincodeResult?.serviceable || pincodeResult.pincode !== pincode.trim()) {
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
  }, [navigate, pincode, pincodeResult, user])
  const handleAuthenticated = useCallback((signedInUser) => {
    setUser(signedInUser)
    setBackendError('')
    setAuthOpen(false)
    if (continueAfterAuth) {
      setContinueAfterAuth(false)
      setCartOpen(false)
      navigate('/checkout')
    }
  }, [continueAfterAuth, navigate])
  const handleSignedOut = useCallback(() => setUser(null), [])
  const handleAuthClose = useCallback(() => {
    setAuthOpen(false)
    setAccountNotice('')
    setContinueAfterAuth(false)
  }, [])
  const handlePlaceOrder = useCallback(async (address) => {
    const order = await placeOrder({ user, cartItems, address, pincodeResult })
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
        user={user}
      />
      {backendError && (
        <p className="bg-rose-50 px-5 py-3 text-center text-sm text-rose-800" role="alert">
          {backendError}
        </p>
      )}
      <main className="flex-1">
        <Routes>
          <Route
            path="/auth/callback"
            element={
              <p className="mx-auto max-w-2xl px-4 py-12 text-center text-stone-600" role="status">
                Completing sign-in…
              </p>
            }
          />
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
                isPincodeChecking={isPincodeChecking}
                pincodeError={pincodeError}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              isAuthLoading || isCartLoading ? (
                <p className="mx-auto max-w-2xl px-4 py-12 text-center text-stone-600 sm:px-5 sm:py-20" role="status">
                  Preparing your checkout…
                </p>
              ) : user &&
                cartItems.length > 0 &&
                !cartError &&
                !cartSummary.items.some((item) => item.unavailable) ? (
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
            element={
              isAuthLoading ? (
                <p className="mx-auto max-w-2xl px-4 py-12 text-center text-stone-600 sm:px-5 sm:py-20" role="status">
                  Loading your account…
                </p>
              ) : user ? (
                <OrdersPage user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/orders/:orderId/confirmation"
            element={
              isAuthLoading ? (
                <p className="mx-auto max-w-2xl px-4 py-12 text-center text-stone-600 sm:px-5 sm:py-20" role="status">
                  Loading your account…
                </p>
              ) : user ? (
                <OrderConfirmationPage user={user} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
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
        isPincodeChecking={isPincodeChecking}
        pincodeError={pincodeError}
        cartError={cartError}
        isCartLoading={isCartLoading}
        cartCount={cartCount}
        onRetryCart={() => setCartRetry((current) => current + 1)}
        onClearCart={() => setCartItems([])}
        canCheckout={canCheckout}
        checkoutMessage={checkoutMessage}
        onCheckout={handleCheckout}
        isAuthenticated={Boolean(user)}
        {...cartSummary}
      />
      <AuthDialog
        isOpen={authOpen}
        onClose={handleAuthClose}
        user={user}
        onAuthenticated={handleAuthenticated}
        onSignedOut={handleSignedOut}
        onUserUpdate={setUser}
        accountNotice={accountNotice}
        continueAfterAuth={continueAfterAuth}
      />
    </div>
  )
}
