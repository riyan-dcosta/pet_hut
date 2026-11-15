# Application Architecture

## Planned layers

- `src/`: React UI and browser entry point.
- `src/services/`: Data access functions. During Phases 1–3 these use local,
  structured mock data; Phase 4 replaces their internals with Supabase or
  Firebase calls without changing UI consumers.
- `src/config/`: Frontend configuration, including seasonal offer settings.
- React Context and `localStorage`: Shared cart state and persistence across
  navigation and authentication redirects.
- `src/services/cartService.js`: Validates persisted cart entries, derives
  current product and seasonal prices, and calculates rupee subtotals.
- `src/services/pincodeService.js`: Checks six-digit pincodes against the
  local Karnataka serviceability sample; Batch 4.1 replaces this lookup with
  backend data.

## Data schemas

These are the initial logical shapes. IDs should be stable strings (UUIDs are
appropriate for backend records). Store monetary amounts in rupees as decimal
numbers, for example `10.50` represents ₹10.50.

### Product

```text
Product {
  id: string
  name: string
  brand: string
  category: "dog_food" | "cat_food" | "treats" | "combos"
  description: string
  priceRupees: number
  mrpRupees: number
  weight: string | null
  bundleProductIds?: string[]
  imageUrl: string
  active: boolean
  offerIds: string[]
}
```

### SeasonalOffer

```text
SeasonalOffer {
  id: string
  name: string
  description: string
  discountPercent: number
  productIds: string[] // Products or bundles eligible for this offer
  startsAt: ISO-8601 datetime | null
  endsAt: ISO-8601 datetime | null
  bannerText: string
}
```

Seasonal offer availability is controlled by one global
`seasonalOffersEnabled` flag in `src/config/seasonalOffers.js`. Individual
offers define their eligible product IDs, discount, optional validity dates,
and promotional banner text. The offer service applies discounts to eligible
bundle products and exposes active offers for promotional banners.

### CartItem

```text
CartItem {
  productId: string
  quantity: positive integer
}
```

Cart entries store only product IDs and quantities in `localStorage`; product
details and active seasonal discounts are resolved from the services whenever
the cart is displayed.

### ServiceablePincode

```text
ServiceablePincode {
  startPincode: integer
  endPincode: integer
  state: "Karnataka"
  city: string
  district: string
  estimatedDeliveryDays: { min: integer, max: integer }
}
```

`src/data/serviceablePincodes.js` currently contains bounded sample ranges for
Bengaluru, Mysuru, Mangaluru, and Hubballi; these are mock records and must be
replaced with verified serviceability data before production use.

### Order

```text
Order {
  id: string
  userId: string
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled" | "return_requested"
  items: Array<{
    productId: string
    name: string
    quantity: integer
    unitPriceRupees: number
    offerId: string | null
  }>
  subtotalRupees: number
  discountRupees: number
  totalRupees: number
  address: {
    name: string
    phone: string
    street: string
    city: string
    district: string
    state: "Karnataka"
    pincode: string
  }
  createdAt: ISO-8601 datetime
  cancellationReason: string | null
  returnReason: string | null
}
```
