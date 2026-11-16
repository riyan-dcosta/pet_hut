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
  isPincodeChecking = false,
  pincodeError = '',
  cartError = '',
  isCartLoading = false,
  cartCount = 0,
  onRetryCart,
  onClearCart,
  canCheckout = false,
  checkoutMessage = '',
  onCheckout,
  isAuthenticated = false,
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
  const checkoutHint =
    checkoutMessage ||
    (isCartLoading
      ? 'Updating your cart before checkout.'
      : items.some((item) => item.unavailable)
        ? 'Remove unavailable products before checkout.'
        : canCheckout
          ? 'Delivery is available for your checked pincode.'
          : 'Check a serviceable Karnataka pincode to continue.')

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 h-full w-full cursor-default bg-stone-950/30"
        onClick={onClose}
        aria-label="Close cart"
      />
      <aside
        className="absolute right-0 top-0 flex h-[100dvh] w-full max-w-md flex-col overscroll-contain bg-white pb-[env(safe-area-inset-bottom)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex min-h-16 shrink-0 items-center justify-between border-b border-stone-200 px-4 py-3 sm:px-6 sm:py-5">
          <h2 id="cart-title" className="text-lg font-medium text-stone-900">
            Your cart
            {cartCount > 0 && ` (${cartCount})`}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close cart" className="inline-flex h-11 w-11 items-center justify-center text-stone-500 hover:text-stone-900">
            <X size={21} />
          </button>
        </div>
        <div className="shrink-0 border-b border-stone-200 px-3 py-3 sm:px-5 sm:py-4">
          <PincodeChecker
            id="cart-pincode"
            pincode={pincode}
            result={pincodeResult}
            onPincodeChange={onPincodeChange}
            onCheck={onPincodeCheck}
            isChecking={isPincodeChecking}
            error={pincodeError}
          />
        </div>
        {isCartLoading ? (
          <p className="px-6 py-8 text-center text-sm text-stone-500" role="status">
            Updating cart prices…
          </p>
        ) : cartError ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-rose-700" role="alert">{cartError}</p>
            <button
              type="button"
              onClick={onRetryCart}
              className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 text-sm text-white hover:bg-stone-700"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={onClearCart}
              className="ml-3 mt-4 text-sm text-stone-600 underline underline-offset-4"
            >
              Clear saved cart
            </button>
          </div>
        ) : items.length > 0 ? (
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <ul className="divide-y divide-stone-100">
              {items.map(({ product, quantity, unitPriceRupees, lineTotalRupees, offer, unavailable }) => (
                <li key={product.id} className="flex min-w-0 gap-3 py-4 sm:gap-4">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 shrink-0 rounded-lg bg-stone-100" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-stone-900">{product.name}</p>
                    <p className={`mt-1 text-sm ${unavailable ? 'text-rose-700' : 'text-stone-500'}`}>
                      {unavailable ? 'No longer available. Remove this item to continue.' : `${currency.format(unitPriceRupees)} each`}
                    </p>
                    {offer && (
                      <p className="mt-1 text-xs font-medium text-emerald-800">
                        {offer.discountPercent}% seasonal offer
                      </p>
                    )}
                    <div className="mt-3 inline-flex items-center gap-3 rounded-full border border-stone-200 px-2 py-1">
                      <button
                        type="button"
                        onClick={() => onQuantityChange(product.id, unavailable ? -quantity : -1)}
                        aria-label={unavailable ? `Remove ${product.name}` : `Decrease ${product.name} quantity`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-4 text-center text-sm tabular-nums">{quantity}</span>
                      {!unavailable && (
                        <button
                          type="button"
                          onClick={() => onQuantityChange(product.id, 1)}
                          aria-label={`Increase ${product.name} quantity`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="max-w-[5rem] shrink-0 break-words text-right text-sm font-medium text-stone-900">
                    {currency.format(lineTotalRupees)}
                  </p>
                </li>
              ))}
            </ul>
            <div className="sticky bottom-0 z-10 -mx-4 mt-5 border-t border-stone-200 bg-white/95 px-4 pb-2 pt-4 backdrop-blur sm:-mx-6 sm:px-6">
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
              <p className="mt-3 text-xs leading-5 text-stone-500">
                {checkoutHint}
              </p>
              <button
                type="button"
                onClick={onCheckout}
                disabled={!canCheckout}
                className="mt-4 w-full rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                {isAuthenticated ? 'Continue to checkout' : 'Proceed to checkout'}
              </button>
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
