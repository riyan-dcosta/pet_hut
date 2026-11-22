import { mapUser } from './authUser.js'

export async function fetchAccountUser(auth) {
  const { data, error } = await auth.getUser()
  if (error) throw new Error(`Unable to load account methods: ${error.message}`)
  const user = mapUser(data.user)
  if (!user) throw new Error('Your sign-in session is no longer available.')
  return user
}

export async function requestEmailVerification(auth, identifier, normalizeIdentifier, userId) {
  const normalized = normalizeIdentifier('email', identifier)
  const currentUser = await fetchAccountUser(auth)
  if (currentUser.id !== userId) throw new Error('Your account changed. Reopen account settings and try again.')
  if (currentUser.email) {
    throw new Error('A verified email is already on this account.')
  }
  const { error } = await auth.updateUser({ email: normalized })
  if (error) throw new Error(`Unable to start email verification: ${error.message}`)
  return { identifier: normalized, userId }
}

export async function verifyEmail(auth, pending, code) {
  const { identifier, userId } = pending
  const before = await fetchAccountUser(auth)
  if (before.id !== userId) throw new Error('Your account changed. Start verification again.')
  const { error } = await auth.verifyOtp({
    email: identifier,
    token: code,
    type: 'email_change',
  })
  if (error) throw new Error(`Unable to verify email: ${error.message}`)
  const user = await fetchAccountUser(auth)
  if (user.id !== userId) throw new Error('Your account changed during verification. Check your account before continuing.')
  if (user.email !== identifier) {
    throw new Error('The email is not verified yet. Complete any additional confirmation and try again.')
  }
  return user
}
