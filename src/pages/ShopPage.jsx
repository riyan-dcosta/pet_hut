import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/productService.js'
import {
  getActiveSeasonalOffers,
  getSeasonalPrice,
} from '../services/seasonalOfferService.js'
import PincodeChecker from '../components/PincodeChecker.jsx'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'dog_food', label: 'Dog Food' },
  { id: 'cat_food', label: 'Cat Food' },
  { id: 'treats', label: 'Treats' },
  { id: 'combos', label: 'Combos' },
]

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export default function ShopPage({
  onAddToCart,
  pincode,
  pincodeResult,
  onPincodeChange,
  onPincodeCheck,
  isPincodeChecking,
  pincodeError,
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCategory = searchParams.get('category')
  const category = categories.some((item) => item.id === requestedCategory)
    ? requestedCategory
    : 'all'
  const [products, setProducts] = useState([])
  const [offers, setOffers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError('')
    Promise.all([
      getProducts(category === 'all' ? {} : { category }),
      getActiveSeasonalOffers(),
    ])
      .then(([loadedProducts, activeOffers]) => {
        if (!active) return
        setProducts(loadedProducts)
        setOffers(activeOffers)
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
  }, [category])

  return (
    <div className="mx-auto max-w-7xl px-4 py-9 sm:px-8 sm:py-16">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
          The Pet Hut shop
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
          Good things for good pets.
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          Everyday favourites, treats, and little bundles for the pets you love.
        </p>
      </header>

      {offers.length > 0 && (
        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2" aria-label="Seasonal offers">
          {offers.map((offer) => (
            <p
              key={offer.id}
              className="rounded-xl bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900"
            >
              {offer.bannerText}
            </p>
          ))}
        </div>
      )}

      <div className="mt-5 max-w-xl sm:mt-6">
        <PincodeChecker
          id="shop-pincode"
          pincode={pincode}
          result={pincodeResult}
          onPincodeChange={onPincodeChange}
          onCheck={onPincodeCheck}
          isChecking={isPincodeChecking}
          error={pincodeError}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-2 pb-2 sm:mt-10" aria-label="Product categories">
        {categories.map((item) => {
          const selected = category === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                const nextParams = new URLSearchParams(searchParams)
                if (item.id === 'all') nextParams.delete('category')
                else nextParams.set('category', item.id)
                setSearchParams(nextParams)
              }}
              aria-pressed={selected}
              className={`min-h-11 shrink-0 rounded-full px-4 py-2.5 text-sm transition sm:px-5 ${
                selected
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-300 bg-white text-stone-700 hover:border-stone-500'
              }`}
            >
              {item.label}
            </button>
          )
        })}
      </div>

      {error ? (
        <p className="mt-10 rounded-xl border border-rose-200 bg-white p-8 text-center text-rose-700" role="alert">
          {error}
        </p>
      ) : isLoading ? (
        <p className="mt-10 rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600" role="status">
          Loading products…
        </p>
      ) : products.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const { priceRupees, offer } = getSeasonalPrice(product, new Date(), offers)
            return (
              <article
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white"
              >
                <div className="relative overflow-hidden bg-stone-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 480px) 50vw, 100vw"
                  />
                  {offer && (
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-800 px-3 py-1 text-xs font-medium text-white">
                      {offer.discountPercent}% off
                    </span>
                  )}
                  {product.weight && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1 text-xs text-stone-700">
                      {product.weight}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {product.brand}
                  </p>
                  <h2 className="mt-2 break-words text-base font-medium text-stone-900">{product.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-6 text-stone-600">
                    {product.description}
                  </p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-medium text-stone-900">
                      {currency.format(priceRupees)}
                    </span>
                    {(offer || product.mrpRupees > product.priceRupees) && (
                      <span className="text-sm text-stone-400 line-through">
                        {currency.format(offer ? product.priceRupees : product.mrpRupees)}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className="mt-4 min-h-11 w-full rounded-full bg-stone-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
                  >
                    Add to cart
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <p className="mt-10 rounded-xl border border-stone-200 bg-white p-8 text-center text-stone-600">
          No products are available in this category just yet.
        </p>
      )}
    </div>
  )
}
