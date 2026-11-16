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
- `src/services/authService.js`: Supabase email/phone OTP, Google OAuth, and
  persisted auth sessions.
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
   email sign-in, configure the Supabase email templates to include both the
   one-time token and magic link as described below.
4. Follow the local development instructions below.

The sample pincode ranges are for development and must be replaced with
verified serviceability data before production use.

### Email sign-in template

In Supabase Authentication > Email Templates, include both placeholders in
the **Magic Link** template and the **Confirm signup** template (used for new
users), for example:

```html
<h2>Sign in to Pet Hut</h2>
<p><a href="{{ .ConfirmationURL }}">Continue to Pet Hut</a></p>
<p>Or enter this verification code: <strong>{{ .Token }}</strong></p>
<p>Use either the link or the code once. If you did not request this, ignore this email.</p>
```

The link and code are alternative ways to complete the same request; using
one consumes it. Hosted project templates are configured in the Supabase
Dashboard, not by the Vite app.

## Local development

Node.js and npm are installed on the current Windows machine through `fnm`.
If they are not available in a new PowerShell session, initialize `fnm` and
select its installed default:

```powershell
fnm env --shell powershell | Out-String | Invoke-Expression
fnm use default
node --version
npm --version
```

From the project directory, run `npm install` if dependencies are not already
installed, then start the app with `npm run dev`. Open the URL printed by
Vite, normally `http://localhost:5173`. If a development server is already
running, use its existing URL instead of starting another one. Run
`npm run build` to check the production build.

## Google sign-in setup

1. In Google Auth Platform, configure the consent screen, audience and test
   users as needed. Enable the `openid`, `email`, and `profile` scopes.
2. Create a **Web application** OAuth client. Add the app origin (for example
   `http://localhost:5173` for Vite, plus the production HTTPS origin) under
   authorized JavaScript origins. Under authorized redirect URIs, add the
   Supabase callback copied from the Google provider page, typically
   `https://<project-ref>.supabase.co/auth/v1/callback`. For a local Supabase
   stack, its callback is `http://127.0.0.1:54321/auth/v1/callback`.
3. In Supabase Authentication > Sign In / Providers > Google, enable Google
   and enter the Google client ID and client secret. Keep the secret only in
   Supabase's provider settings, never in Vite environment variables or Git.
4. In Supabase Authentication > URL Configuration, set the Site URL to the
   production app URL and allow the exact application callback URLs:
   `http://localhost:5173/auth/callback` for local Vite development and
   `https://<production-host>/auth/callback` for production. Add the matching
   URL for any other development host or port you use.
5. Configure the production host to serve the SPA entry point for
   `/auth/callback` and other application routes. The browser Supabase client
   restores the session on this callback; checkout intent is kept in
   sessionStorage while cart and pincode stay in localStorage. If checkout
   cannot be resumed after revalidation, the cart opens for correction.

The Google client ID and secret are configured outside this repository.
Email and phone OTP remain available. Automatic identity linking is handled
by Supabase for matching verified emails.

## Account linking and verified contacts

1. Enable **Manual Linking** in the Supabase project's Authentication
   provider configuration before using **Link Google**. The project owner
   reports that this is enabled. The user must already be signed in. If the
   Google identity belongs to another account, the operation fails; the
   application does not merge accounts.
2. Enable the email provider and configure the **Change Email Address** template to
   include `{{ .Token }}` so the email-change code can be entered in the app.
   Secure email change may require confirmation from both the old and new
   addresses when an existing email is being changed.
3. Account settings show Google identities, confirmed email, and any confirmed
   phone returned by Supabase Auth. Only a missing verified email can be added
   here; existing verified contacts are not replaced. Email is shown as verified
   only after Supabase confirms it. Cancelling dismisses the local form but
   does not revoke a code already sent by Supabase.

Hosted email-template configuration and end-to-end linking/email OTP
verification with user-controlled test accounts and codes are on hold in Phase
TBD. Adding phone sign-in methods is also on hold there; existing phone OTP
sign-in is unchanged. Separately created account conflicts and recovery are
deferred with Batch 6.3 to Phase TBD.

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
  name: string | null
  signedInAt: ISO-8601 datetime | null
  email: string | null // confirmed email
  phone: string | null // confirmed phone
  providers: string[]
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
