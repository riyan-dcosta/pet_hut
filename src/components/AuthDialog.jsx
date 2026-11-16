import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { requestOtp, signOut, verifyOtp } from '../services/authService.js'

export default function AuthDialog({ isOpen, onClose, user, onAuthenticated, onSignedOut }) {
  const [method, setMethod] = useState('phone')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [requestedCode, setRequestedCode] = useState(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousActiveElement = document.activeElement
    const getFocusableElements = () =>
      Array.from(
        dialogRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0)
    const initialFocusTarget = getFocusableElements()[0] ?? dialogRef.current
    initialFocusTarget?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const first = focusableElements[0]
      const last = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === last || !dialogRef.current?.contains(document.activeElement))
      ) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement?.isConnected) previousActiveElement.focus()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleRequestCode = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      setRequestedCode(await requestOtp(method, identifier))
      setCode('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const signedInUser = await verifyOtp(method, requestedCode.identifier, code.trim())
      setRequestedCode(null)
      onAuthenticated(signedInUser)
    } catch (verificationError) {
      setError(verificationError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    setError('')
    setIsSubmitting(true)
    try {
      await signOut()
      onSignedOut()
    } catch (signOutError) {
      setError(signOutError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-2 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-stone-950/40"
        onClick={onClose}
        aria-label="Close sign-in"
      />
      <section
        ref={dialogRef}
        className="relative z-10 max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        tabIndex={-1}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sign-in"
          className="absolute right-5 top-5 text-stone-500 hover:text-stone-900"
        >
          <X size={20} />
        </button>

        {user ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              Signed in
            </p>
            <h2 id="auth-title" className="mt-3 text-2xl font-medium text-stone-900">
              Welcome, pet parent.
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Signed in with {user.identifier}. Your cart stays saved. Open your cart to continue
              checkout.
            </p>
            <Link
              to="/orders"
              onClick={onClose}
              className="mt-5 inline-block text-sm font-medium text-stone-800 underline underline-offset-4"
            >
              View your orders
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSubmitting}
              className="ml-5 mt-6 text-sm text-stone-600 underline underline-offset-4 hover:text-stone-900"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
              Checkout sign-in
            </p>
            <h2 id="auth-title" className="mt-3 text-2xl font-medium text-stone-900">
              Your cart is saved.
            </h2>
            <p className="mt-3 text-sm leading-6 text-stone-600">
              Sign in to continue. A one-time code will be sent to your email or phone.
            </p>

            <div className="mt-6 grid grid-cols-2 rounded-full bg-stone-100 p-1">
              {['phone', 'email'].map((option) => (
                <button
                  disabled={isSubmitting}
                  key={option}
                  type="button"
                  onClick={() => {
                    setMethod(option)
                    setRequestedCode(null)
                    setError('')
                  }}
                  aria-pressed={method === option}
                  className={`rounded-full py-2 text-sm capitalize ${
                    method === option
                      ? 'bg-white font-medium text-stone-900 shadow-sm'
                      : 'text-stone-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {!requestedCode ? (
              <form className="mt-5" onSubmit={handleRequestCode}>
                <label htmlFor="auth-identifier" className="text-sm font-medium text-stone-800">
                  {method === 'phone' ? 'Indian mobile number' : 'Email address'}
                </label>
                <input
                  id="auth-identifier"
                  type={method === 'phone' ? 'tel' : 'email'}
                  autoComplete={method === 'phone' ? 'tel' : 'email'}
                  inputMode={method === 'phone' ? 'tel' : 'email'}
                  required
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder={method === 'phone' ? '98765 43210' : 'you@example.com'}
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
                >
                  {isSubmitting ? 'Sending…' : 'Send code'}
                </button>
              </form>
            ) : (
              <form className="mt-5" onSubmit={handleVerifyCode}>
                <p className="text-sm text-stone-600">
                  Enter the code sent to {requestedCode.identifier}.
                </p>
                <label htmlFor="auth-code" className="mt-4 block text-sm font-medium text-stone-800">
                  6-digit code
                </label>
                <input
                  id="auth-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  disabled={isSubmitting}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm tracking-[0.3em] outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-4 w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
                >
                  {isSubmitting ? 'Verifying…' : 'Verify and sign in'}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setRequestedCode(null)
                    setCode('')
                    setError('')
                  }}
                  className="mt-3 w-full text-sm text-stone-600 hover:text-stone-900"
                >
                  Use a different {method === 'phone' ? 'number' : 'email'}
                </button>
              </form>
            )}

          </>
        )}
        {error && (
          <p className="mt-4 text-sm text-rose-700" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  )
}
