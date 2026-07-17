import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { idempotencyConfig } from '@/utils/idempotency'

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
  const performance = profile?.performance ?? {}
  const totalRaces = Number(performance?.totalRaces ?? 0)
  const wins = Number(performance?.wins ?? 0)
  const winRate = Number(performance?.winRate ?? 0)

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
    wins,
    races: totalRaces,
    winRate,
    ranking: '-',
    raceHistory: Array.isArray(profile?.raceHistory) ? profile.raceHistory : [],
    performance,
    assigned: null,
    active: true,
    hasApprovedProfile: true,
    raw: profile,
  }
}

export function mapJockeyInvitation(invitation) {
  const statusCode = invitation?.status ?? 'PENDING'
  const remunerationAmount = Number(invitation?.remunerationAmount ?? 0)

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
    raceId: invitation?.raceId,
    raceName: invitation?.raceName ?? '',
    raceScheduledStartAt: invitation?.raceScheduledStartAt ?? null,
    raceScheduledEndAt: invitation?.raceScheduledEndAt ?? null,
    venueId: invitation?.venueId,
    venueName: invitation?.venueName ?? '',
    venueAddress: invitation?.venueAddress ?? '',
    tournamentId: invitation?.tournamentId,
    tournamentName: invitation?.tournamentName ?? '',
    statusCode,
    status: INVITATION_STATUS_LABELS[statusCode] ?? statusCode,
    statusTone: INVITATION_STATUS_TONES[statusCode] ?? 'gray',
    message: invitation?.message ?? '',
    responseNote: invitation?.responseNote ?? '',
    remunerationAmount,
    remunerationText: formatCurrency(remunerationAmount),
    reward: remunerationAmount,
    taxAmount: Number(invitation?.taxAmount ?? 0),
    jockeyPayoutAmount: Number(invitation?.jockeyPayoutAmount ?? 0),
    rewardStatus: invitation?.rewardStatus ?? 'NONE',
    createdAt: invitation?.createdAt ?? null,
    updatedAt: invitation?.updatedAt ?? null,
    respondedAt: invitation?.respondedAt ?? null,
    cancelledAt: invitation?.cancelledAt ?? null,
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

  async getJockeyDetail(id) {
    const data = await axiosClient.get(ENDPOINTS.jockeys.publicById(id)).then(unwrapResponse)
    return mapJockeyProfile(data)
  },

  async getOwnerInvitations() {
    const data = await axiosClient.get(ENDPOINTS.jockeys.ownerInvitations).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapJockeyInvitation) : []
  },

  async getOwnerAcceptedJockeys() {
    const data = await axiosClient.get(ENDPOINTS.jockeys.ownerAccepted).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapJockeyInvitation) : []
  },

  /** Races this jockey already accepted (from any owner) — used to lock the invite form's race picker. */
  async getAcceptedRaceLocks(jockeyId) {
    if (!jockeyId) return []
    const data = await axiosClient
      .get(ENDPOINTS.jockeys.ownerJockeyAcceptedRaces(jockeyId))
      .then(unwrapResponse)
    return Array.isArray(data)
      ? data.map((row) => ({
          raceId: row?.raceId ? String(row.raceId) : '',
          tournamentId: row?.tournamentId ? String(row.tournamentId) : '',
          raceLabel: row?.raceLabel ?? '',
          tournamentName: row?.tournamentName ?? '',
        }))
      : []
  },

  async createInvitation({ horseId, raceId, jockeyId, message, remunerationAmount }, idempotencyKey) {
    const data = await axiosClient
      .post(ENDPOINTS.jockeys.ownerInvitations, { horseId, raceId, jockeyId, message, remunerationAmount }, idempotencyConfig(idempotencyKey))
      .then(unwrapResponse)
    return mapJockeyInvitation(data)
  },

  async cancelInvitation(id) {
    const data = await axiosClient.put(ENDPOINTS.jockeys.ownerCancelInvitation(id)).then(unwrapResponse)
    return mapJockeyInvitation(data)
  },

  async getJockeyInvitations() {
    const data = await axiosClient.get(ENDPOINTS.jockeys.jockeyInvitations).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapJockeyInvitation) : []
  },

  async acceptJockeyInvitation(id, note = '') {
    const payload = note?.trim() ? { note: note.trim() } : null
    const data = await axiosClient.put(ENDPOINTS.jockeys.jockeyAcceptInvitation(id), payload).then(unwrapResponse)
    return mapJockeyInvitation(data)
  },

  async rejectJockeyInvitation(id, note = '') {
    const payload = note?.trim() ? { note: note.trim() } : null
    const data = await axiosClient.put(ENDPOINTS.jockeys.jockeyRejectInvitation(id), payload).then(unwrapResponse)
    return mapJockeyInvitation(data)
  },

  async getMyProfile() {
    const data = await axiosClient.get(ENDPOINTS.jockeys.profile).then(unwrapResponse)
    return mapJockeyProfile(data)
  },

  async updateMyProfile(payload = {}, files = {}) {
    const formData = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value)
      }
    })
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file)
    })

    const data = await axiosClient
      .put(ENDPOINTS.jockeys.profile, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)

    return mapJockeyProfile(data)
  },

  async getDashboard() {
    return axiosClient.get(ENDPOINTS.jockeys.dashboard).then(unwrapResponse)
  },

  async getRaces() {
    const data = await axiosClient.get(ENDPOINTS.jockeys.races).then(unwrapResponse)
    return Array.isArray(data) ? data : []
  },

  async getPerformance() {
    return axiosClient.get(ENDPOINTS.jockeys.performance).then(unwrapResponse)
  },

  async getPrizes() {
    const data = await axiosClient.get(ENDPOINTS.jockeys.prizes).then(unwrapResponse)
    return Array.isArray(data) ? data : []
  },
}
