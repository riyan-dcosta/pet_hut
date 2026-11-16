import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { getAccountLabel } from '../services/authUser.js'

export default function Navbar({
  onCartClick,
  onSignInClick,
  cartCount = 0,
  user = null,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const isAuthenticated = Boolean(user)
  const accountLabel = getAccountLabel(user)

  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        <Link
          to="/"
          onClick={closeMenu}
          className="text-xl font-semibold tracking-tight text-stone-900"
          aria-label="Pet Hut home"
        >
          pet hut<span className="text-emerald-700">.</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <Link className="text-sm text-stone-600 transition hover:text-stone-950" to="/">
            Home
          </Link>
          <Link className="text-sm text-stone-600 transition hover:text-stone-950" to="/shop">
            Shop
          </Link>
          {isAuthenticated && (
            <Link className="text-sm text-stone-600 transition hover:text-stone-950" to="/orders">
              Orders
            </Link>
          )}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <button
            type="button"
            onClick={onCartClick}
            className="relative inline-flex items-center gap-2 text-sm text-stone-700 transition hover:text-stone-950"
            aria-label={`Open cart, ${cartCount} items`}
          >
            <ShoppingBag size={19} strokeWidth={1.7} aria-hidden="true" />
            <span>Cart</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-100 px-1 text-xs tabular-nums">
              {cartCount}
            </span>
          </button>
          <button
            type="button"
            onClick={onSignInClick}
            className="max-w-40 truncate rounded-full border border-stone-300 px-4 py-2 text-sm text-stone-800 transition hover:border-stone-900"
            title={accountLabel}
          >
            {accountLabel}
          </button>
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <button
            type="button"
            onClick={onCartClick}
            className="relative inline-flex h-11 w-11 items-center justify-center text-stone-700"
            aria-label={`Open cart, ${cartCount} items`}
          >
            <ShoppingBag size={20} strokeWidth={1.7} aria-hidden="true" />
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-700 px-1 text-[10px] text-white">
              {cartCount}
            </span>
          </button>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-stone-700"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="border-t border-stone-100 px-4 py-3 md:hidden sm:px-8"
          aria-label="Mobile navigation"
        >
          <Link className="flex min-h-11 items-center text-sm text-stone-700" to="/" onClick={closeMenu}>
            Home
          </Link>
          <Link className="flex min-h-11 items-center text-sm text-stone-700" to="/shop" onClick={closeMenu}>
            Shop
          </Link>
          {isAuthenticated && (
            <Link className="flex min-h-11 items-center text-sm text-stone-700" to="/orders" onClick={closeMenu}>
              Orders
            </Link>
          )}
          <button
            type="button"
            className="flex min-h-11 items-center text-sm text-stone-700"
            onClick={() => {
              closeMenu()
              onSignInClick()
            }}
          >
            {accountLabel}
          </button>
        </nav>
      )}
    </header>
  )
}
