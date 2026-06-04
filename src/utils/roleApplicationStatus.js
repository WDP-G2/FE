import { normalizeRole } from '@/utils/roleRedirect'

/** Trạng thái thẻ vai trò: none | pending | approved | rejected */
export function getRoleCardStatus(roleKey, user) {
  if (!user) return 'none'
  const current = normalizeRole(user.role)
  const pending = normalizeRole(user.pendingRole)
  const status = user.roleApprovalStatus

  if (current === roleKey && status === 'APPROVED') return 'approved'
  if (pending === roleKey) {
    if (status === 'PENDING') return 'pending'
    if (status === 'REJECTED') return 'rejected'
  }
  return 'none'
}

export function canSubmitRoleRequest(user) {
  if (!user) return false
  if (normalizeRole(user.role) !== 'USER') return false
  return user.roleApprovalStatus !== 'PENDING'
}

export function hasPendingOtherRole(user, roleKey) {
  const pending = normalizeRole(user?.pendingRole)
  return user?.roleApprovalStatus === 'PENDING' && pending && pending !== roleKey
}
