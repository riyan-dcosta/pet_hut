import { getCartSummary } from './cartService.js'
import { checkPincodeServiceability } from './pincodeService.js'

const ORDERS_STORAGE_KEY = 'pet-hut-orders'

function readOrders() {
  const savedOrders = window.localStorage.getItem(ORDERS_STORAGE_KEY)
  if (savedOrders === null) return []

  const orders = JSON.parse(savedOrders)
  if (!Array.isArray(orders)) {
    throw new Error('Saved order data is invalid. Please contact support before continuing.')
  }
  return orders
}

function validateAddress(address, pincodeResult) {
  const requiredFields = ['name', 'phone', 'street', 'city', 'district', 'pincode']
  for (const field of requiredFields) {
    if (typeof address[field] !== 'string' || !address[field].trim()) {
      throw new Error(`Please enter your ${field}.`)
    }
  }

  if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(address.phone.replace(/[()\s-]/g, ''))) {
    throw new Error('Enter a valid 10-digit Indian mobile number.')
  }

  const serviceability = checkPincodeServiceability(address.pincode)
  if (
    !serviceability.serviceable ||
    !pincodeResult?.serviceable ||
    pincodeResult.pincode !== address.pincode.trim()
  ) {
    throw new Error('Check a serviceable Karnataka pincode before placing your order.')
  }

  if (
    serviceability.city.toLowerCase() !== address.city.trim().toLowerCase() ||
    serviceability.district.toLowerCase() !== address.district.trim().toLowerCase()
  ) {
    throw new Error('The city and district must match the verified pincode.')
  }
}

export function placeOrder({ user, cartItems, address, pincodeResult }) {
  if (!user?.identifier) {
    throw new Error('Sign in before placing your order.')
  }
  if (cartItems.length === 0) {
    throw new Error('Your cart is empty.')
  }
  validateAddress(address, pincodeResult)

  const summary = getCartSummary(cartItems)
  const order = {
    id: window.crypto.randomUUID(),
    userId: user.identifier,
    status: 'placed',
    items: summary.items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      unitPriceRupees: item.unitPriceRupees,
      offerId: item.offer?.id ?? null,
    })),
    subtotalRupees: summary.subtotalRupees,
    discountRupees: summary.discountRupees,
    totalRupees: summary.totalRupees,
    address: {
      name: address.name.trim(),
      phone: address.phone.trim(),
      street: address.street.trim(),
      city: address.city.trim(),
      district: address.district.trim(),
      state: 'Karnataka',
      pincode: address.pincode.trim(),
    },
    createdAt: new Date().toISOString(),
    cancellationReason: null,
    returnReason: null,
  }

  const orders = readOrders()
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([...orders, order]))
  return order
}

export function getOrderById(orderId) {
  return readOrders().find((order) => order.id === orderId) ?? null
}
