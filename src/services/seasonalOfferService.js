import { getSupabaseClient } from './supabaseClient.js'

function mapOffer(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    discountPercent: Number(row.discount_percent),
    productIds: row.product_ids,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    bannerText: row.banner_text,
  }
}

export async function getActiveSeasonalOffers(now = new Date()) {
  const { data, error } = await getSupabaseClient()
    .from('seasonal_offers')
    .select(
      'id, name, description, discount_percent, product_ids, starts_at, ends_at, banner_text',
    )
    .eq('enabled', true)

  if (error) throw new Error(`Unable to load seasonal offers: ${error.message}`)
  const timestamp = now.getTime()

  return data
    .filter((offer) => {
      const startsAt = offer.starts_at ? new Date(offer.starts_at).getTime() : -Infinity
      const endsAt = offer.ends_at ? new Date(offer.ends_at).getTime() : Infinity
      return timestamp >= startsAt && timestamp <= endsAt
    })
    .map(mapOffer)
}

export function getSeasonalOfferForProduct(productId, now = new Date(), offers) {
  const findOffer = (activeOffers) =>
    activeOffers
      .filter((offer) => offer.productIds.includes(productId))
      .sort((left, right) => right.discountPercent - left.discountPercent)[0] ?? null
  return offers ? findOffer(offers) : getActiveSeasonalOffers(now).then(findOffer)
}

function priceForOffer(product, offer) {
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

export function getSeasonalPrice(product, now = new Date(), offers) {
  if (offers) {
    return priceForOffer(
      product,
      offers
        .filter((offer) => offer.productIds.includes(product.id))
        .sort((left, right) => right.discountPercent - left.discountPercent)[0] ?? null,
    )
  }

  return getSeasonalOfferForProduct(product.id, now).then((offer) =>
    priceForOffer(product, offer),
  )
}
