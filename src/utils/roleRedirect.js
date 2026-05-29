const ROLE_HOME = {
  ADMIN: '/admin',
  OWNER: '/horse-owner',
  JOCKEY: '/jockey',
  REFEREE: '/referee',
  SPECTATOR: '/dashboard',
  USER: '/dashboard',
}

const ROLE_ALIASES = {
  ADMIN: 'ADMIN',
  OWNER: 'OWNER',
  'CHỦ NGỰA': 'OWNER',
  'CHU NGUa': 'OWNER',
  HORSE_OWNER: 'OWNER',
  JOCKEY: 'JOCKEY',
  'KỴ SĨ': 'JOCKEY',
  'KY SI': 'JOCKEY',
  REFEREE: 'REFEREE',
  'TRỌNG TÀI': 'REFEREE',
  SPECTATOR: 'SPECTATOR',
  'KHÁN GIẢ': 'SPECTATOR',
  USER: 'USER',
}

export function normalizeRole(role) {
  if (!role) return null
  const raw = String(role).replace(/^ROLE_/, '').trim()
  const upper = raw.toUpperCase()
  return ROLE_ALIASES[upper] || ROLE_ALIASES[raw] || upper
}

export function getRoleHomePath(role) {
  const normalized = normalizeRole(role)
  if (!normalized) return '/dashboard'
  return ROLE_HOME[normalized] ?? '/dashboard'
}

export function canRoleAccessPath(role, path) {
  if (!path) return false
  const normalized = normalizeRole(role)
  if (!normalized) return false

  if (path.startsWith('/admin')) return normalized === 'ADMIN'
  if (path.startsWith('/horse-owner')) return normalized === 'OWNER'
  if (path.startsWith('/jockey')) return normalized === 'JOCKEY'
  if (path.startsWith('/referee')) return normalized === 'REFEREE'

  return true
}

export function resolvePostLoginPath(role, fromPath) {
  const home = getRoleHomePath(role)
  if (fromPath && canRoleAccessPath(role, fromPath)) {
    return fromPath
  }
  return home
}
