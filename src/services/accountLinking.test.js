import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fetchAccountUser, requestEmailVerification, verifyEmail } from './accountLinking.js'

const originalUser = {
  id: 'original',
  email: 'user@example.com',
  email_confirmed_at: '2026-01-01',
  identities: [{ provider: 'google' }],
}

function fakeAuth(user = originalUser) {
  let current = user
  const calls = []
  return {
    calls,
    setUser: (next) => { current = next },
    getUser: async () => ({ data: { user: current }, error: null }),
    updateUser: async (attributes) => { calls.push(['update', attributes]); return { error: null } },
    verifyOtp: async (credentials) => { calls.push(['verify', credentials]); return { error: null } },
  }
}

test('reports only verified contacts and actual linked identities', async () => {
  const auth = fakeAuth({ ...originalUser, phone: '+919876543210', phone_confirmed_at: null })
  const user = await fetchAccountUser(auth)
  assert.equal(user.email, 'user@example.com')
  assert.equal(user.phone, null)
  assert.deepEqual(user.providers, ['google'])
})

test('adds and verifies email without replacing an existing verified email', async () => {
  const phoneUser = { id: 'original', phone: '+919876543210', phone_confirmed_at: '2026-01-01' }
  const auth = fakeAuth(phoneUser)
  const pending = await requestEmailVerification(auth, 'new@example.com', (_method, value) => value, 'original')
  assert.deepEqual(auth.calls[0], ['update', { email: 'new@example.com' }])
  auth.setUser({ ...phoneUser, email: 'new@example.com', email_confirmed_at: '2026-01-01' })
  const user = await verifyEmail(auth, pending, '123456')
  assert.equal(user.email, 'new@example.com')
  assert.deepEqual(auth.calls[1], ['verify', { email: 'new@example.com', token: '123456', type: 'email_change' }])
  await assert.rejects(requestEmailVerification(auth, 'other@example.com', (_method, value) => value, 'original'), /already/)
  assert.equal(auth.calls.length, 2)
})

test('does not claim success when confirmation is incomplete or the account changes', async () => {
  const phoneUser = { id: 'original', phone: '+919876543210', phone_confirmed_at: '2026-01-01' }
  const auth = fakeAuth(phoneUser)
  const pending = await requestEmailVerification(auth, 'new@example.com', (_method, value) => value, 'original')
  await assert.rejects(verifyEmail(auth, pending, '123456'), /not verified yet/)
  auth.setUser({ ...phoneUser, id: 'different' })
  await assert.rejects(verifyEmail(auth, pending, '123456'), /account changed/)
  assert.equal(auth.calls.filter(([action]) => action === 'verify').length, 1)
})

test('uses email-change OTP and reports provider errors', async () => {
  const auth = fakeAuth({ id: 'original', phone: '+919876543210', phone_confirmed_at: '2026-01-01' })
  const pending = await requestEmailVerification(auth, 'new@example.com', (_method, value) => value, 'original')
  auth.verifyOtp = async (credentials) => {
    assert.equal(credentials.type, 'email_change')
    return { error: { message: 'invalid code' } }
  }
  await assert.rejects(verifyEmail(auth, pending, '123456'), /invalid code/)
})
