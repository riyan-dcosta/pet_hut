import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getAppPath } from './appPaths.js'

test('builds root-relative application paths for root deployments', () => {
  assert.equal(getAppPath('/auth/callback', '/'), '/auth/callback')
})

test('keeps routes inside a configured hosting subdirectory', () => {
  const basePath = '/1jq.790.mytemp.website/pet-hut/'
  assert.equal(getAppPath('/auth/callback', basePath), `${basePath}auth/callback`)
  assert.equal(getAppPath('/', basePath), basePath)
})
