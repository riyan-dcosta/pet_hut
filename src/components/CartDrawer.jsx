import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Minus, Plus, X } from 'lucide-react'
import PincodeChecker from './PincodeChecker.jsx'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export default function CartDrawer({
  isOpen,
  onClose,
  onQuantityChange,
  items = [],
  subtotalRupees = 0,
  discountRupees = 0,
  totalRupees = 0,
  pincode,
  pincodeResult,
  onPincodeChange,
  onPincodeCheck,
}) {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-stone-950/30"
        onClick={onClose}
        aria-label="Close cart"
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <h2 id="cart-title" className="text-lg font-medium text-stone-900">
            Your cart
            {items.length > 0 &&
              ` (${items.reduce((count, item) => count + item.quantity, 0)})`}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close cart" className="text-stone-500 hover:text-stone-900">
            <X size={21} />
          </button>
        </div>
        <div className="border-b border-stone-200 px-5 py-4">
          <PincodeChecker
            id="cart-pincode"
            pincode={pincode}
            result={pincodeResult}
            onPincodeChange={onPincodeChange}
            onCheck={onPincodeCheck}
          />
        </div>
        {items.length > 0 ? (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <ul className="divide-y divide-stone-100">
              {items.map(({ product, quantity, unitPriceRupees, lineTotalRupees, offer }) => (
                <li key={product.id} className="flex gap-4 py-4">
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900">{product.name}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {currency.format(unitPriceRupees)} each
                    </p>
                    {offer && (
                      <p className="mt-1 text-xs font-medium text-emerald-800">
                        {offer.discountPercent}% seasonal offer
                      </p>
                    )}
                    <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-stone-200 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => onQuantityChange(product.id, -1)}
                        aria-label={`Decrease ${product.name} quantity`}
                        className="rounded-full p-1 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-4 text-center text-sm tabular-nums">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => onQuantityChange(product.id, 1)}
                        aria-label={`Increase ${product.name} quantity`}
                        className="rounded-full p-1 text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-stone-900">
                    {currency.format(lineTotalRupees)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-5 border-t border-stone-200 pt-5">
              <dl className="space-y-3 text-sm">
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
                <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold text-stone-900">
                  <dt>Total</dt>
                  <dd>{currency.format(totalRupees)}</dd>
                </div>
              </dl>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <p className="text-base font-medium text-stone-900">
              Your cart is waiting for a friend.
            </p>
            <p className="mt-2 text-sm text-stone-500">Find something lovely for your pet.</p>
            <Link
              to="/shop"
              onClick={onClose}
              className="mt-6 rounded-full bg-stone-900 px-5 py-3 text-sm text-white transition hover:bg-stone-700"
            >
              Explore the shop
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}
