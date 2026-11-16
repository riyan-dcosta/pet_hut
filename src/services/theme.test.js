import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createThemeController, THEME_STORAGE_KEY } from './theme.js'

function makeBrowser(saved = null, dark = false) {
  const handlers = {}
  const mediaHandlers = {}
  const values = new Map(saved === null ? [] : [[THEME_STORAGE_KEY, saved]])
  const media = {
    matches: dark,
    addEventListener: (type, handler) => { mediaHandlers[type] = handler },
  }
  return {
    document: { documentElement: { dataset: {} } },
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
    matchMedia: () => media,
    addEventListener: (type, handler) => { handlers[type] = handler },
    setSystemDark(value) {
      media.matches = value
      mediaHandlers.change()
    },
    storageEvent(event) { handlers.storage(event) },
  }
}

test('restores a saved preference before applying a theme', () => {
  const browser = makeBrowser('dark')
  const controller = createThemeController(browser)
  assert.equal(controller.getPreference(), 'dark')
  assert.deepEqual(browser.document.documentElement.dataset, {
    theme: 'dark', themePreference: 'dark',
  })
})

test('persists selections and tracks system changes only in system mode', () => {
  const browser = makeBrowser(null, false)
  const controller = createThemeController(browser)
  let updates = 0
  const unsubscribe = controller.subscribe(() => { updates += 1 })

  browser.setSystemDark(true)
  assert.equal(browser.document.documentElement.dataset.theme, 'dark')
  controller.setPreference('light')
  assert.equal(browser.localStorage.getItem(THEME_STORAGE_KEY), 'light')
  browser.setSystemDark(false)
  browser.setSystemDark(true)
  assert.equal(browser.document.documentElement.dataset.theme, 'light')
  controller.setPreference('system')
  assert.equal(browser.document.documentElement.dataset.theme, 'dark')
  unsubscribe()
  browser.setSystemDark(false)
  assert.equal(browser.document.documentElement.dataset.theme, 'light')
  assert.equal(updates, 3)
})

test('syncs other tabs and resets invalid or removed preferences to system', () => {
  const browser = makeBrowser('dark', false)
  const controller = createThemeController(browser)
  browser.storageEvent({ key: THEME_STORAGE_KEY, newValue: 'light' })
  assert.equal(controller.getPreference(), 'light')
  browser.storageEvent({ key: 'other', newValue: 'dark' })
  assert.equal(controller.getPreference(), 'light')
  browser.storageEvent({ key: THEME_STORAGE_KEY, newValue: 'invalid' })
  assert.equal(controller.getPreference(), 'system')
  assert.equal(browser.document.documentElement.dataset.theme, 'light')
  assert.throws(() => controller.setPreference('invalid'), TypeError)
})

test('continues in memory and reports unavailable storage', () => {
  const browser = makeBrowser()
  Object.defineProperty(browser, 'localStorage', {
    get() { throw new Error('Storage unavailable') },
  })
  const warnings = []
  const warn = console.warn
  console.warn = (...args) => warnings.push(args)
  try {
    const controller = createThemeController(browser)
    controller.setPreference('dark')
    assert.equal(browser.document.documentElement.dataset.theme, 'dark')
    assert.equal(warnings.length, 2)
  } finally {
    console.warn = warn
  }
})
