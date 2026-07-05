import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { useApiCacheStore } from '@/store/apiCacheStore'
import { cachedRequest, invalidateCachedRequest } from '@/utils/requestCache'

export const ADMIN_JUDGES_PUBLISHED_TOURNAMENTS_CACHE_KEY =
  'admin:judges:published-only-tournaments'

export const FALLBACK_TOURNAMENT_BANNER =
  'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'

function normalizeBannerUrl(value) {
  if (!value || typeof value !== 'string') return FALLBACK_TOURNAMENT_BANNER

  const trimmedValue = value.trim()
  if (!trimmedValue) return FALLBACK_TOURNAMENT_BANNER

  return trimmedValue
}

export function setTournamentBannerFallback(event) {
  event.currentTarget.onerror = null
  event.currentTarget.src = FALLBACK_TOURNAMENT_BANNER
}

const STATUS_LABELS = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã công bố',
  OPEN_REGISTRATION: 'Đang mở đăng ký',
  REGISTRATION_CLOSED: 'Đã đóng đăng ký',
  SCHEDULED: 'Đã lên lịch',
  ONGOING: 'Đang diễn ra',
  RESULT_CONFIRMED: 'Đã có kết quả',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
}

const STATUS_TONES = {
  DRAFT: 'gray',
  PUBLISHED: 'blue',
  OPEN_REGISTRATION: 'green',
  REGISTRATION_CLOSED: 'gold',
  SCHEDULED: 'blue',
  ONGOING: 'purple',
  RESULT_CONFIRMED: 'green',
  COMPLETED: 'green',
  CANCELLED: 'red',
}

function toDate(value) {
  return value ? value.slice(0, 10) : ''
}

function toTime(value) {
  return value ? value.slice(11, 16) : ''
}

function sumRegistrations(races = []) {
  return races.reduce((total, race) => total + Number(race?.registered ?? 0), 0)
}

function sumPrizePool(races = []) {
  return races.reduce(
    (total, race) =>
      total +
      (Array.isArray(race?.prizes)
        ? race.prizes.reduce((sum, prize) => sum + Number(prize?.amount ?? 0), 0)
        : 0),
    0,
  )
}

function sumRaceCapacity(races = []) {
  return races.reduce((total, race) => total + Number(race?.maxHorses ?? 0), 0)
}

function firstPositiveEntryFee(races = []) {
  return Number(races.find((race) => Number(race?.entryFee ?? 0) > 0)?.entryFee ?? 0)
}

function mapRacePrizes(prizes = []) {
  return prizes
    .filter(Boolean)
    .map((prize, index) => ({
      id: String(prize?.id ?? `prize-${prize?.rank ?? index + 1}-${index}`),
      rank: Number(prize?.rank ?? index + 1),
      itemName: String(prize?.itemName || prize?.name || `Giải ${index + 1}`),
      amount: Number(prize?.amount ?? 0),
    }))
    .sort((firstPrize, secondPrize) => firstPrize.rank - secondPrize.rank)
}

function mapRace(race, index) {
  const scheduledStartAt = race?.scheduledStartAt ?? ''
  const scheduledEndAt = race?.scheduledEndAt ?? ''
  const venueLabel =
    race?.venueName?.trim()
    || race?.venueAddress?.trim()
    || race?.provinceName?.trim()
    || ''

  return {
    id: String(race?.id ?? index + 1),
    no: index + 1,
    name: race?.name ?? `Cuộc đua ${index + 1}`,
    description: race?.note ?? '',
    date: toDate(scheduledStartAt),
    time: toTime(scheduledStartAt),
    endTime: toTime(scheduledEndAt),
    distance: race?.distance ?? '',
    venueId: race?.venueId == null ? '' : String(race.venueId),
    venueName: race?.venueName ?? '',
    venueAddress: race?.venueAddress ?? '',
    provinceId: race?.provinceId == null ? '' : String(race.provinceId),
    provinceName: race?.provinceName ?? '',
    track: venueLabel || 'Chưa có sân',
    surface: race?.surface ?? 'Chưa cập nhật',
    category: race?.category ?? 'Open',
    minHorses: Number(race?.minParticipants ?? 0),
    maxHorses: Number(race?.maxParticipants ?? 0),
    registered: Number(race?.participantCount ?? 0),
    entryFee: Number(race?.entryFee ?? 0),
    checkIn: toTime(scheduledStartAt),
    scheduledStartAt,
    scheduledEndAt,
    status: STATUS_LABELS[race?.status] ?? race?.status ?? 'Nháp',
    statusCode: race?.status,
    refereeId: race?.refereeId == null ? '' : String(race.refereeId),
    refereeName: race?.refereeUsername ?? race?.refereeName ?? '',
    prizes: mapRacePrizes(Array.isArray(race?.prizes) ? race.prizes : []),
    raw: race,
  }
}

function dateTime(date, time) {
  return `${date}T${time || '08:00'}:00`
}

function addOneHourDateTime(date, time = '08:00') {
  if (!date) return dateTime(date, time)

  const [hours = '08', minutes = '00'] = (time || '08:00').split(':')
  const nextHour = Math.min(23, Number(hours) + 1)
  return `${date}T${String(nextHour).padStart(2, '0')}:${String(Number(minutes)).padStart(2, '0')}:00`
}

function racePrizeRequests(race) {
  const legacyPrizeNames = {
    first: { rank: 1, itemName: 'Giải nhất' },
    second: { rank: 2, itemName: 'Giải nhì' },
    third: { rank: 3, itemName: 'Giải ba' },
    bonus: { rank: 4, itemName: 'Thưởng phụ' },
  }
  const rawPrizes = race.prizes || []
  const items = Array.isArray(rawPrizes)
    ? rawPrizes
    : Object.entries(rawPrizes).map(([key, amount], index) => ({
        rank: legacyPrizeNames[key]?.rank ?? index + 1,
        itemName: legacyPrizeNames[key]?.itemName ?? key,
        amount,
      }))

  const prizes = items
    .map((item, index) => ({
      rank: Number(item.rank || index + 1),
      amount: Math.max(0, Number(item.amount ?? 0)),
      itemName: String(item.itemName || item.label || `Giải ${index + 1}`),
    }))
    .filter((item) => item.itemName.trim() && item.rank > 0)
    .sort((firstPrize, secondPrize) => firstPrize.rank - secondPrize.rank)

  return prizes.length ? prizes : [{ rank: 1, amount: 0, itemName: 'Giải nhất' }]
}

function raceRequest(race) {
  const date = race.date || new Date().toISOString().slice(0, 10)
  const time = race.time || '08:00'
  const endTime = race.endTime || ''
  const minParticipants = Math.max(1, Number(race.minHorses || 1))
  const maxParticipants = Math.max(minParticipants, Number(race.maxHorses || minParticipants))

  return {
    name: race.name,
    distance: race.distance || '1000m',
    venueId: race.venueId ? Number(race.venueId) : null,
    scheduledStartAt: dateTime(date, time),
    scheduledEndAt: endTime ? dateTime(date, endTime) : addOneHourDateTime(date, time),
    minParticipants,
    maxParticipants,
    entryFee: Math.max(0, Number(race.entryFee || 0)),
    refereeId: race.refereeId ?? race.raw?.refereeId ?? null,
    note: race.description || '',
    prizes: racePrizeRequests(race),
  }
}

export function mapTournament(tournament) {
  if (!tournament) return null

  const races = (Array.isArray(tournament.races) ? tournament.races : []).map(mapRace)
  const registrations = sumRegistrations(races)

  return {
    id: String(tournament.id),
    name: tournament.name ?? '',
    description: tournament.description || 'Chưa có mô tả giải đấu.',
    rules: tournament.rules || 'Chưa có luật giải đấu. Bạn có thể bổ sung trong phần cấu hình.',
    status: STATUS_LABELS[tournament.status] ?? tournament.status ?? 'Nháp',
    statusTone: STATUS_TONES[tournament.status] ?? 'gray',
    statusCode: tournament.status,
    location: tournament.location ?? '',
    provinceId: tournament.provinceId == null ? '' : String(tournament.provinceId),
    provinceName: tournament.provinceName ?? '',
    startDate: toDate(tournament.startAt),
    endDate: toDate(tournament.endAt),
    registrationOpenDate: toDate(tournament.registrationOpenAt),
    registrationCloseDate: toDate(tournament.registrationCloseAt),
    checkInDeadlineDate: toDate(tournament.checkInDeadlineAt),
    deadline: toDate(tournament.registrationCloseAt || tournament.checkInDeadlineAt),
    raceCount: Number(tournament.raceCount ?? races.length),
    registrations,
    registeredHorses: registrations,
    minTeams: Number(tournament.minTeams ?? 0),
    maxTeams: Number(tournament.maxTeams ?? 0),
    minHorsesPerOwner: Number(tournament.minHorsesPerOwner ?? 4),
    maxHorsesPerOwner: Number(tournament.maxHorsesPerOwner ?? 10),
    maxHorses: Number(tournament.maxTeams ?? 0) || sumRaceCapacity(races),
    entryFee: firstPositiveEntryFee(races),
    prizePool: sumPrizePool(races),
    banner: normalizeBannerUrl(tournament.bannerUrl),
    races,
    startTime: toTime(tournament.startAt),
    endTime: toTime(tournament.endAt),
    createdAt: tournament.createdAt,
    updatedAt: tournament.updatedAt,
    raw: tournament,
  }
}

export function invalidateTournamentListCache() {
  invalidateCachedRequest('admin:tournaments')
  invalidateCachedRequest('public:tournaments')
  useApiCacheStore.getState().removeCache(ADMIN_JUDGES_PUBLISHED_TOURNAMENTS_CACHE_KEY)
}

async function fetchAdminTournamentRaceCountMap() {
  try {
    const list = await axiosClient
      .get(ENDPOINTS.dashboard.tournamentRegistrations)
      .then(unwrapResponse)

    return (Array.isArray(list) ? list : []).reduce((result, item) => {
      if (item?.tournamentId != null) {
        result[String(item.tournamentId)] = Number(item.raceCount ?? 0)
      }
      return result
    }, {})
  } catch {
    return {}
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

  async updateTournament(id, payload) {
    const tournament = await axiosClient
      .put(ENDPOINTS.tournaments.adminById(id), payload)
      .then(unwrapResponse)

    return { data: mapTournament(tournament), raw: tournament }
  },

  async deleteTournament(id) {
    const result = await axiosClient
      .delete(ENDPOINTS.tournaments.adminById(id))
      .then(unwrapResponse)
    invalidateTournamentListCache()
    return result
  },

  async updateTournamentStatus(id, status) {
    const tournament = await axiosClient
      .put(ENDPOINTS.tournaments.adminStatus(id), null, { params: { status } })
      .then(unwrapResponse)

    invalidateTournamentListCache()
    return { data: mapTournament(tournament), raw: tournament }
  },

  async scheduleTournament(id) {
    const tournament = await axiosClient
      .put(ENDPOINTS.tournaments.adminSchedule(id))
      .then(unwrapResponse)

    invalidateTournamentListCache()
    return { data: mapTournament(tournament), raw: tournament }
  },

  async addTournamentRace(id, race) {
    const tournament = await axiosClient
      .post(ENDPOINTS.tournaments.adminRaces(id), raceRequest(race))
      .then(unwrapResponse)

    return { data: mapTournament(tournament), raw: tournament }
  },

  async updateTournamentRace(id, race) {
    const tournament = await axiosClient
      .put(ENDPOINTS.tournaments.adminRaceById(id), raceRequest(race))
      .then(unwrapResponse)

    return { data: mapTournament(tournament), raw: tournament }
  },

  async deleteTournamentRace(id) {
    const tournament = await axiosClient
      .delete(ENDPOINTS.tournaments.adminRaceById(id))
      .then(unwrapResponse)

    return { data: mapTournament(tournament), raw: tournament }
  },

  async replaceTournamentRaces(id, races) {
    const tournament = await axiosClient
      .put(ENDPOINTS.tournaments.adminRaces(id), races.map(raceRequest))
      .then(unwrapResponse)

    return { data: mapTournament(tournament), raw: tournament }
  },

  async getAdminTournaments(params = {}) {
    const [list, raceCountById] = await Promise.all([
      cachedRequest('admin:tournaments', () =>
        axiosClient.get(ENDPOINTS.tournaments.adminList, { params }).then(unwrapResponse),
      ),
      fetchAdminTournamentRaceCountMap(),
    ])

    return {
      data: (Array.isArray(list) ? list : [])
        .map((summary) =>
          mapTournament({
            ...summary,
            races: [],
            raceCount: raceCountById[String(summary.id)] ?? 0,
          }),
        )
        .filter(Boolean),
    }
  },

  async getAdminTournament(id) {
    const tournament = await axiosClient
      .get(ENDPOINTS.tournaments.adminById(id))
      .then(unwrapResponse)

    const mapped = mapTournament(tournament)
    if (!mapped) throw new Error('Tournament not found')
    return { data: mapped, raw: tournament }
  },

  async getPublicTournaments(params = {}) {
    const list = await cachedRequest('public:tournaments', () =>
      axiosClient.get(ENDPOINTS.tournaments.publicList, { params }).then(unwrapResponse),
    )

    return {
      data: (Array.isArray(list) ? list : []).map(mapTournament).filter(Boolean),
    }
  },

  async getPublicTournament(id) {
    const tournament = await axiosClient
      .get(ENDPOINTS.tournaments.publicById(id))
      .then(unwrapResponse)

    const mapped = mapTournament(tournament)
    if (!mapped) throw new Error('Tournament not found')
    return { data: mapped, raw: tournament }
  },
}
