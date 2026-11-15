import { serviceablePincodeRanges } from '../data/serviceablePincodes.js'

export function checkPincodeServiceability(pincode) {
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
  const range = serviceablePincodeRanges.find(
    ({ startPincode, endPincode }) =>
      numericPincode >= startPincode && numericPincode <= endPincode,
  )

  if (!range) {
    return {
      pincode: normalizedPincode,
      valid: true,
      serviceable: false,
      message: `Sorry, delivery is not available for ${normalizedPincode} yet.`,
    }
  }

  return {
    pincode: normalizedPincode,
    valid: true,
    serviceable: true,
    state: range.state,
    city: range.city,
    district: range.district,
    estimatedDeliveryDays: range.deliveryDays,
    message: `Delivery available in ${range.city} in ${range.deliveryDays.min}–${range.deliveryDays.max} days.`,
  }
}
