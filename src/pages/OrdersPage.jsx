import { useState } from 'react'
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
  const [orders, setOrders] = useState(() => getOrdersByUser(user.identifier))
  const [action, setAction] = useState(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const openAction = (orderId, type) => {
    setAction({ orderId, type })
    setReason('')
    setError('')
  }

  const submitAction = async (event) => {
    event.preventDefault()
    setError('')
    try {
      await updateOrderRequest({
        orderId: action.orderId,
        userId: user.identifier,
        action: action.type,
        reason,
      })
      setOrders(getOrdersByUser(user.identifier))
      setAction(null)
      setReason('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
            Your account
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl">
            Your orders
          </h1>
        </div>
        <Link to="/shop" className="text-sm text-stone-600 underline underline-offset-4">
          Continue shopping
        </Link>
      </header>

      {orders.length === 0 ? (
        <section className="rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-medium text-stone-900">No orders just yet</h2>
          <p className="mt-2 text-sm text-stone-600">Your orders will show up here.</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-3 text-sm text-white hover:bg-stone-700"
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
                className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7"
              >
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-5">
                  <div>
                    <p className="text-xs text-stone-500">Order #{order.id}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
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
                      className="flex justify-between gap-4 py-3 text-sm"
                    >
                      <span className="text-stone-700">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="shrink-0 text-stone-900">
                        {currency.format(item.unitPriceRupees * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap items-end justify-between gap-4 border-t border-stone-100 pt-4">
                  <div className="text-sm text-stone-600">
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
                  <p className="text-base font-semibold text-stone-900">
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
                        className="text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-rose-700"
                      >
                        Cancel order
                      </button>
                    )}
                    {!actionType && order.status === 'delivered' && (
                      <button
                        type="button"
                        onClick={() => openAction(order.id, 'return')}
                        className="text-sm font-medium text-stone-700 underline underline-offset-4 hover:text-emerald-800"
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
                        <div className="mt-4 flex gap-3">
                          <button
                            type="submit"
                            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white hover:bg-stone-700"
                          >
                            Submit {actionType === 'cancel' ? 'cancellation' : 'return request'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAction(null)
                              setError('')
                            }}
                            className="rounded-full px-4 py-2.5 text-sm text-stone-600 hover:bg-stone-100"
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
