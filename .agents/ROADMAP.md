# Pet Hut Roadmap

## Project

A pet-store application for Karnataka, India, with INR pricing, serviceability
checks, and guest cart browsing.

## Completed phases

- Phases 1–5: Project setup, storefront, cart, checkout, orders, Supabase
  integration, and responsive UI.
- Phase 6: Google sign-in and account-method UI are implemented. Supabase
  automatic identity linking is retained; already separate accounts are not
  merged. Live verification and production configuration remain incomplete.
- Phase 7: Dark, light, and system themes.

## Phase TBD

**Status: SKIPPED** — remaining pointers are not scheduled, at the user's
request. They have not been implemented or verified:

- Hosted sign-in and email-change template configuration.
- Live Google linking and verified-email testing.
- Adding verified phone sign-in methods to existing accounts.

Before production, the hosted email templates and provider URLs still require
configuration, and live verification is needed. See `ARCHITECTURE.md` for
setup and account-linking limitations.

## QA Testnig

**Status: ON HOLD** — carried over from Batch 6.4; not complete. Live checks
require user-controlled test accounts.

- [ ] Test Google sign-in, separate-account conflicts, session restoration,
  checkout, and order access, including rejected, interrupted, repeated, and
  cross-user access flows.

Fifteen focused auth, callback, account, and order service tests passed. Prior
local checks covered Google sign-in, checkout recovery, and a signed-in order
view. Live cross-user denial and separate-account linking remain unverified.

## PR #4 review findings

**Status: VERIFIED IN CODE** — the four review comments remain open on GitHub;
their fixes were already present in commit `8827b2b` or, for `.env.example`,
were already tracked.

- Cart quantity is capped at 99 for add, update, and saved-cart loading, matching
  the order RPC. The UI boundary was checked in a separate local browser origin.
- Order tests use an authenticated user ID, an async pincode lookup, and a mocked
  RPC; auth tests await a mocked Supabase session lookup.
- `.env.example` is tracked and contains both required placeholder variables.
- All 21 service tests pass.

## SFTP deployment

A root-hosted static build and Apache SPA fallback are available. Production
project selection, host rewrites and HTTPS, auth configuration, live security
verification, real catalog/delivery data, payment, and inventory/fulfilment
remain launch prerequisites; see `readme.md`. The build alone is not evidence
that these are complete.

The supplied hosting HAR showed the app uploaded under
`/1jq.790.mytemp.website/pet-hut/`, while its JS and CSS were requested at
`/assets/` and returned 404. Vite base path, React Router basename, and OAuth
callback URLs now use `VITE_BASE_PATH`; a build for the observed path passed
local asset and SPA fallback checks.
