import { normalizeRole } from '@/utils/roleRedirect'

/** Map AuthResponse / UserResponse từ BE sang user object trong store */
export function mapAuthResponseToUser(auth) {
  if (!auth) return null
  return {
    id: auth.userId ?? auth.id,
    username: auth.username,
    email: auth.email,
    role: auth.role,
    fullName: auth.fullName,
    phone: auth.phone,
    pendingRole: auth.pendingRole,
    roleApprovalStatus: auth.roleApprovalStatus,
    roleReviewReason: auth.roleReviewReason,
    avatarUrl: auth.avatarUrl,
    createdAt: auth.createdAt,
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
