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

## Phase 5: New Additions — Google Auth and Account Linking

**Status: PLANNED** — begins after Phase 4 is complete.

- [ ] Batch 5.1: Configure Google OAuth with Supabase; document provider setup,
  allowed redirect URLs, and local/production configuration. Add Google sign-in
  and callback/session handling while preserving email and phone OTP, the cart,
  and checkout.
- [ ] Batch 5.2: Let signed-in email-only or phone-only users explicitly link a
  Google identity, and let Google users add verified email and phone sign-in
  methods. Enable Supabase manual identity linking and show linked methods,
  progress, cancellation, and errors without exposing sensitive credentials.
- [ ] Batch 5.3: Address existing separately created accounts and identity
  conflicts: design and implement a secure recovery/merge flow only after
  verifying ownership of both accounts. Preserve order history and other
  account data, enforce authorization, handle conflicts without data loss,
  and provide a safe resolution when an identity is already linked elsewhere.
  Never merge accounts based solely on a claimed email or phone number.
- [ ] Batch 5.4: Test and document Google sign-in, verified-email automatic
  linking, explicit linking for phone-only and email-only accounts, adding
  verified contact methods, separate-account conflicts, session restoration,
  checkout, and order access. Cover rejected, interrupted, and repeated flows
  and verify that no user can access another user's data.

Supabase automatically links compatible identities by verified matching email;
phone-only accounts require an explicit signed-in linking flow. An identity
already attached to another user is a conflict, not an automatic account merge.
