const AUTH_STORAGE_KEY = 'pet-hut-auth-user'
const DEMO_OTP_TTL_MS = 5 * 60 * 1000
const pendingOtps = new Map()

function normalizeIdentifier(method, identifier) {
  const value = identifier.trim()

  if (method === 'email') {
    const email = value.toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Enter a valid email address.')
    }
    return email
  }

  const phone = value.replace(/[\s()-]/g, '')
  if (!/^(?:\+91)?[6-9]\d{9}$/.test(phone)) {
    throw new Error('Enter a valid 10-digit Indian mobile number.')
  }
  return phone.startsWith('+91') ? phone.slice(3) : phone
}

export function getCurrentUser() {
  const savedUser = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!savedUser) return null

  let user
  try {
    user = JSON.parse(savedUser)
  } catch (error) {
    console.warn('Unable to read saved sign-in state.', error)
  }

  if (
    user &&
    typeof user.identifier === 'string' &&
    (user.method === 'email' || user.method === 'phone')
  ) {
    try {
      return {
        ...user,
        identifier: normalizeIdentifier(user.method, user.identifier),
      }
    } catch {}
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY)
  return null
}

export function requestDemoOtp(method, identifier) {
  if (method !== 'email' && method !== 'phone') {
    throw new Error('Choose email or phone sign-in.')
  }

  const normalizedIdentifier = normalizeIdentifier(method, identifier)
  const values = new Uint32Array(1)
  window.crypto.getRandomValues(values)
  const code = String(values[0] % 1000000).padStart(6, '0')

  pendingOtps.set(`${method}:${normalizedIdentifier}`, {
    code,
    expiresAt: Date.now() + DEMO_OTP_TTL_MS,
  })

  return { method, identifier: normalizedIdentifier, demoCode: code }
}

export function verifyDemoOtp(method, identifier, code) {
  const normalizedIdentifier = normalizeIdentifier(method, identifier)
  const key = `${method}:${normalizedIdentifier}`
  const pendingOtp = pendingOtps.get(key)

  if (!pendingOtp || pendingOtp.expiresAt < Date.now()) {
    pendingOtps.delete(key)
    throw new Error('Request a new demo code to continue.')
  }

  if (code !== pendingOtp.code) {
    throw new Error('That code does not match. Check it and try again.')
  }

  pendingOtps.delete(key)
  const user = {
    method,
    identifier: normalizedIdentifier,
    signedInAt: new Date().toISOString(),
  }
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  return user
}

export function signOut() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}
