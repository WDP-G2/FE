import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

export const RACE_REGISTRATION_STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  WITHDRAWN: 'Đã rút',
  CANCELLED: 'Đã hủy',
}

export const RACE_REGISTRATION_STATUS_TONES = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
  WITHDRAWN: 'gray',
  CANCELLED: 'red',
}

export const ACTIVE_RACE_REGISTRATION_STATUSES = ['PENDING', 'APPROVED']

export function mapRaceRegistration(registration) {
  const statusCode = registration?.status ?? 'PENDING'

  return {
    id: String(registration?.id ?? ''),
    rawId: registration?.id,
    raceId: registration?.raceId,
    raceName: registration?.raceName ?? '',
    tournamentId: registration?.tournamentId,
    ownerId: registration?.ownerId,
    ownerUsername: registration?.ownerUsername ?? '',
    horseId: registration?.horseId,
    horseName: registration?.horseName ?? '',
    jockeyId: registration?.jockeyId,
    jockeyUsername: registration?.jockeyUsername ?? '',
    jockeyInvitationId: registration?.jockeyInvitationId,
    statusCode,
    status: RACE_REGISTRATION_STATUS_LABELS[statusCode] ?? statusCode,
    statusTone: RACE_REGISTRATION_STATUS_TONES[statusCode] ?? 'gray',
    entryFeeAmount: Number(registration?.entryFeeAmount ?? 0),
    ownerNote: registration?.ownerNote ?? '',
    reviewNote: registration?.reviewNote ?? '',
    withdrawNote: registration?.withdrawNote ?? '',
    reviewedBy: registration?.reviewedBy ?? null,
    reviewedAt: registration?.reviewedAt ?? null,
    createdAt: registration?.createdAt ?? null,
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
      .put(ENDPOINTS.raceRegistrations.adminApprove(id), payload)
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
