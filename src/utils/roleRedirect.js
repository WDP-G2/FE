const ROLE_HOME = {
  ADMIN: '/admin',
  OWNER: '/horse-owner',
  JOCKEY: '/jockey',
  REFEREE: '/referee',
  SPECTATOR: '/dashboard',
  USER: '/',
}

export function getRoleHomePath(role) {
  if (!role) return '/'
  const key = String(role).replace(/^ROLE_/, '')
  return ROLE_HOME[key] ?? '/'
}

export function normalizeRole(role) {
  if (!role) return null
  return String(role).replace(/^ROLE_/, '')
}

/** Đã có vai trò thật (không còn USER cơ bản) → rời trang profile */
export function hasApprovedRole(user) {
  const role = normalizeRole(user?.role)
  return Boolean(role && role !== 'USER')
}

export function getPostLoginPath(user, fromPath) {
  if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
    return fromPath
  }
  return getRoleHomePath(normalizeRole(user?.role))
}
