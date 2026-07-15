import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { idempotencyConfig, stableIdempotencyKey } from '@/utils/idempotency'

export const RACE_REGISTRATION_STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  ONGOING: 'Đang chạy',
  COMPLETED: 'Hoàn thành',
  REJECTED: 'Từ chối',
  WITHDRAWN: 'Đã rút',
  CANCELLED: 'Đã hủy',
}

export const RACE_REGISTRATION_STATUS_TONES = {
  PENDING: 'gold',
  APPROVED: 'green',
  ONGOING: 'purple',
  COMPLETED: 'green',
  REJECTED: 'red',
  WITHDRAWN: 'gray',
  CANCELLED: 'red',
}

export const ACTIVE_RACE_REGISTRATION_STATUSES = ['PENDING', 'APPROVED']

const STATUS_LABEL_TO_CODE = {
  'Chờ duyệt': 'PENDING',
  'Đã duyệt': 'APPROVED',
  'Từ chối': 'REJECTED',
  'Đã rút': 'WITHDRAWN',
  'Đang chạy': 'ONGOING',
  'Hoàn thành': 'COMPLETED',
}

function normalizeStatusCode(status) {
  if (!status) return 'PENDING'
  const value = String(status).trim()
  if (RACE_REGISTRATION_STATUS_LABELS[value]) return value
  return STATUS_LABEL_TO_CODE[value] || value.toUpperCase()
}

export function mapRaceRegistration(registration) {
  const statusCode = normalizeStatusCode(registration?.status)

  return {
    id: String(registration?.id ?? ''),
    rawId: registration?.id,
    raceId: registration?.raceId,
    raceName: registration?.raceName ?? '',
    raceNumber: registration?.raceNumber ?? null,
    raceScheduledAt: registration?.raceScheduledAt ?? null,
    tournamentStartDate: registration?.tournamentStartDate ?? null,
    tournamentId: registration?.tournamentId,
    tournamentName: registration?.tournamentName ?? '',
    ownerId: registration?.ownerId,
    ownerUsername: registration?.ownerUsername ?? registration?.ownerName ?? '',
    horseId: registration?.horseId,
    horseName: registration?.horseName ?? '',
    jockeyId: registration?.jockeyId,
    jockeyUsername: registration?.jockeyUsername ?? registration?.jockeyName ?? '',
    jockeyInvitationId: registration?.jockeyInvitationId,
    checkInStatus: registration?.checkInStatus ?? 'PENDING',
    statusCode,
    status: RACE_REGISTRATION_STATUS_LABELS[statusCode] ?? statusCode,
    statusTone: RACE_REGISTRATION_STATUS_TONES[statusCode] ?? 'gray',
    entryFeeAmount: Number(registration?.entryFeeAmount ?? 0),
    depositAmount: Number(registration?.depositAmount ?? 0),
    paymentStatus: registration?.paymentStatus ?? 'UNCHARGED',
    depositStatus: registration?.depositStatus ?? 'NONE',
    ownerNote: registration?.ownerNote ?? '',
    reviewNote: registration?.reviewNote ?? '',
    withdrawNote: registration?.withdrawNote ?? '',
    reviewedBy: registration?.reviewedBy ?? null,
    reviewedAt: registration?.reviewedAt ?? null,
    createdAt: registration?.createdAt ?? registration?.registeredAt ?? null,
    updatedAt: registration?.updatedAt ?? null,
    raw: registration,
  }
}

export const raceRegistrationService = {
  async getOwnerRegistrations() {
    const data = await axiosClient.get(ENDPOINTS.raceRegistrations.ownerList).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapRaceRegistration) : []
  },

  async getAdminTournamentRegistrations(tournamentId) {
    const data = await axiosClient
      .get(ENDPOINTS.tournaments.adminRaceRegistrations(tournamentId))
      .then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapRaceRegistration) : []
  },

  async registerForRace(raceId, payload) {
    const data = await axiosClient
      .post(ENDPOINTS.races.registrations(raceId), payload)
      .then(unwrapResponse)
    return mapRaceRegistration(data)
  },

  async withdrawOwnerRegistration(id, note = '') {
    const payload = note?.trim() ? { note: note.trim() } : null
    const data = await axiosClient
      .put(ENDPOINTS.raceRegistrations.ownerWithdraw(id), payload)
      .then(unwrapResponse)
    return mapRaceRegistration(data)
  },

  async approveRegistration(id, note = '') {
    const payload = note?.trim() ? { note: note.trim() } : null
    const data = await axiosClient
      .put(ENDPOINTS.raceRegistrations.adminApprove(id), payload, idempotencyConfig(stableIdempotencyKey(`registration-approve:${id}`)))
      .then(unwrapResponse)
    return mapRaceRegistration(data)
  },

  async rejectRegistration(id, note = '') {
    const payload = { note: note?.trim() || 'Không đạt điều kiện duyệt' }
    const data = await axiosClient
      .put(ENDPOINTS.raceRegistrations.adminReject(id), payload)
      .then(unwrapResponse)
    return mapRaceRegistration(data)
  },
}
