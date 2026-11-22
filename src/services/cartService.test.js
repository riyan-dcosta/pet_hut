import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { loadCart, MAX_CART_QUANTITY } from './cartService.js'

const storageKey = 'pet-hut-cart'
const validItem = { productId: 'pedigree-adult-chicken-1-2kg', quantity: 2 }

afterEach(() => {
  delete globalThis.window
})

test('discards malformed saved items and persists the remaining cart', (t) => {
  const savedItems = [
    validItem,
    null,
    'invalid',
    { productId: 123, quantity: 1 },
    { productId: validItem.productId, quantity: 0 },
    { productId: validItem.productId, quantity: 1.5 },
    { productId: validItem.productId, quantity: Number.MAX_SAFE_INTEGER + 1 },
    { productId: 'unavailable-product', quantity: 1 },
    { productId: 'large-quantity-product', quantity: MAX_CART_QUANTITY + 1 },
  ]
  let stored = JSON.stringify(savedItems)
  globalThis.window = {
    localStorage: {
      getItem: (key) => key === storageKey ? stored : null,
      setItem: (key, value) => {
        assert.equal(key, storageKey)
        stored = value
      },
    },
  }
  const warning = t.mock.method(console, 'warn', () => {})

  const normalizedItems = [
    validItem,
    { productId: 'unavailable-product', quantity: 1 },
    { productId: 'large-quantity-product', quantity: MAX_CART_QUANTITY },
  ]
  assert.deepEqual(loadCart(), normalizedItems)
  assert.deepEqual(JSON.parse(stored), normalizedItems)
  assert.equal(warning.mock.callCount(), 6)
})

test('persists an empty cart when every saved item is malformed', (t) => {
  let stored = JSON.stringify([null])
  globalThis.window = {
    localStorage: {
      getItem: () => stored,
      setItem: (_key, value) => { stored = value },
    },
  }
  t.mock.method(console, 'warn', () => {})

  assert.deepEqual(loadCart(), [])
  assert.deepEqual(JSON.parse(stored), [])
})
