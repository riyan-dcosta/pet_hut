# Pet Hut Roadmap

## Project

A minimalistic, modern pet-store e-commerce application for Karnataka, India,
with local product brands, INR pricing, serviceability checks, and guest cart
browsing.

## Phase 1: Project Setup, Tracking, and Home Page

- [x] Batch 1.1: Initialize project structure and `.agents/` tracking.
- [x] Batch 1.2: Build responsive navigation and footer.
- [x] Batch 1.3: Build the editorial pet showcase on the home page.
- [x] Batch 1.4: Add customer testimonials.

**Status: CLOSED** — all Phase 1 batches are complete.

## Phase 2: Shop, Cart, and Seasonal Offers

**Status: CLOSED** — all Phase 2 batches are complete.

- [x] Batch 2.1: Add product catalog and configurable seasonal offers.
- [x] Batch 2.2: Build the shop page with category filtering and cart actions.
- [x] Batch 2.3: Add persistent slide-over cart and discount calculations.

## Phase 3: Serviceability, Checkout, and Orders

**Status: CLOSED** — all Phase 3 batches are complete.

- [x] Batch 3.1: Add Karnataka pincode serviceability checks.
- [x] Batch 3.2: Add checkout authentication gate.
- [x] Batch 3.3: Add address entry and order placement.
- [x] Batch 3.4: Add order history, cancellation, and return requests.

## Phase 4: Backend Integration

- [x] Batch 4.1: Connect services to Supabase for catalog, offers, pincodes,
  orders, and live Email/Phone OTP authentication.
- [x] Batch 4.2: Support backend-managed offers and pincodes and polish.

**Status: CLOSED** — all Phase 4 batches are complete.

## Phase 5: Mobile-First Responsive UI

**Status: CLOSED** — all Phase 5 batches are complete.

Make every route and shared application surface work as a dynamic, responsive
experience on mobile, tablet, and desktop. Preserve Supabase-backed content and
provide clear loading, empty, and error states instead of adding mock data.

- [x] Batch 5.1: Audit responsive foundations and update the shared shell:
  navigation, footer, authentication dialog, cart drawer, and pincode controls.
- [x] Batch 5.2: Polish the home and shop views for small screens, including
  hero and testimonial layouts, category controls, dynamic product cards,
  active offers, and delivery-check states.
- [x] Batch 5.3: Make cart and checkout interactions comfortable on mobile,
  including quantity controls, delivery details, order summary, validation,
  and submission states.
- [x] Batch 5.4: Make order history and order confirmation responsive, covering
  dynamic loading, empty, error, and action states.
- [x] Batch 5.5: Verify all routes and shared surfaces at narrow mobile,
  tablet, and desktop widths; fix horizontal overflow, inaccessible controls,
  and layout regressions.

Acceptance criteria: Home, shop, checkout, orders, and order confirmation,
along with shared navigation, footer, authentication, cart, and pincode UI,
adapt without horizontal overflow at common mobile widths; dynamic data and
loading/empty/error states remain usable at every supported width.

## Phase 6: New Additions — Google Auth and Account Linking

**Status: CLOSED WITH DEFERRED WORK** — Batch 6.1 is complete for local development. The
user confirmed the Google checkout test and placed an order; production URL
configuration remains a deployment prerequisite. The user reports that manual
linking is enabled. Remaining Batch 6.2 work and Batches 6.3 and 6.4 are
deferred to Phase TBD; live linking and email verification are not yet verified.

- [x] Batch 6.1: Configure Google OAuth with Supabase; document provider setup,
  allowed redirect URLs, and local/production configuration. Add Google sign-in
  and callback/session handling while preserving email and phone OTP, the cart,
  and checkout.
- [x] Batch 6.2: Implement Google identity linking and verified-email UI with
  progress, cancellation, and errors. Mocked checks passed; remaining
  configuration and live verification are deferred to Phase TBD.
Supabase automatically links compatible identities by verified matching email;
phone-only accounts require an explicit signed-in linking flow. An identity
already attached to another user is a conflict, not an automatic account merge.

## Phase 7: Dark, Light, and System Themes

**Status: CLOSED** — all Phase 7 batches are complete.

Provide a responsive theme selector in the top navigation: hover over the
theme icon on desktop or tap it on mobile to reveal icon-only options for dark,
light, and system. Use button backgrounds to distinguish
the options and visibly identify the selected choice; provide accessible names
and selected-state semantics without adding visible text labels. Persist the
selected preference in the browser across reloads and visits. System mode
follows the device preference, including changes while the app is open.

- [x] Batch 7.1: Add shared theme state and semantic theme tokens; restore the
  saved preference before the initial render, support system preference
  changes, and add the responsive, keyboard-accessible navigation selector.
  Handle unavailable browser storage without breaking the application.
- [x] Batch 7.2: Apply theme tokens to shared surfaces, including navigation,
  footer, authentication and account dialogs, cart drawer, and pincode UI.
  Cover interactive, loading, empty, error, and focus states.
- [x] Batch 7.3: Theme the home, shop, checkout, orders, and order confirmation
  pages, including dynamic content and all relevant interaction states. Keep
  the existing responsive layouts and functionality.
- [x] Batch 7.4: Verify all three modes across routes and shared surfaces on
  mobile and desktop. Test persistence, reloads, system preference changes,
  keyboard and screen-reader access, and readable contrast. Document the
  theme conventions so future pages and components support both themes.

Verification covered accessible names and keyboard focus, but did not include
an assistive-technology session or a new live checkout. Checkout was checked
with sample props and an existing order confirmation was viewed read-only.

Acceptance criteria: All routes and shared UI are readable and usable in
light and dark appearances; the icon-only selector works at supported widths;
the chosen dark, light, or system preference persists in the browser; and
system mode tracks device settings. Future UI uses the shared theme tokens
and supports both appearances.

## Phase TBD: On-Hold Work

**Status: ON HOLD** — not part of Phase 6.

- [ ] Deferred Batch 6.3: Address existing separately created accounts and
  identity conflicts: design and implement a secure recovery/merge flow only
  after verifying ownership of both accounts. Preserve order history and other
  account data, enforce authorization, handle conflicts without data loss,
  and provide a safe resolution when an identity is already linked elsewhere.
  Never merge accounts based solely on a claimed email or phone number.
- [ ] Deferred Batch 6.4: Test and document Google sign-in, separate-account
  conflicts, session restoration, checkout, and order access. Cover rejected,
  interrupted, and repeated flows and verify that no user can access another
  user's data. Live linking and verified-email checks remain on hold below.
- [ ] Configure hosted sign-in templates to include both the magic link and
  OTP, and configure the email-change template for verification codes.
- [ ] Verify real Google linking, verified-email addition, and sign-in with
  user-controlled test accounts; cover conflicts and interrupted flows.
- [ ] Add verified phone sign-in methods to existing accounts, including SMS
  provider configuration, verification, cancellation, conflict handling, and
  end-to-end testing.
