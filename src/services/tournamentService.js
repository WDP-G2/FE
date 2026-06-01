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

const STATUS_TONES = {
  DRAFT: 'gray',
  PUBLISHED: 'blue',
  OPEN_REGISTRATION: 'green',
  REGISTRATION_CLOSED: 'gold',
  SCHEDULED: 'blue',
  ONGOING: 'purple',
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

  return {
    id: String(race?.id ?? index + 1),
    no: index + 1,
    name: race?.name ?? `Cuộc đua ${index + 1}`,
    description: race?.note ?? '',
    date: toDate(scheduledStartAt),
    time: toTime(scheduledStartAt),
    distance: race?.distance ?? '',
    track: race?.track ?? 'Chưa cập nhật',
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
    prizes: mapRacePrizes(Array.isArray(race?.prizes) ? race.prizes : []),
    raw: race,
  }
}

function dateTime(date, time) {
  return `${date}T${time || '08:00'}:00`
}

function addOneHourDateTime(date, time = '08:00') {
  if (!date) return dateTime(date, time)

  const [hours = '08', minutes = '00'] = time.split(':')
  const start = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(5, 7)) - 1, Number(date.slice(8, 10)), Number(hours), Number(minutes)))
  start.setUTCHours(start.getUTCHours() + 1)

  return `${start.toISOString().slice(0, 16)}:00`
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
  const minParticipants = Math.max(1, Number(race.minHorses || 1))
  const maxParticipants = Math.max(minParticipants, Number(race.maxHorses || minParticipants))

  return {
    name: race.name,
    distance: race.distance || '1000m',
    scheduledStartAt: dateTime(date, time),
    scheduledEndAt: addOneHourDateTime(date, time),
    minParticipants,
    maxParticipants,
    entryFee: Math.max(0, Number(race.entryFee || 0)),
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
    startDate: toDate(tournament.startAt),
    endDate: toDate(tournament.endAt),
    registrationOpenDate: toDate(tournament.registrationOpenAt),
    registrationCloseDate: toDate(tournament.registrationCloseAt),
    checkInDeadlineDate: toDate(tournament.checkInDeadlineAt),
    deadline: toDate(tournament.registrationCloseAt || tournament.checkInDeadlineAt),
    raceCount: races.length,
    registrations,
    registeredHorses: registrations,
    minTeams: Number(tournament.minTeams ?? 0),
    maxTeams: Number(tournament.maxTeams ?? 0),
    maxHorses: Number(tournament.maxTeams ?? 0) || sumRaceCapacity(races),
    entryFee: firstPositiveEntryFee(races),
    prizePool: sumPrizePool(races),
    banner: tournament.bannerUrl || FALLBACK_BANNER,
    races,
    startTime: toTime(tournament.startAt),
    endTime: toTime(tournament.endAt),
    createdAt: tournament.createdAt,
    updatedAt: tournament.updatedAt,
    raw: tournament,
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

  async replaceTournamentRaces(id, races) {
    const tournament = await axiosClient
      .put(ENDPOINTS.tournaments.adminRaces(id), races.map(raceRequest))
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
    return { data: mapped, raw: tournament }
  },

  async getPublicTournaments(params = {}) {
    const list = await axiosClient
      .get(ENDPOINTS.tournaments.publicList, { params })
      .then(unwrapResponse)

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
