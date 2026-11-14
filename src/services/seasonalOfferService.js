import { seasonalOffers, seasonalOffersEnabled } from '../config/seasonalOffers.js'

export function getActiveSeasonalOffers(now = new Date()) {
  if (!seasonalOffersEnabled) return []

  const timestamp = now.getTime()

  return seasonalOffers.filter((offer) => {
    const startsAt = offer.startsAt ? new Date(offer.startsAt).getTime() : -Infinity
    const endsAt = offer.endsAt ? new Date(offer.endsAt).getTime() : Infinity
    return timestamp >= startsAt && timestamp <= endsAt
  })
}

export function getSeasonalOfferForProduct(productId, now = new Date()) {
  return getActiveSeasonalOffers(now).find((offer) => offer.productIds.includes(productId)) ?? null
}

export function getSeasonalPrice(product, now = new Date()) {
  const offer = getSeasonalOfferForProduct(product.id, now)
  if (!offer) return { priceRupees: product.priceRupees, discountRupees: 0, offer: null }

  const discountRupees = Number(
    ((product.priceRupees * offer.discountPercent) / 100).toFixed(2),
  )

  return {
    priceRupees: Number((product.priceRupees - discountRupees).toFixed(2)),
    discountRupees,
    offer,
  }
}
