import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getOrdersByUser,
  orderRequestReasons,
  updateOrderRequest,
} from '../services/orderService.js'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const statusStyles = {
  placed: 'bg-sky-50 text-sky-800',
  processing: 'bg-sky-50 text-sky-800',
  shipped: 'bg-indigo-50 text-indigo-800',
  delivered: 'bg-emerald-50 text-emerald-800',
  cancelled: 'bg-stone-100 text-stone-700',
  return_requested: 'bg-amber-50 text-amber-800',
}

export default function OrdersPage({ user }) {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setLoadError('')
    getOrdersByUser(user.id)
      .then((loadedOrders) => {
        if (active) setOrders(loadedOrders)
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.message)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadCount, user.id])

  const openAction = (orderId, type) => {
    setAction({ orderId, type })
    setReason('')
    setError('')
  }

  const submitAction = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      const updatedOrder = await updateOrderRequest({
        orderId: action.orderId,
        userId: user.id,
        action: action.type,
        reason,
      })
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
      )
      setAction(null)
      setReason('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-9 sm:px-8 sm:py-16">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
            Your account
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">
            Your orders
          </h1>
        </div>
        <Link to="/shop" className="inline-flex min-h-11 items-center text-sm text-stone-600 underline underline-offset-4">
          Continue shopping
        </Link>
      </header>

      {loadError ? (
        <section className="rounded-xl border border-rose-200 bg-white p-5 sm:p-6">
          <p className="text-rose-700" role="alert">{loadError}</p>
          <button
            type="button"
            onClick={() => setReloadCount((count) => count + 1)}
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-stone-900 px-5 text-sm text-white hover:bg-stone-700"
          >
            Try again
          </button>
        </section>
      ) : isLoading ? (
        <p className="rounded-xl border border-stone-200 bg-white p-5 text-stone-600 sm:p-6" role="status">
          Loading your orders…
        </p>
      ) : orders.length === 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white px-5 py-12 text-center sm:px-6 sm:py-14">
          <h2 className="text-lg font-medium text-stone-900">No orders just yet</h2>
          <p className="mt-2 text-sm text-stone-600">Your orders will show up here.</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex min-h-11 items-center rounded-full bg-stone-900 px-5 py-3 text-sm text-white hover:bg-stone-700"
          >
            Explore the shop
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const actionType = action?.orderId === order.id ? action.type : null
            const reasons = orderRequestReasons[actionType]

            return (
              <article
                key={order.id}
                className="min-w-0 rounded-2xl border border-stone-200 bg-white p-4 sm:p-7"
              >
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5">
                  <div>
                    <p className="break-all text-xs text-stone-500">Order #{order.id}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyles[order.status] ?? 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </header>

                <ul className="divide-y divide-stone-100">
                  {order.items.map((item) => (
                    <li
                      key={item.productId}
                      className="flex min-w-0 justify-between gap-3 py-3 text-sm sm:gap-4"
                    >
                      <span className="min-w-0 break-words text-stone-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="shrink-0 text-stone-900">
                        {currency.format(item.unitPriceRupees * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
                  <div className="min-w-0 break-words text-sm text-stone-600">
                    <p>
                      Delivering to {order.address.name}, {order.address.city},{' '}
                      {order.address.pincode}
                    </p>
                    {order.cancellationReason && (
                      <p className="mt-1 text-stone-500">
                        Cancellation reason: {order.cancellationReason}
                      </p>
                    )}
                    {order.returnReason && (
                      <p className="mt-1 text-stone-500">
                        Return reason: {order.returnReason}
                      </p>
                    )}
                  </div>
                  <p className="text-base font-semibold text-stone-900 sm:text-right">
                    Total {currency.format(order.totalRupees)}
                  </p>
                </div>

                {order.status === 'cancelled' && (
                  <p className="mt-3 text-sm text-stone-500">This order has been cancelled.</p>
                )}
                {order.status === 'return_requested' && (
                  <p className="mt-3 text-sm text-amber-800">Return request submitted.</p>
                )}

                {(order.status === 'placed' ||
                  order.status === 'processing' ||
                  order.status === 'shipped' ||
                  order.status === 'delivered') && (
                  <div className="mt-5 border-t border-stone-100 pt-4">
                    {!actionType && order.status !== 'delivered' && (
                      <button
                        type="button"
                        onClick={() => openAction(order.id, 'cancel')}
                        className="inline-flex min-h-11 items-center text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-rose-700"
                      >
                        Cancel order
                      </button>
                    )}
                    {!actionType && order.status === 'delivered' && (
                      <button
                        type="button"
                        onClick={() => openAction(order.id, 'return')}
                        className="inline-flex min-h-11 items-center text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-emerald-800"
                      >
                        Request return
                      </button>
                    )}
                    {actionType && (
                      <form onSubmit={submitAction} className="max-w-md">
                        <label
                          htmlFor={`reason-${order.id}`}
                          className="block text-sm font-medium text-stone-800"
                        >
                          {actionType === 'cancel'
                            ? 'Why are you cancelling?'
                            : 'Why are you requesting a return?'}
                        </label>
                        <select
                          id={`reason-${order.id}`}
                          required
                          disabled={isSubmitting}
                          value={reason}
                          onChange={(event) => setReason(event.target.value)}
                          className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800"
                        >
                          <option value="" disabled>
                            Select a reason
                          </option>
                          {reasons.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        {error && (
                          <p className="mt-2 text-sm text-rose-700" role="alert">
                            {error}
                          </p>
                        )}
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-h-11 rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white hover:bg-stone-700"
                          >
                            {isSubmitting
                              ? 'Submitting…'
                              : `Submit ${actionType === 'cancel' ? 'cancellation' : 'return request'}`}
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => {
                              setAction(null)
                              setError('')
                            }}
                            className="min-h-11 rounded-full px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-100"
                          >
                            Keep order
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </main>
  )
}
