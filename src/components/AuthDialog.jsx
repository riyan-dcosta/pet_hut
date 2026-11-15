import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { requestDemoOtp, signOut, verifyDemoOtp } from '../services/authService.js'

export default function AuthDialog({ isOpen, onClose, user, onAuthenticated, onSignedOut }) {
  const [method, setMethod] = useState('phone')
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [requestedCode, setRequestedCode] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleRequestCode = (event) => {
    event.preventDefault()
    setError('')
    try {
      setRequestedCode(requestDemoOtp(method, identifier))
      setCode('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleVerifyCode = (event) => {
    event.preventDefault()
    setError('')
    try {
      const signedInUser = verifyDemoOtp(method, identifier, code.trim())
      setRequestedCode(null)
      onAuthenticated(signedInUser)
    } catch (verificationError) {
      setError(verificationError.message)
    }
  }

  const handleSignOut = () => {
    signOut()
    onSignedOut()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-stone-950/40"
        onClick={onClose}
        aria-label="Close sign-in"
      />
      <section
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
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
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-6 text-sm text-stone-600 underline underline-offset-4 hover:text-stone-900"
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
              Sign in to continue. This local demo does not send a real email or SMS.
            </p>

            <div className="mt-6 grid grid-cols-2 rounded-full bg-stone-100 p-1">
              {['phone', 'email'].map((option) => (
                <button
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
                  className="mt-4 w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
                >
                  Send demo code
                </button>
              </form>
            ) : (
              <form className="mt-5" onSubmit={handleVerifyCode}>
                <p className="text-sm text-stone-600">
                  Enter the demo code for {requestedCode.identifier}.
                </p>
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Demo code: <strong className="font-semibold">{requestedCode.demoCode}</strong>
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
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                  className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm tracking-[0.3em] outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
                />
                <button
                  type="submit"
                  className="mt-4 w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white hover:bg-stone-700"
                >
                  Verify and sign in
                </button>
                <button
                  type="button"
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

            {error && (
              <p className="mt-4 text-sm text-rose-700" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </section>
    </div>
  )
}
