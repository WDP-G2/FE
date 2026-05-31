import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'

const STATUS_LABELS = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã công bố',
  OPEN_REGISTRATION: 'Đang mở đăng ký',
  REGISTRATION_CLOSED: 'Đã đóng đăng ký',
  SCHEDULED: 'Đã lên lịch',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
}

function toDate(value) {
  return value ? value.slice(0, 10) : ''
}

function sumRegistrations(races = []) {
  return races.reduce((total, race) => total + Number(race?.participantCount ?? 0), 0)
}

export function mapTournament(tournament) {
  if (!tournament) return null

  const races = Array.isArray(tournament.races) ? tournament.races : []

  return {
    id: String(tournament.id),
    name: tournament.name ?? '',
    description: tournament.description ?? '',
    status: STATUS_LABELS[tournament.status] ?? tournament.status ?? 'Nháp',
    statusCode: tournament.status,
    location: tournament.location ?? '',
    startDate: toDate(tournament.startAt),
    endDate: toDate(tournament.endAt),
    raceCount: races.length,
    registrations: sumRegistrations(races),
    banner: tournament.bannerUrl || FALLBACK_BANNER,
    races,
    createdAt: tournament.createdAt,
    updatedAt: tournament.updatedAt,
  }
}

export const tournamentService = {
  async uploadTournamentBanner(file) {
    const formData = new FormData()
    formData.append('banner', file)

    return axiosClient
      .post(ENDPOINTS.tournaments.adminBanners, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)
  },

  async createTournament(payload) {
    const tournament = await axiosClient
      .post(ENDPOINTS.tournaments.adminList, payload)
      .then(unwrapResponse)

    return { data: mapTournament(tournament), raw: tournament }
  },

  async updateTournamentStatus(id, status) {
    const tournament = await axiosClient
      .put(ENDPOINTS.tournaments.adminStatus(id), null, { params: { status } })
      .then(unwrapResponse)

    return { data: mapTournament(tournament), raw: tournament }
  },

  async getAdminTournaments(params = {}) {
    const list = await axiosClient
      .get(ENDPOINTS.tournaments.adminList, { params })
      .then(unwrapResponse)

    return {
      data: (Array.isArray(list) ? list : []).map(mapTournament).filter(Boolean),
    }
  },

  async getAdminTournament(id) {
    const tournament = await axiosClient
      .get(ENDPOINTS.tournaments.adminById(id))
      .then(unwrapResponse)

    const mapped = mapTournament(tournament)
    if (!mapped) throw new Error('Tournament not found')
    return { data: mapped }
  },
}
