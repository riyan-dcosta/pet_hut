import { products } from '../data/products.js'

export function getProducts({ category } = {}) {
  return products.filter(
    (product) =>
      product.active && (category === undefined || product.category === category),
  )
}

export function getProductById(productId) {
  return products.find((product) => product.id === productId && product.active) ?? null
}
