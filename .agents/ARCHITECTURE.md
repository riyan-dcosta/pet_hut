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
- `src/services/authService.js`: Provides a clearly labeled local demo OTP
  flow and persists the demo sign-in state; Batch 4.1 replaces it with real
  email/phone authentication.

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

### AuthUser

```text
AuthUser {
  method: "phone" | "email"
  identifier: string
  signedInAt: ISO-8601 datetime
}
```

Batch 3.2 uses a local demo code stored only in memory for five minutes and
displays the code in the UI; it does not send SMS or email and is not production
authentication. Cart state remains stored separately, so it survives sign-in.

### ServiceablePincode

```text
ServiceablePincode {
  startPincode: integer
  endPincode: integer
  state: "Karnataka"
  city: string
  district: string
  deliveryDays: { min: integer, max: integer }
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
