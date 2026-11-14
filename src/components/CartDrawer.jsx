import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

export default function CartDrawer({ isOpen, onClose, items = [] }) {
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
          </h2>
          <button type="button" onClick={onClose} aria-label="Close cart" className="text-stone-500 hover:text-stone-900">
            <X size={21} />
          </button>
        </div>
        {items.length > 0 ? (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <ul className="divide-y divide-stone-100">
              {items.map(({ product, quantity, unitPriceRupees }) => (
                <li key={product.id} className="flex gap-4 py-4">
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-stone-900">{product.name}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      Qty {quantity} · ₹{unitPriceRupees.toFixed(2)} each
                    </p>
                  </div>
                </li>
              ))}
            </ul>
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
