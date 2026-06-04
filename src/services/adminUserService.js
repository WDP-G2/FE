import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

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

export const adminUserService = {
  async getUsers() {
    const data = await axiosClient.get(ENDPOINTS.admin.users).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapUser) : []
  },

  async getRoleApplications(params = {}) {
    const [applications, users] = await Promise.all([
      axiosClient.get(ENDPOINTS.admin.roleApplications, { params }).then(unwrapResponse),
      axiosClient.get(ENDPOINTS.admin.users).then(unwrapResponse),
    ])

    const emailByUserId = new Map(
      (Array.isArray(users) ? users : []).map((user) => [user.id, user.email ?? '']),
    )

    return (Array.isArray(applications) ? applications : []).map((application) =>
      mapRoleApplication(application, emailByUserId.get(application?.userId) ?? ''),
    )
  },

  async activateUser(id) {
    await axiosClient
      .put(ENDPOINTS.admin.activateUser(id), {}, { headers: { 'Content-Type': 'application/json' } })
      .then(unwrapResponse)
  },

  async deactivateUser(id) {
    await axiosClient
      .put(ENDPOINTS.admin.deactivateUser(id), {}, { headers: { 'Content-Type': 'application/json' } })
      .then(unwrapResponse)
  },

  async updateUserRole(id, role) {
    const data = await axiosClient
      .put(ENDPOINTS.admin.userRole(id), { role })
      .then(unwrapResponse)
    return mapUser(data)
  },

  async approveRoleApplication(profileId, role) {
    const data = await axiosClient
      .put(ENDPOINTS.admin.approveRoleApplication(profileId), null, {
        params: role ? { role } : undefined,
      })
      .then(unwrapResponse)
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
    return mapRoleApplication(data)
  },
}
