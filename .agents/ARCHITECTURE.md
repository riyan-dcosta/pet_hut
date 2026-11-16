# Application Architecture

## Application and data layers

- `src/`: React UI and browser entry point.
- `src/services/`: Async Supabase data/auth access. Database credentials are
  limited to the public anon/publishable key; no service-role key belongs in
  browser code.
- `src/services/supabaseClient.js`: Lazily creates the browser client from
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; missing configuration is
  reported rather than silently replaced with mock data.
- `supabase/migrations/`: Database schema, sample catalog/offer/pincode rows,
  row-level security, and database-enforced order operations.
- `src/services/cartService.js`: Keeps only product IDs and quantities in
  `localStorage`; prices and offers are resolved from Supabase.
- `src/services/authService.js`: Supabase email/phone OTP and persisted auth
  sessions.
- `src/services/orderService.js`: Uses the authenticated user ID for all order
  reads and requests. Order placement uses a database RPC to revalidate stock
  availability, pincode, and current prices/discounts; database policies only
  expose a user's own orders.

## Supabase setup

1. Copy `.env.example` to `.env` and set the Supabase project URL and public
   anon/publishable key. Never use a service-role key in the Vite app.
2. Apply `supabase/migrations/20261115000000_initial_schema.sql` to the project.
   The migration seeds the current sample products, offers, and Karnataka
   serviceability ranges.
3. Enable Phone authentication and configure an SMS provider in Supabase for
   phone OTP. Order phone numbers are normalized to India E.164 format. For
   email OTP, configure the Supabase email template to send the one-time token
   (rather than only a magic link).
4. Run `npm install` and `npm run dev`.

The sample pincode ranges are for development and must be replaced with
verified serviceability data before production use.

## Managing offers and delivery areas

Offers and delivery areas are managed in Supabase, not in the browser app.
Use the Supabase Dashboard's Table Editor with an appropriately privileged
account to edit `seasonal_offers` and `serviceable_pincodes`; the public app
has read-only access and does not include an admin interface.

- For `seasonal_offers`, set `enabled`, optional `starts_at`/`ends_at`, and
  `product_ids` to control which discounts are shown and applied. Product IDs
  must exist in `products`; the offer must be enabled and within its date
  window. The order RPC rechecks the current offer before placing an order.
- For `serviceable_pincodes`, maintain inclusive `start_pincode` and
  `end_pincode` ranges, `city`, `district`, and delivery-day bounds. Keep
  ranges non-overlapping, and set `serviceable` to false to stop accepting
  new deliveries in a range. Checkout revalidates serviceability in the
  database.

Changes are picked up by subsequent catalog, cart, and pincode reads; reload
the shop page to refresh offers already displayed there. The migration seeds
development rows with `ON CONFLICT DO NOTHING`, so reapplying it does not
overwrite dashboard-managed values. Never put a Supabase `service_role` or
secret key in the browser app.

## Data schemas

All monetary amounts are stored as rupees with two decimal places. Product
prices are served from `public.products`; seasonal discounts are read from
enabled, date-valid `public.seasonal_offers` rows. The
`seasonal_offers.product_ids` field controls offer application; delivery
availability is resolved from serviceable rows in `public.serviceable_pincodes`.

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
  bundleProductIds: string[]
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
  productIds: string[]
  startsAt: ISO-8601 datetime | null
  endsAt: ISO-8601 datetime | null
  enabled: boolean
  bannerText: string
}
```

### CartItem

```text
CartItem {
  productId: string
  quantity: positive integer
}
```

The cart remains in browser `localStorage` across navigation and authentication;
current product details, offer prices, and totals are fetched from the backend.

### AuthUser

```text
AuthUser {
  id: UUID
  method: "phone" | "email"
  identifier: string
  signedInAt: ISO-8601 datetime | null
}
```

### ServiceablePincode

```text
ServiceablePincode {
  startPincode: integer
  endPincode: integer
  state: "Karnataka"
  city: string
  district: string
  serviceable: boolean
  deliveryDaysMin: integer
  deliveryDaysMax: integer
}
```

### Order

```text
Order {
  id: UUID
  userId: UUID
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

Order rows are protected by row-level security and scoped to `auth.uid()`.
Database logic calculates order totals from current catalog and enabled offers;
customer order updates are restricted to valid cancellation and return
requests with a selected reason.
