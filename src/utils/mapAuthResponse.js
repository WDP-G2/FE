import { normalizeRole } from '@/utils/roleRedirect'

/** Map AuthResponse từ BE sang user object trong store */
export function mapAuthResponseToUser(auth) {
  if (!auth) return null
  return {
    id: auth.userId,
    username: auth.username,
    email: auth.email,
    role: auth.role,
    fullName: auth.fullName,
    phone: auth.phone,
  }
}

export function extractAccessToken(auth) {
  return auth?.token || auth?.accessToken || null
}

export function applyAuthToState(auth) {
  const token = extractAccessToken(auth)
  const user = mapAuthResponseToUser(auth)
  const role = normalizeRole(user?.role)
  return { token, user, role, isAuthenticated: !!token && !!user }
}
