import { Link } from 'react-router-dom'

export default function Footer({ onSignInClick, isAuthenticated = false }) {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/" className="text-lg font-semibold tracking-tight text-stone-900">
            pet hut<span className="text-emerald-700">.</span>
          </Link>
          <p className="mt-1 text-sm text-stone-500">Thoughtful essentials for pets across Karnataka.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-600" aria-label="Footer navigation">
          <Link className="inline-flex min-h-11 items-center transition hover:text-stone-950" to="/">Home</Link>
          <Link className="inline-flex min-h-11 items-center transition hover:text-stone-950" to="/shop">Shop</Link>
          {isAuthenticated && <Link className="inline-flex min-h-11 items-center transition hover:text-stone-950" to="/orders">Orders</Link>}
          <button
            type="button"
            className="inline-flex min-h-11 items-center transition hover:text-stone-950"
            onClick={onSignInClick}
          >
            {isAuthenticated ? 'Account' : 'Sign in'}
          </button>
        </nav>
        <p className="text-xs text-stone-400">© {new Date().getFullYear()} Pet Hut</p>
      </div>
    </footer>
  )
}
