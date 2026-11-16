import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getOrderById } from '../services/orderService.js'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export default function OrderConfirmationPage({ user }) {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')
    getOrderById(orderId, user.id)
      .then((loadedOrder) => {
        if (active) setOrder(loadedOrder)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [orderId, reloadCount, user.id])

  if (isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-5 sm:py-20" role="status">
        <p className="text-stone-600">Loading your order…</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-5 sm:py-20">
        <p className="text-rose-700" role="alert">{error}</p>
        <div className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            className="inline-flex min-h-11 items-center rounded-full bg-stone-900 px-5 text-sm text-white hover:bg-stone-700"
          >
            Try again
          </button>
          <Link to="/shop" className="inline-flex min-h-11 items-center text-sm underline underline-offset-4">
            Return to shop
          </Link>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-5 sm:py-20">
        <h1 className="text-3xl font-medium text-stone-900">Order not found</h1>
        <p className="mt-3 text-stone-600">This order is not available for your account.</p>
        <Link to="/shop" className="mt-5 inline-flex min-h-11 items-center text-sm underline underline-offset-4">
          Return to shop
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-5 sm:py-20">
      <div className="rounded-2xl border border-emerald-200 bg-white p-5 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
          Order confirmed
        </p>
        <h1 className="mt-4 break-words text-2xl font-medium tracking-tight text-stone-900 sm:text-3xl">
          Thank you, {order.address.name}.
        </h1>
        <p className="mt-3 text-stone-600">
          Order <span className="break-all font-medium text-stone-900">{order.id}</span> is placed.
        </p>
        <p className="mt-2 text-sm text-stone-500">
          Delivering to {order.address.city}, Karnataka · {order.address.pincode}
        </p>
        <p className="mt-6 text-lg font-medium text-stone-900">
          {currency.format(order.totalRupees)}
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700 sm:w-auto"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  )
}
