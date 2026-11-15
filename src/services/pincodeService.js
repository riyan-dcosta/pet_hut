import { getSupabaseClient } from './supabaseClient.js'

export async function checkPincodeServiceability(pincode) {
  const normalizedPincode = typeof pincode === 'string' ? pincode.trim() : ''
  if (!/^\d{6}$/.test(normalizedPincode)) {
    return {
      pincode: normalizedPincode,
      valid: false,
      serviceable: false,
      message: 'Enter a valid 6-digit pincode.',
    }
  }

  const numericPincode = Number(normalizedPincode)
  const { data: range, error } = await getSupabaseClient()
    .from('serviceable_pincodes')
    .select('*')
    .eq('serviceable', true)
    .lte('start_pincode', numericPincode)
    .gte('end_pincode', numericPincode)
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Unable to check delivery availability: ${error.message}`)

  if (!range) {
    return {
      pincode: normalizedPincode,
      valid: true,
      serviceable: false,
      message: `Sorry, delivery is not available for ${normalizedPincode} yet.`,
    }
  }

  const deliveryDays = {
    min: range.delivery_days_min,
    max: range.delivery_days_max,
  }

  return {
    pincode: normalizedPincode,
    valid: true,
    serviceable: true,
    state: range.state,
    city: range.city,
    district: range.district,
    estimatedDeliveryDays: deliveryDays,
    message: `Delivery available in ${range.city} in ${deliveryDays.min}–${deliveryDays.max} days.`,
  }
}
