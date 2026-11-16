const GOOGLE_AUTH_INTENT = 'pet-hut-google-auth-intent'
const GOOGLE_LINK_INTENT = 'pet-hut-google-link-intent'

export function saveGoogleLinkIntent(storage, userId) {
  storage.setItem(GOOGLE_LINK_INTENT, userId)
}

export function takeGoogleLinkIntent(storage) {
  const userId = storage.getItem(GOOGLE_LINK_INTENT)
  storage.removeItem(GOOGLE_LINK_INTENT)
  return userId
}

export function saveGoogleAuthIntent(storage, continueCheckout) {
  storage.setItem(GOOGLE_AUTH_INTENT, continueCheckout ? 'checkout' : 'shop')
}

export function takeGoogleAuthIntent(storage) {
  const intent = storage.getItem(GOOGLE_AUTH_INTENT)
  storage.removeItem(GOOGLE_AUTH_INTENT)
  return intent === 'checkout' ? 'checkout' : 'shop'
}

export function getGoogleCallbackError(location) {
  const query = new URLSearchParams(location.search)
  const fragment = new URLSearchParams(location.hash.replace(/^#/, ''))
  if (query.has('error') || query.has('error_code') ||
      fragment.has('error') || fragment.has('error_code')) {
    return 'Google sign-in was cancelled or failed. Please try again.'
  }
  return ''
}
