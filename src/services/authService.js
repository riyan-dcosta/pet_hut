import { getSupabaseClient } from './supabaseClient.js'
import { saveGoogleAuthIntent, takeGoogleAuthIntent, saveGoogleLinkIntent, takeGoogleLinkIntent } from './googleAuthFlow.js'
import { mapUser } from './authUser.js'
import { fetchAccountUser, requestEmailVerification, verifyEmail } from './accountLinking.js'
import { getAppPath } from './appPaths.js'

function normalizeIdentifier(method, identifier) {
  const value = identifier.trim()

  if (method === 'email') {
    const email = value.toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Enter a valid email address.')
    }
    return email
  }

  if (method !== 'phone') throw new Error('Choose email or phone sign-in.')

  const phone = value.replace(/[\s()-]/g, '')
  if (!/^(?:\+91)?[6-9]\d{9}$/.test(phone)) {
    throw new Error('Enter a valid 10-digit Indian mobile number.')
  }
  return phone.startsWith('+91') ? phone : `+91${phone}`
}

export async function getCurrentUser(supabase = getSupabaseClient()) {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new Error(`Unable to restore sign-in: ${error.message}`)
  return mapUser(data.session?.user)
}

export function subscribeToAuthChanges(onChange) {
  const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
    onChange(mapUser(session?.user))
  })

  return () => data.subscription.unsubscribe()
}

export async function requestOtp(method, identifier) {
  const normalizedIdentifier = normalizeIdentifier(method, identifier)
  const supabase = getSupabaseClient()
  const request =
    method === 'email'
      ? supabase.auth.signInWithOtp({ email: normalizedIdentifier })
      : supabase.auth.signInWithOtp({ phone: normalizedIdentifier })
  const { error } = await request

  if (error) throw new Error(`Unable to send sign-in code: ${error.message}`)
  return { method, identifier: normalizedIdentifier }
}

export async function verifyOtp(method, identifier, code) {
  const normalizedIdentifier = normalizeIdentifier(method, identifier)
  const supabase = getSupabaseClient()
  const request =
    method === 'email'
      ? supabase.auth.verifyOtp({
          email: normalizedIdentifier,
          token: code,
          type: 'email',
        })
      : supabase.auth.verifyOtp({
          phone: normalizedIdentifier,
          token: code,
          type: 'sms',
        })
  const { data, error } = await request

  if (error) throw new Error(`Unable to verify sign-in code: ${error.message}`)
  const user = mapUser(data.user)
  if (!user) throw new Error('Sign-in succeeded without an account identifier.')
  return user
}

export async function signInWithGoogle(continueCheckout = false) {
  const supabase = getSupabaseClient()
  takeGoogleLinkIntent(window.sessionStorage)
  saveGoogleAuthIntent(window.sessionStorage, continueCheckout)
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${getAppPath('/auth/callback')}` },
    })
    if (error) throw new Error(`Unable to start Google sign-in: ${error.message}`)
  } catch (error) {
    takeGoogleAuthIntent(window.sessionStorage)
    throw error
  }
}

export async function getAccountUser() {
  return fetchAccountUser(getSupabaseClient().auth)
}

export async function linkGoogleIdentity(userId) {
  const auth = getSupabaseClient().auth
  const currentUser = await fetchAccountUser(auth)
  if (currentUser.id !== userId) throw new Error('Your account changed. Reopen account settings and try again.')
  if (currentUser.providers.includes('google')) throw new Error('Google is already linked to this account.')
  takeGoogleAuthIntent(window.sessionStorage)
  saveGoogleLinkIntent(window.sessionStorage, userId)
  try {
    const { error } = await auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${getAppPath('/auth/callback')}` },
    })
    if (error) throw new Error(`Unable to link Google: ${error.message}`)
  } catch (error) {
    takeGoogleLinkIntent(window.sessionStorage)
    throw error
  }
}

export async function requestEmailCode(identifier, userId) {
  return requestEmailVerification(getSupabaseClient().auth, identifier, normalizeIdentifier, userId)
}

export async function verifyEmailCode(pending, code) {
  return verifyEmail(getSupabaseClient().auth, pending, code)
}

export async function signOut() {
  const { error } = await getSupabaseClient().auth.signOut()
  if (error) throw new Error(`Unable to sign out: ${error.message}`)
}
