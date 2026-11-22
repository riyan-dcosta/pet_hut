export const THEME_STORAGE_KEY = 'pet-hut-theme'

const preferences = ['light', 'dark', 'system']

export function createThemeController(browser) {
  const root = browser.document.documentElement
  const media = browser.matchMedia('(prefers-color-scheme: dark)')
  const listeners = new Set()
  let preference = 'system'

  function apply() {
    root.dataset.theme = preference === 'system'
      ? (media.matches ? 'dark' : 'light')
      : preference
    root.dataset.themePreference = preference
  }

  function notify() {
    apply()
    listeners.forEach((listener) => listener())
  }

  try {
    const saved = browser.localStorage.getItem(THEME_STORAGE_KEY)
    if (preferences.includes(saved)) preference = saved
  } catch (error) {
    console.warn('Unable to read the saved theme preference.', error)
  }
  apply()

  media.addEventListener('change', () => {
    if (preference === 'system') notify()
  })
  browser.addEventListener('storage', (event) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) return
    preference = preferences.includes(event.newValue) ? event.newValue : 'system'
    notify()
  })

  return {
    getPreference: () => preference,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    setPreference(next) {
      if (!preferences.includes(next)) throw new TypeError('Invalid theme preference')
      preference = next
      notify()
      try {
        browser.localStorage.setItem(THEME_STORAGE_KEY, next)
      } catch (error) {
        console.warn('Unable to save the theme preference.', error)
      }
    },
  }
}
