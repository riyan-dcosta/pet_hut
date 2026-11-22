import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getAccountLabel, mapUser } from './authUser.js'

test('maps Google profile names for the signed-in greeting', () => {
  const user = mapUser({
    id: 'user-id',
    email: 'user@example.com',
    user_metadata: { full_name: '  Pet Parent  ', name: 'Other Name' },
  })

  assert.equal(user.name, 'Pet Parent')
  assert.equal(getAccountLabel(user), 'Hello, Pet Parent')
})

test('uses another available name when the preferred name is blank', () => {
  const user = mapUser({
    id: 'user-id',
    phone: '+919876543210',
    user_metadata: { full_name: '  ', name: 'Pet Parent' },
  })

  assert.equal(user.method, 'phone')
  assert.equal(getAccountLabel(user), 'Hello, Pet Parent')
})

test('distinguishes unnamed signed-in users from guests', () => {
  const user = mapUser({ id: 'user-id', email: 'user@example.com', user_metadata: { name: 123 } })

  assert.equal(getAccountLabel(user), 'Signed In')
  assert.equal(getAccountLabel(null), 'Sign in')
  assert.equal(mapUser(null), null)
})
