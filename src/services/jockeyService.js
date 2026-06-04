import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

const INVITATION_STATUS_LABELS = {
  PENDING: 'Chờ phản hồi',
  ACCEPTED: 'Đã nhận',
  REJECTED: 'Từ chối',
  CANCELLED: 'Đã hủy',
}

const INVITATION_STATUS_TONES = {
  PENDING: 'gold',
  ACCEPTED: 'green',
  REJECTED: 'red',
  CANCELLED: 'gray',
}

function formatCurrency(value) {
  const amount = Number(value ?? 0)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function mapJockeyAccount(user) {
  const active = user?.active !== false

  return {
    id: String(user?.id ?? ''),
    profileId: null,
    userId: user?.id,
    name: user?.fullName || user?.username || `Jockey #${user?.id ?? ''}`,
    username: user?.username ?? '',
    email: user?.email ?? '',
    license: 'Chưa có hồ sơ đã duyệt',
    experience: 0,
    height: 0,
    weight: 0,
    hirePrice: 0,
    hirePriceText: formatCurrency(0),
    bio: '',
    awards: '',
    achievements: '',
    specialties: '',
    avatarUrl: user?.avatarUrl ?? '',
    statusCode: active ? 'NO_APPROVED_PROFILE' : 'INACTIVE',
    status: active ? 'Chưa có hồ sơ duyệt' : 'Tài khoản bị khóa',
    statusTone: active ? 'gray' : 'red',
    wins: 0,
    races: 0,
    winRate: 0,
    ranking: '-',
    assigned: null,
    active,
    hasApprovedProfile: false,
    raw: user,
  }
}

export function mapJockeyProfile(profile) {
  return {
    id: String(profile?.id ?? ''),
    profileId: profile?.id,
    userId: profile?.userId,
    name: profile?.fullName || profile?.username || `Jockey #${profile?.userId ?? ''}`,
    username: profile?.username ?? '',
    license: profile?.licenseNumber ?? 'Chưa cập nhật',
    experience: Number(profile?.experienceYears ?? 0),
    height: Number(profile?.heightCm ?? 0),
    weight: Number(profile?.weightKg ?? 0),
    hirePrice: Number(profile?.hirePrice ?? 0),
    hirePriceText: formatCurrency(profile?.hirePrice),
    bio: profile?.bio ?? '',
    awards: profile?.awards ?? '',
    achievements: profile?.achievements ?? '',
    specialties: profile?.specialties ?? '',
    avatarUrl: profile?.avatarUrl ?? '',
    licenseDocumentUrl: profile?.licenseDocumentUrl ?? '',
    statusCode: profile?.status ?? 'APPROVED',
    status: 'Sẵn sàng',
    statusTone: 'green',
    wins: 0,
    races: 0,
    winRate: 0,
    ranking: '-',
    assigned: null,
    active: true,
    hasApprovedProfile: true,
    raw: profile,
  }
}

export function mapJockeyInvitation(invitation) {
  const statusCode = invitation?.status ?? 'PENDING'

  return {
    id: String(invitation?.id ?? ''),
    rawId: invitation?.id,
    ownerId: invitation?.ownerId,
    ownerUsername: invitation?.ownerUsername ?? '',
    jockeyId: invitation?.jockeyId,
    jockeyUsername: invitation?.jockeyUsername ?? '',
    jockeyProfileId: invitation?.jockeyProfileId,
    horseId: invitation?.horseId,
    horseName: invitation?.horseName ?? '',
    statusCode,
    status: INVITATION_STATUS_LABELS[statusCode] ?? statusCode,
    statusTone: INVITATION_STATUS_TONES[statusCode] ?? 'gray',
    message: invitation?.message ?? '',
    responseNote: invitation?.responseNote ?? '',
    hirePrice: Number(invitation?.hirePrice ?? 0),
    hirePriceText: formatCurrency(invitation?.hirePrice),
    taxAmount: Number(invitation?.taxAmount ?? 0),
    jockeyPayoutAmount: Number(invitation?.jockeyPayoutAmount ?? 0),
    createdAt: invitation?.createdAt ?? null,
    raw: invitation,
  }
}

export const jockeyService = {
  async getJockeyAccounts() {
    const data = await axiosClient.get(ENDPOINTS.users.jockeys).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapJockeyAccount) : []
  },

  async getAvailableJockeys() {
    const data = await axiosClient.get(ENDPOINTS.jockeys.available).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapJockeyProfile) : []
  },

  async getOwnerInvitations() {
    const data = await axiosClient.get(ENDPOINTS.jockeys.ownerInvitations).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapJockeyInvitation) : []
  },

  async getOwnerAcceptedJockeys() {
    const data = await axiosClient.get(ENDPOINTS.jockeys.ownerAccepted).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapJockeyInvitation) : []
  },

  async createInvitation({ horseId, jockeyId, message }) {
    const data = await axiosClient
      .post(ENDPOINTS.jockeys.ownerInvitations, { horseId, jockeyId, message })
      .then(unwrapResponse)
    return mapJockeyInvitation(data)
  },

  async cancelInvitation(id) {
    const data = await axiosClient.put(ENDPOINTS.jockeys.ownerCancelInvitation(id)).then(unwrapResponse)
    return mapJockeyInvitation(data)
  },
}
