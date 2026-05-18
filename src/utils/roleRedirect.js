const ROLE_HOME = {
  ADMIN: '/admin',
  OWNER: '/horse-owner',
  JOCKEY: '/jockey',
  REFEREE: '/referee',
  SPECTATOR: '/dashboard',
  USER: '/dashboard',
}

export function getRoleHomePath(role) {
  if (!role) return '/dashboard'
  const key = String(role).replace(/^ROLE_/, '')
  return ROLE_HOME[key] ?? '/dashboard'
}

export function normalizeRole(role) {
  if (!role) return null
  return String(role).replace(/^ROLE_/, '')
}
