import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export default function CheckoutPage({
  user,
  pincodeResult,
  cartItems,
  subtotalRupees,
  discountRupees,
  totalRupees,
  onPlaceOrder,
}) {
  const [address, setAddress] = useState(() => ({
    name: '',
    phone: user.method === 'phone' ? user.identifier : '',
    street: '',
    city: pincodeResult?.city ?? '',
    district: pincodeResult?.district ?? '',
    pincode: pincodeResult?.pincode ?? '',
  }))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!pincodeResult?.serviceable) return
    setAddress((current) => ({
      ...current,
      city: pincodeResult.city,
      district: pincodeResult.district,
      pincode: pincodeResult.pincode,
    }))
  }, [pincodeResult])

  const updateField = (event) => {
    const { name, value } = event.target
    setAddress((current) => ({ ...current, [name]: value }))
  }

  const submitOrder = (event) => {
    event.preventDefault()
    setError('')
    try {
      onPlaceOrder(address)
    } catch (orderError) {
      setError(orderError.message)
    }
  }

  const serviceable = Boolean(
    pincodeResult?.serviceable && pincodeResult.pincode === address.pincode,
  )

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
          Almost home
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">
          Delivery details
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <form
          onSubmit={submitOrder}
          className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-stone-800 sm:col-span-2">
              Full name
              <input
                name="name"
                autoComplete="name"
                required
                value={address.name}
                onChange={updateField}
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              />
            </label>
            <label className="text-sm font-medium text-stone-800 sm:col-span-2">
              Phone number
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                required
                value={address.phone}
                onChange={updateField}
                placeholder="98765 43210"
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              />
            </label>
            <label className="text-sm font-medium text-stone-800 sm:col-span-2">
              Street address
              <textarea
                name="street"
                autoComplete="street-address"
                required
                rows={3}
                value={address.street}
                onChange={updateField}
                className="mt-2 w-full resize-y rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              />
            </label>
            <label className="text-sm font-medium text-stone-800">
              City
              <input
                name="city"
                autoComplete="address-level2"
                required
                value={address.city}
                onChange={updateField}
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              />
            </label>
            <label className="text-sm font-medium text-stone-800">
              District
              <input
                name="district"
                autoComplete="address-level1"
                required
                value={address.district}
                onChange={updateField}
                className="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 font-normal outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
              />
            </label>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-stone-800" htmlFor="checkout-pincode">
                Karnataka pincode
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <input
                  id="checkout-pincode"
                  name="pincode"
                  readOnly
                  value={address.pincode}
                  required
                  className="w-full max-w-xs rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-700"
                />
                <span
                  className={`text-sm ${serviceable ? 'text-emerald-800' : 'text-rose-700'}`}
                  role="status"
                >
                  {serviceable
                    ? `Verified · ${pincodeResult.estimatedDeliveryDays.min}–${pincodeResult.estimatedDeliveryDays.max} days`
                    : 'A serviceable pincode is required'}
                </span>
                <Link to="/shop" className="text-sm text-stone-600 underline underline-offset-4">
                  Change pincode
                </Link>
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-5 text-sm text-rose-700" role="alert">
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/shop" className="text-center text-sm text-stone-600 hover:text-stone-900">
              Return to shop
            </Link>
            <button
              type="submit"
              disabled={!serviceable || cartItems.length === 0}
              className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              Place order
            </button>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-medium text-stone-900">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {cartItems.map((item) => (
              <li key={item.product.id} className="flex justify-between gap-3 text-sm">
                <span className="text-stone-600">
                  {item.product.name} × {item.quantity}
                </span>
                <span className="shrink-0 text-stone-900">
                  {currency.format(item.lineTotalRupees)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-3 border-t border-stone-200 pt-4 text-sm">
            <div className="flex justify-between text-stone-600">
              <dt>Subtotal</dt>
              <dd>{currency.format(subtotalRupees)}</dd>
            </div>
            {discountRupees > 0 && (
              <div className="flex justify-between text-emerald-800">
                <dt>Seasonal discount</dt>
                <dd>−{currency.format(discountRupees)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-stone-200 pt-3 font-semibold text-stone-900">
              <dt>Total</dt>
              <dd>{currency.format(totalRupees)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  )
}
