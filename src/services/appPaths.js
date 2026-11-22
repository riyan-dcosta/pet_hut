export function getAppPath(path, basePath = import.meta.env?.BASE_URL ?? '/') {
  const baseSegments = basePath.split('/').filter(Boolean)
  const base = baseSegments.length ? `/${baseSegments.join('/')}/` : '/'
  const route = path.split('/').filter(Boolean).join('/')
  return route ? `${base}${route}` : base
}
