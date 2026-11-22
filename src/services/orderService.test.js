import assert from 'node:assert/strict'
import { test } from 'node:test'
import { placeOrder } from './orderService.js'
import { MAX_CART_QUANTITY } from './cartService.js'

test('rejects invalid cart quantities before creating an order', async () => {
  const invalidCarts = [
    null,
    {},
    [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: 0 }],
    [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: -2 }],
    [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: 1.5 }],
    [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: Number.MAX_SAFE_INTEGER + 1 }],
    [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: MAX_CART_QUANTITY + 1 }],
  ]

  for (const cartItems of invalidCarts) {
    await assert.rejects(
      placeOrder({ user: { id: 'user-123' }, cartItems }),
      /cart contains invalid items/,
    )
  }
})

test('revalidates pincode and sends a normalized address to the order RPC', async () => {
  let rpcRequest
  const supabase = {
    rpc: async (name, parameters) => {
      assert.equal(name, 'place_pet_hut_order')
      rpcRequest = parameters
      return {
        data: {
          id: 'order-123',
          user_id: 'user-123',
          status: 'placed',
          items: [{
            productId: 'pedigree-adult-chicken-1-2kg',
            name: 'Pedigree',
            quantity: 1,
            unitPriceRupees: '100',
            offerId: null,
          }],
          subtotal_rupees: '100',
          discount_rupees: '0',
          total_rupees: '100',
          address: parameters.p_address,
          created_at: '2026-11-16T00:00:00.000Z',
        },
        error: null,
      }
    },
  }
  const request = {
    user: { id: 'user-123' },
    cartItems: [{ productId: 'pedigree-adult-chicken-1-2kg', quantity: 1 }],
    address: {
      name: ' Pet Parent ',
      phone: ' 987 654 3210 ',
      street: ' 1 Main Street ',
      city: ' Bengaluru ',
      district: ' Bengaluru Urban ',
      pincode: ' 560001 ',
    },
    pincodeResult: { serviceable: true, pincode: '560001' },
  }

  const order = await placeOrder(request, {
    supabase,
    checkPincode: async (pincode) => {
      assert.equal(pincode, '560001')
      return {
        serviceable: true,
        state: 'Karnataka',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
      }
    },
  })

  assert.deepEqual(rpcRequest.p_address, {
    name: 'Pet Parent',
    phone: '+919876543210',
    street: '1 Main Street',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    pincode: '560001',
    state: 'Karnataka',
  })
  assert.equal(order.id, 'order-123')
})
