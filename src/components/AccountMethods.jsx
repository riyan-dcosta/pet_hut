import { useEffect, useState } from 'react'
import { getAccountUser, linkGoogleIdentity, requestEmailCode, verifyEmailCode } from '../services/authService.js'

export default function AccountMethods({ user, onUserUpdate, notice }) {
  const [account, setAccount] = useState(null)
  const [addingEmail, setAddingEmail] = useState(false)
  const [identifier, setIdentifier] = useState('')
  const [code, setCode] = useState('')
  const [pending, setPending] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    getAccountUser()
      .then((current) => {
        if (active) {
          if (current.id !== user.id) throw new Error('Your account changed. Reopen account settings and try again.')
          setAccount(current)
          onUserUpdate(current)
        }
      })
      .catch((failure) => {
        if (active) setError(failure.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [user.id, onUserUpdate])

  const startGoogleLink = async () => {
    setError('')
    setMessage('')
    setBusy(true)
    try {
      await linkGoogleIdentity(user.id)
    } catch (failure) {
      setError(failure.message)
      setBusy(false)
    }
  }

  const sendCode = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try {
      setPending(await requestEmailCode(identifier, user.id))
      setCode('')
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  const confirmCode = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const current = await verifyEmailCode(pending, code.trim())
      setAccount(current)
      onUserUpdate(current)
      setPending(null)
      setAddingEmail(false)
      setIdentifier('')
      setCode('')
      setMessage('Email verified.')
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  const cancel = () => {
    setAddingEmail(false)
    setIdentifier('')
    setCode('')
    setPending(null)
    setError('')
    setMessage('Verification cancelled on this device.')
  }

  return (
    <div className="mt-6 border-t border-stone-200 pt-5">
      <h3 className="text-sm font-semibold text-stone-900">Sign-in methods</h3>
      {notice && <p className="mt-3 text-sm text-stone-700" role="status">{notice}</p>}
      {loading ? (
        <p className="mt-3 text-sm text-stone-500" role="status">Loading account methods…</p>
      ) : account && (
        <>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            <li>Google: {account.providers.includes('google') ? 'Linked' : 'Not linked'}</li>
            <li>Email: {account.email ? 'Verified' : 'Not verified'}</li>
            {account.phone && <li>Phone: Verified</li>}
          </ul>
          {!account.providers.includes('google') && (
            <button type="button" disabled={busy} onClick={startGoogleLink}
              className="mt-4 min-h-11 w-full rounded-full border border-stone-300 px-4 text-sm hover:border-stone-900 disabled:opacity-50">
              {busy && !addingEmail ? 'Connecting…' : 'Link Google'}
            </button>
          )}
          {!addingEmail && !account.email && (
            <button type="button" disabled={busy} onClick={() => { setAddingEmail(true); setMessage('') }}
              className="mt-3 min-h-11 text-sm text-stone-700 underline underline-offset-4">Add email</button>
          )}
          {addingEmail && (
            <form className="mt-4" onSubmit={pending ? confirmCode : sendCode}>
              {pending ? (
                <>
                  <p className="break-all text-sm text-stone-600">Enter the code sent to {pending.identifier}.</p>
                  <label htmlFor="account-code" className="mt-3 block text-sm font-medium">Verification code</label>
                  <input id="account-code" type="text" inputMode="numeric" autoComplete="one-time-code"
                    pattern="[0-9]{6}" maxLength={6} required disabled={busy} value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm" />
                </>
              ) : (
                <>
                  <label htmlFor="account-contact" className="block text-sm font-medium">
                    Email address
                  </label>
                  <input id="account-contact" type="email"
                    autoComplete="email" required disabled={busy}
                    value={identifier} onChange={(event) => setIdentifier(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm" />
                </>
              )}
              <button type="submit" disabled={busy}
                className="mt-3 min-h-11 w-full rounded-full bg-stone-900 px-4 text-sm text-white disabled:opacity-50">
                {busy ? 'Please wait…' : pending ? 'Verify email' : 'Send verification code'}
              </button>
              <button type="button" disabled={busy} onClick={cancel}
                className="mt-2 min-h-11 w-full text-sm text-stone-600 underline underline-offset-4">Cancel</button>
            </form>
          )}
        </>
      )}
      {message && <p className="mt-3 text-sm text-stone-600" role="status">{message}</p>}
      {error && <p className="mt-3 text-sm text-rose-700" role="alert">{error}</p>}
    </div>
  )
}
