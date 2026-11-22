export function mapUser(user) {
  if (!user) return null
  const method = user.phone ? 'phone' : 'email'
  const identifier = user.phone || user.email
  if (!identifier) return null

  const metadata = user.user_metadata
  const name = [metadata?.full_name, metadata?.name, metadata?.user_name, metadata?.username]
    .find((value) => typeof value === 'string' && value.trim())

  return {
    id: user.id,
    method,
    identifier,
    name: name?.trim() || null,
    signedInAt: user.last_sign_in_at ?? null,
    email: user.email_confirmed_at ? user.email || null : null,
    phone: user.phone_confirmed_at ? user.phone || null : null,
    providers: Array.isArray(user.identities)
      ? [...new Set(user.identities.map((identity) => identity.provider).filter(Boolean))]
      : [],
  }
}

export function getAccountLabel(user) {
  if (!user) return 'Sign in'
  return user.name ? `Hello, ${user.name}` : 'Signed In'
}
