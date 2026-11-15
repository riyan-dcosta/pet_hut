import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { getCurrentUser } from './authService.js'

const storageKey = 'pet-hut-auth-user'

afterEach(() => {
  delete globalThis.window
})

test('removes persisted users with invalid identifiers', () => {
  const removedKeys = []
  globalThis.window = {
    localStorage: {
      getItem: () =>
        JSON.stringify({ method: 'email', identifier: 'not-an-email' }),
      removeItem: (key) => removedKeys.push(key),
    },
  }

  assert.equal(getCurrentUser(), null)
  assert.deepEqual(removedKeys, [storageKey])
})

test('normalizes valid persisted user identifiers', () => {
  globalThis.window = {
    localStorage: {
      getItem: () =>
        JSON.stringify({ method: 'email', identifier: 'USER@example.com' }),
      removeItem: assert.fail,
    },
  }

  assert.deepEqual(getCurrentUser(), {
    method: 'email',
    identifier: 'user@example.com',
  })
})
