import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getCurrentUser } from './authService.js'

test('restores the current Supabase user', async () => {
  const supabase = {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            user: {
              id: 'user-123',
              email: 'user@example.com',
              email_confirmed_at: '2026-01-01T00:00:00.000Z',
              user_metadata: { full_name: 'Pet Parent' },
              identities: [{ provider: 'email' }],
            },
          },
        },
        error: null,
      }),
    },
  }

  assert.deepEqual(await getCurrentUser(supabase), {
    id: 'user-123',
    method: 'email',
    identifier: 'user@example.com',
    name: 'Pet Parent',
    signedInAt: null,
    email: 'user@example.com',
    phone: null,
    providers: ['email'],
  })
})

test('returns null when the Supabase session is empty', async () => {
  const supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
    },
  }

  assert.equal(await getCurrentUser(supabase), null)
})

test('reports Supabase session errors', async () => {
  const supabase = {
    auth: {
      getSession: async () => ({
        data: { session: null },
        error: { message: 'Session unavailable' },
      }),
    },
  }

  await assert.rejects(getCurrentUser(supabase), /Unable to restore sign-in: Session unavailable/)
})
