import { getSupabaseClient } from './supabaseClient.js'
import { checkPincodeServiceability } from './pincodeService.js'
import { MAX_CART_QUANTITY } from './cartService.js'

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

function mapOrder(row) {
  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
    items: row.items.map((item) => ({
      ...item,
      unitPriceRupees: Number(item.unitPriceRupees),
    })),
    subtotalRupees: Number(row.subtotal_rupees),
    discountRupees: Number(row.discount_rupees),
    totalRupees: Number(row.total_rupees),
    address: row.address,
    createdAt: row.created_at,
    cancellationReason: row.cancellation_reason,
    returnReason: row.return_reason,
  }
}

function normalizeIndianPhone(phone) {
  const normalizedPhone = phone.replace(/[()\s-]/g, '')
  if (!/^(?:\+91)?[6-9]\d{9}$/.test(normalizedPhone)) {
    throw new Error('Enter a valid 10-digit Indian mobile number.')
  }
  return normalizedPhone.startsWith('+91') ? normalizedPhone : `+91${normalizedPhone}`
}

async function validateAddress(address, pincodeResult, checkPincode) {
  const requiredFields = ['name', 'phone', 'street', 'city', 'district', 'pincode']
  for (const field of requiredFields) {
    if (typeof address?.[field] !== 'string' || !address[field].trim()) {
      throw new Error(`Please enter your ${field}.`)
    }
  }

  const normalizedAddress = Object.fromEntries(
    requiredFields.map((field) => [field, address[field].trim()]),
  )
  const serviceability = await checkPincode(normalizedAddress.pincode)
  if (
    !serviceability.serviceable ||
    !pincodeResult?.serviceable ||
    pincodeResult.pincode !== normalizedAddress.pincode
  ) {
    throw new Error('Check a serviceable Karnataka pincode before placing your order.')
  }

  if (
    serviceability.city.toLowerCase() !== normalizedAddress.city.toLowerCase() ||
    serviceability.district.toLowerCase() !== normalizedAddress.district.toLowerCase()
  ) {
    throw new Error('The city and district must match the verified pincode.')
  }

  return {
    ...normalizedAddress,
    phone: normalizeIndianPhone(normalizedAddress.phone),
    state: serviceability.state,
  }
}

export async function placeOrder(
  { user, cartItems, address, pincodeResult },
  dependencies = {},
) {
  if (!user?.id) throw new Error('Sign in before placing your order.')
  if (
    !Array.isArray(cartItems) ||
    !cartItems.every(
      (item) =>
        item &&
        typeof item.productId === 'string' &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= MAX_CART_QUANTITY,
    )
  ) {
    throw new Error('Your cart contains invalid items.')
  }
  if (cartItems.length === 0) throw new Error('Your cart is empty.')

  const checkPincode = dependencies.checkPincode ?? checkPincodeServiceability
  const normalizedAddress = await validateAddress(address, pincodeResult, checkPincode)
  const supabase = dependencies.supabase ?? getSupabaseClient()
  const { data, error } = await supabase.rpc('place_pet_hut_order', {
    p_address: normalizedAddress,
    p_items: cartItems.map(({ productId, quantity }) => ({ productId, quantity })),
  })

  if (error) throw new Error(`Unable to place order: ${error.message}`)
  const order = Array.isArray(data) ? data[0] : data
  if (!order) throw new Error('Order placement returned no order.')
  return mapOrder(order)
}

export async function getOrderById(orderId, userId) {
  if (!userId) throw new Error('Sign in to view this order.')

  const { data, error } = await getSupabaseClient()
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Unable to load order: ${error.message}`)
  return data ? mapOrder(data) : null
}

export async function getOrdersByUser(userId) {
  if (!userId) throw new Error('Sign in to view your orders.')

  const { data, error } = await getSupabaseClient()
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Unable to load orders: ${error.message}`)
  return data.map(mapOrder)
}

export async function updateOrderRequest({ orderId, userId, action, reason }) {
  const selectedReason = typeof reason === 'string' ? reason.trim() : ''
  if (!selectedReason) throw new Error('Select a reason before submitting your request.')
  if (action !== 'cancel' && action !== 'return') {
    throw new Error('Choose a valid order action.')
  }
  if (!orderRequestReasons[action].includes(selectedReason)) {
    throw new Error('Select one of the listed reasons.')
  }
  if (!userId) throw new Error('Sign in to update this order.')

  const updates =
    action === 'cancel'
      ? { status: 'cancelled', cancellation_reason: selectedReason }
      : { status: 'return_requested', return_reason: selectedReason }
  let query = getSupabaseClient()
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .eq('user_id', userId)

  query =
    action === 'cancel'
      ? query.in('status', ['placed', 'processing', 'shipped'])
      : query.eq('status', 'delivered')

  const { data, error } = await query.select('*').maybeSingle()
  if (error) throw new Error(`Unable to update order: ${error.message}`)
  if (!data) {
    throw new Error(
      action === 'cancel'
        ? 'Only active orders can be cancelled.'
        : 'Only delivered orders can be returned.',
    )
  }

  return mapOrder(data)
}
