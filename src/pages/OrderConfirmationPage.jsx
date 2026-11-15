import { Link, useParams } from 'react-router-dom'
import { getOrderById } from '../services/orderService.js'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const order = getOrderById(orderId)

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h1 className="text-3xl font-medium text-stone-900">Order not found</h1>
        <p className="mt-3 text-stone-600">This order is not available in this browser.</p>
        <Link to="/shop" className="mt-6 inline-block text-sm underline underline-offset-4">
          Return to shop
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-16 sm:py-24">
      <div className="rounded-2xl border border-emerald-200 bg-white p-6 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
          Order confirmed
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-stone-900">
          Thank you, {order.address.name}.
        </h1>
        <p className="mt-3 text-stone-600">
          Order <span className="font-medium text-stone-900">{order.id}</span> is placed.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Delivering to {order.address.city}, Karnataka · {order.address.pincode}
        </p>
        <p className="mt-6 text-lg font-medium text-stone-900">
          {currency.format(order.totalRupees)}
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  )
}
