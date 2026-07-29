const ROLE_HOME = {
  ADMIN: '/admin',
  OWNER: '/horse-owner',
  JOCKEY: '/jockey',
  REFEREE: '/referee',
  SPECTATOR: '/spectator/dashboard',
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
  const role = normalizeRole(user?.role)
  const homePath = getRoleHomePath(role)

  if (!fromPath || fromPath === '/login' || fromPath === '/register') {
    return homePath
  }

  if (role === 'USER') {
    return fromPath
  }

  const portalPrefix = homePath === '/spectator/dashboard' ? '/spectator' : homePath
  return fromPath.startsWith(portalPrefix) ? fromPath : homePath
}
