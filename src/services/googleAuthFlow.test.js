import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getGoogleCallbackError, saveGoogleAuthIntent, takeGoogleAuthIntent, saveGoogleLinkIntent, takeGoogleLinkIntent } from './googleAuthFlow.js'

function createStorage() {
  const data = new Map()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  }
}

test('checkout intent survives a redirect and is consumed once', () => {
  const storage = createStorage()
  saveGoogleAuthIntent(storage, true)
  assert.equal(takeGoogleAuthIntent(storage), 'checkout')
  assert.equal(takeGoogleAuthIntent(storage), 'shop')
})

test('callback errors are handled without displaying provider details', () => {
  assert.match(getGoogleCallbackError({ search: '', hash: '#error=access_denied&error_description=private' }), /cancelled or failed/)
  assert.match(getGoogleCallbackError({ search: '?error_code=403', hash: '' }), /cancelled or failed/)
  assert.equal(getGoogleCallbackError({ search: '', hash: '#access_token=example' }), '')
})

test('linking tracks the initiating account separately from checkout', () => {
  const storage = createStorage()
  saveGoogleAuthIntent(storage, true)
  saveGoogleLinkIntent(storage, 'account-id')
  assert.equal(takeGoogleLinkIntent(storage), 'account-id')
  assert.equal(takeGoogleLinkIntent(storage), null)
  assert.equal(takeGoogleAuthIntent(storage), 'checkout')
})
