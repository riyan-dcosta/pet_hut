import { getSupabaseClient } from './supabaseClient.js'

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    description: row.description,
    priceRupees: Number(row.price_rupees),
    mrpRupees: Number(row.mrp_rupees),
    weight: row.weight,
    bundleProductIds: row.bundle_product_ids,
    imageUrl: row.image_url,
    active: row.active,
    offerIds: row.offer_ids,
  }
}

export async function getProducts({ category } = {}) {
  let query = getSupabaseClient()
    .from('products')
    .select('*')
    .eq('active', true)
    .order('brand')
    .order('name')

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) throw new Error(`Unable to load products: ${error.message}`)
  return data.map(mapProduct)
}

export async function getProductById(productId) {
  const { data, error } = await getSupabaseClient()
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('active', true)
    .maybeSingle()

  if (error) throw new Error(`Unable to load product: ${error.message}`)
  return data ? mapProduct(data) : null
}

export async function getProductsByIds(productIds) {
  if (productIds.length === 0) return []

  const { data, error } = await getSupabaseClient()
    .from('products')
    .select('*')
    .in('id', productIds)
    .eq('active', true)

  if (error) throw new Error(`Unable to load cart products: ${error.message}`)
  return data.map(mapProduct)
}
