import { getProductById } from './productService.js'
import { getSeasonalPrice } from './seasonalOfferService.js'

const CART_STORAGE_KEY = 'pet-hut-cart'

function roundRupees(amount) {
  return Number(amount.toFixed(2))
}

export function loadCart() {
  const savedCart = window.localStorage.getItem(CART_STORAGE_KEY)
  if (savedCart === null) return []

  let parsedCart
  try {
    parsedCart = JSON.parse(savedCart)
  } catch (error) {
    console.warn('Unable to load saved cart data; starting with an empty cart.', error)
    return []
  }

  if (!Array.isArray(parsedCart)) {
    console.warn('Saved cart data is invalid: expected a list of cart items.')
    return []
  }

  const cartItems = parsedCart.map((item, index) => {
    if (
      item === null ||
      typeof item !== 'object' ||
      typeof item.productId !== 'string' ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1
    ) {
      console.warn(`Saved cart item ${index + 1} is invalid and was removed.`)
      return null
    }

    if (!getProductById(item.productId)) {
      return null
    }

    return { productId: item.productId, quantity: item.quantity }
  }).filter(Boolean)

  if (cartItems.length !== parsedCart.length) saveCart(cartItems)

  return cartItems
}

export function saveCart(cartItems) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
}

export function getCartSummary(cartItems, now = new Date()) {
  const items = cartItems.map(({ productId, quantity }) => {
    const product = getProductById(productId)
    if (!product) {
      throw new Error(`Cart references unavailable product "${productId}".`)
    }

    const seasonalPrice = getSeasonalPrice(product, now)
    const unitDiscountRupees = seasonalPrice.discountRupees

    return {
      product,
      quantity,
      unitPriceRupees: seasonalPrice.priceRupees,
      lineTotalRupees: roundRupees(seasonalPrice.priceRupees * quantity),
      lineDiscountRupees: roundRupees(unitDiscountRupees * quantity),
      offer: seasonalPrice.offer,
    }
  })

  const subtotalRupees = roundRupees(
    items.reduce((total, item) => total + item.product.priceRupees * item.quantity, 0),
  )
  const discountRupees = roundRupees(
    items.reduce((total, item) => total + item.lineDiscountRupees, 0),
  )

  return {
    items,
    subtotalRupees,
    discountRupees,
    totalRupees: roundRupees(subtotalRupees - discountRupees),
  }
}
