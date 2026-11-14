import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/" className="text-lg font-semibold tracking-tight text-stone-900">
            pet hut<span className="text-emerald-700">.</span>
          </Link>
          <p className="mt-1 text-sm text-stone-500">Thoughtful essentials for pets across Karnataka.</p>
        </div>
        <nav className="flex gap-6 text-sm text-stone-600" aria-label="Footer navigation">
          <Link className="transition hover:text-stone-950" to="/">Home</Link>
          <Link className="transition hover:text-stone-950" to="/shop">Shop</Link>
          <Link className="transition hover:text-stone-950" to="/sign-in">Sign in</Link>
        </nav>
        <p className="text-xs text-stone-400">© {new Date().getFullYear()} Pet Hut</p>
      </div>
    </footer>
  )
}
