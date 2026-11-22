# Pet Hut deployment

This is a static Vite application backed by Supabase. It requires a web
server at the root of an HTTPS domain and server-side single-page application
(SPA) routing. SFTP uploads files; it does not configure the server or backend.

## Build and upload

1. Copy `.env.example` to `.env.production.local` and set
   `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the intended production
   Supabase project URL and **publishable** (or legacy `anon`) key. Set
   `VITE_BASE_PATH` to the exact public path of the app, with leading and
   trailing slashes. Use `/` when installed at the domain root. Vite embeds
   these values in the public JavaScript bundle. Never use a secret or
   `service_role` key. Do not upload `.env` files.
2. Run `npm ci` on a fresh checkout, then `npm run build`. The `dist` directory
   is the uploadable site; rebuild whenever the configuration changes.
3. Upload the **contents** of `dist`, including `.htaccess`, to the directory
   served at the configured public path via SFTP. Keep the `assets` directory
   intact. For example, the observed URL
   `https://1jq.790.mytemp.website/1jq.790.mytemp.website/pet-hut/` needs
   `VITE_BASE_PATH=/1jq.790.mytemp.website/pet-hut/`.
4. On Apache, enable `mod_rewrite` and allow `.htaccess` rewrite directives
   (`AllowOverride FileInfo` or equivalent). For Nginx or another server,
   configure it to serve existing files normally and fall back to `/index.html`
   for application routes. The included `.htaccess` has no effect on Nginx.
5. Enable HTTPS and verify the configured base path, plus its `shop`, `orders`,
   and `auth/callback` routes, load directly and after refresh. Test actual
   sign-in and checkout only with controlled test accounts before accepting
   customer orders.

## Before going live

- Confirm the bundled Supabase project is the intended production project; a
  successful build does not distinguish development from production.
- Apply and verify the database schema and RLS policies in that project. Replace
  the seeded sample products, offers, and pincode ranges with verified data.
- Configure the production Site URL and allowed callback URL in Supabase, and
  production origins in Google OAuth. Configure the email templates and SMS
  provider for enabled sign-in methods; verify these flows on the actual host.
- Live cross-account authorization and identity-conflict tests remain
  outstanding. Complete those checks before allowing real customer data.
- Checkout records orders but does not collect payment or enforce inventory.
  Establish an appropriate payment, stock, and fulfilment process before launch.

See `.agents/ARCHITECTURE.md` for Supabase configuration and known limitations.