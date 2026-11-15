import { getCartSummary } from './cartService.js'
import { checkPincodeServiceability } from './pincodeService.js'

const ORDERS_STORAGE_KEY = 'pet-hut-orders'

export const orderRequestReasons = {
  cancel: [
    'Ordered by mistake',
    'Delivery taking too long',
    'Found a better option',
    'Other',
  ],
  return: [
    'Item arrived damaged',
    'Wrong item received',
    'Pet did not accept the product',
    'Other',
  ],
}

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

export function getOrdersByUser(userId) {
  return readOrders()
    .filter((order) => order.userId === userId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

export function updateOrderRequest({ orderId, userId, action, reason }) {
  const selectedReason = typeof reason === 'string' ? reason.trim() : ''
  if (!selectedReason) {
    throw new Error('Select a reason before submitting your request.')
  }
  if (action !== 'cancel' && action !== 'return') {
    throw new Error('Choose a valid order action.')
  }
  if (!orderRequestReasons[action].includes(selectedReason)) {
    throw new Error('Select one of the listed reasons.')
  }

  const orders = readOrders()
  const orderIndex = orders.findIndex(
    (order) => order.id === orderId && order.userId === userId,
  )
  if (orderIndex === -1) {
    throw new Error('This order was not found for your account.')
  }

  const order = orders[orderIndex]
  if (action === 'cancel') {
    if (!['placed', 'processing', 'shipped'].includes(order.status)) {
      throw new Error('Only active orders can be cancelled.')
    }
    orders[orderIndex] = {
      ...order,
      status: 'cancelled',
      cancellationReason: selectedReason,
    }
  } else {
    if (order.status !== 'delivered') {
      throw new Error('Only delivered orders can be returned.')
    }
    orders[orderIndex] = {
      ...order,
      status: 'return_requested',
      returnReason: selectedReason,
    }
  }

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  return orders[orderIndex]
}
