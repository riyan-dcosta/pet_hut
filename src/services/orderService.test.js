import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { getOrdersByUser, placeOrder } from './orderService.js'
import { checkPincodeServiceability } from './pincodeService.js'

const storageKey = 'pet-hut-orders'

afterEach(() => {
  delete globalThis.window
})

test('ignores malformed orders without rewriting storage during reads', (t) => {
  const savedOrders = JSON.stringify([null])
  const storage = new Map([[storageKey, savedOrders]])
  globalThis.window = {
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  }
  t.mock.method(console, 'warn', () => {})

  assert.deepEqual(getOrdersByUser('user@example.com'), [])
  assert.equal(storage.get(storageKey), savedOrders)
})

test('rejects invalid cart quantities before creating an order', async () => {
  const invalidCarts = [
    null,
    {},
    [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: -2 }],
    [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: 1.5 }],
    [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: Number.MAX_SAFE_INTEGER + 1 }],
  ]

  for (const cartItems of invalidCarts) {
    await assert.rejects(
      placeOrder({ user: { identifier: 'user@example.com' }, cartItems }),
      /cart contains invalid items/,
    )
  }
})

test('serializes concurrent order writes across tabs', async () => {
  const storage = new Map()
  let lockQueue = Promise.resolve()
  let orderId = 0
  globalThis.window = {
    crypto: { randomUUID: () => `order-${++orderId}` },
    navigator: {
      locks: {
        request: async (name, operation) => {
          assert.equal(name, storageKey)
          const previous = lockQueue
          let release
          lockQueue = new Promise((resolve) => {
            release = resolve
          })
          await previous
          try {
            return await operation()
          } finally {
            release()
          }
        },
      },
    },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  }
  const request = {
    user: { identifier: 'user@example.com' },
    cartItems: [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: 1 }],
    address: {
      name: 'Pet Parent',
      phone: '9876543210',
      street: '1 Main Street',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      pincode: '560001',
    },
    pincodeResult: checkPincodeServiceability('560001'),
  }

  await Promise.all([placeOrder(request), placeOrder(request)])

  assert.equal(JSON.parse(storage.get(storageKey)).length, 2)
})
