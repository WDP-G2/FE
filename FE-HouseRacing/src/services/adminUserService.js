import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { formatDisplayDateTime } from '@/utils/dateFormat'
import { cachedRequest, invalidateCachedRequest } from '@/utils/requestCache'

export const ROLE_LABELS = {
  USER: 'Người dùng',
  OWNER: 'Chủ ngựa',
  ADMIN: 'Admin',
  JOCKEY: 'Jockey',
  SPECTATOR: 'Khán giả',
  REFEREE: 'Trọng tài',
}

export const ROLE_VALUES = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const ROLE_APPLICATION_STATUS_LABELS = {
  NONE: 'Không có',
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
}

function formatDateTime(value) {
  return formatDisplayDateTime(value, 'Chưa cập nhật')
  if (!value) return 'Chưa cập nhật'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function parseUserActive(value) {
  if (value === true || value === 1 || value === 'true') return true
  if (value === false || value === 0 || value === 'false') return false
  return true
}

export function mapUser(user) {
  const roleCode = user?.role ?? 'USER'
  const active = parseUserActive(user?.active)
  const displayName = user?.fullName || user?.username || user?.email || `User #${user?.id ?? ''}`
  const pendingRoleCode = user?.pendingRole ?? null

  return {
    id: String(user?.id ?? ''),
    rawId: user?.id,
    name: displayName,
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    location: user?.location ?? '',
    avatarUrl: user?.avatarUrl ?? '',
    roleCode,
    role: ROLE_LABELS[roleCode] ?? roleCode,
    pendingRoleCode,
    pendingRole: pendingRoleCode ? ROLE_LABELS[pendingRoleCode] ?? pendingRoleCode : '',
    roleApprovalStatus: user?.roleApprovalStatus ?? 'NONE',
    status: active ? 'Đang hoạt động' : 'Tạm khóa',
    active,
    meta: [
      user?.phone ? `SĐT: ${user.phone}` : null,
      user?.location ? `Khu vực: ${user.location}` : null,
      user?.createdAt ? `Tạo: ${formatDateTime(user.createdAt)}` : null,
    ].filter(Boolean).join(' · ') || 'Chưa có ghi chú',
    createdAt: user?.createdAt ?? null,
    updatedAt: user?.updatedAt ?? null,
  }
}

export function mapRoleApplication(application, emailFromUser = '') {
  const roleCode = application?.role ?? 'USER'
  const statusCode = application?.status ?? 'PENDING'
  const email = application?.email ?? emailFromUser ?? ''
  const name =
    application?.fullName ||
    application?.displayName ||
    application?.stableName ||
    application?.username ||
    email ||
    `User #${application?.userId ?? ''}`

  const raw = { ...application, email }

  return {
    id: String(application?.profileId ?? ''),
    profileId: application?.profileId,
    userId: application?.userId,
    user: name,
    username: application?.username ?? '',
    email,
    from: 'Người dùng',
    to: ROLE_LABELS[roleCode] ?? roleCode,
    roleCode,
    statusCode,
    status: ROLE_APPLICATION_STATUS_LABELS[statusCode] ?? statusCode,
    reviewReason: application?.reviewReason ?? '',
    submittedAt: formatDateTime(application?.createdAt),
    updatedAt: application?.updatedAt ?? null,
    raw,
  }
}

export function resolveUserId(user) {
  const id = String(user?.rawId ?? user?.id ?? '').trim()
  return id || null
}

export const adminUserService = {
  async getUsers() {
    const data = await cachedRequest('admin:users', () =>
      axiosClient.get(ENDPOINTS.admin.users).then(unwrapResponse),
    )
    return Array.isArray(data) ? data.map(mapUser) : []
  },

  async getRoleApplications(params = {}, users = null) {
    const applications = await axiosClient
      .get(ENDPOINTS.admin.roleApplications, { params })
      .then(unwrapResponse)

    const list = Array.isArray(applications) ? applications : []

    if (Array.isArray(users)) {
      const emailByUserId = new Map(users.map((user) => [user.rawId ?? user.id, user.email ?? '']))
      return list.map((application) =>
        mapRoleApplication(application, emailByUserId.get(application?.userId) ?? ''),
      )
    }

    const allUsers = await axiosClient.get(ENDPOINTS.admin.users).then(unwrapResponse)
    const emailByUserId = new Map(
      (Array.isArray(allUsers) ? allUsers : []).map((user) => [user.id, user.email ?? '']),
    )

    return list.map((application) =>
      mapRoleApplication(application, emailByUserId.get(application?.userId) ?? ''),
    )
  },

  async getUserById(id) {
    const data = await axiosClient.get(ENDPOINTS.admin.userById(id)).then(unwrapResponse)
    return mapUser(data)
  },

  async activateUser(id) {
    const userId = String(id ?? '').trim()
    await axiosClient
      .put(ENDPOINTS.admin.activateUser(userId), {}, { headers: { 'Content-Type': 'application/json' } })
      .then(unwrapResponse)
    invalidateCachedRequest('admin:users')
    return this.getUserById(userId)
  },

  async deactivateUser(id) {
    const userId = String(id ?? '').trim()
    await axiosClient
      .put(ENDPOINTS.admin.deactivateUser(userId), {}, { headers: { 'Content-Type': 'application/json' } })
      .then(unwrapResponse)
    invalidateCachedRequest('admin:users')
    return this.getUserById(userId)
  },

  async updateUserRole(id, role) {
    const data = await axiosClient
      .put(ENDPOINTS.admin.userRole(id), { role })
      .then(unwrapResponse)
    invalidateCachedRequest('admin:users')
    return mapUser(data)
  },

  async approveRoleApplication(profileId, role) {
    const data = await axiosClient
      .put(ENDPOINTS.admin.approveRoleApplication(profileId), null, {
        params: role ? { role } : undefined,
      })
      .then(unwrapResponse)
    invalidateCachedRequest('admin:users')
    return mapRoleApplication(data)
  },

  async rejectRoleApplication(profileId, reason, role) {
    const data = await axiosClient
      .put(
        ENDPOINTS.admin.rejectRoleApplication(profileId),
        { reason },
        { params: role ? { role } : undefined },
      )
      .then(unwrapResponse)
    invalidateCachedRequest('admin:users')
    return mapRoleApplication(data)
  },
}
