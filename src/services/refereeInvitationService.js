import { refereeService } from '@/services/refereeService'
import { formatRaceTime } from '@/utils/refereeRaceUtils'

export const REFEREE_INVITATIONS_STORAGE_KEY = 'referee:invitations'
export const REFEREE_INVITATION_RESPONSES_KEY = 'referee:invitation-responses'
export const REFEREE_INVITATIONS_UPDATED_EVENT = 'referee-invitations-updated'

const STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  CANCELLED: 'CANCELLED',
}

const STATUS_SORT = { PENDING: 0, ACCEPTED: 1, DECLINED: 2, CANCELLED: 3 }

/* -------------------------------------------------------------------------- */
/* Phía trọng tài: lời mời lấy từ BE /referee/invitations                     */
/* -------------------------------------------------------------------------- */

let cachedRefereeInvitations = []
let cachedRefereeRaces = []

function mapApiInvitationStatus(status) {
  const code = String(status ?? '').toUpperCase()
  if (code === 'ACCEPTED') return STATUS.ACCEPTED
  if (code === 'REJECTED') return STATUS.DECLINED
  if (code === 'CANCELLED') return STATUS.CANCELLED
  return STATUS.PENDING
}

function mapApiInvitation(item) {
  return {
    id: String(item.id),
    raceId: String(item.raceId ?? ''),
    tournamentId: item.tournamentId != null ? String(item.tournamentId) : '',
    tournamentName: item.tournamentName?.trim() || 'Giải đấu',
    tournamentLocation: item.venueAddress?.trim() || item.venueName?.trim() || '',
    raceName: item.raceName?.trim() || 'Cuộc đua',
    raceDate: item.raceScheduledStartAt ?? '',
    raceTime: item.raceScheduledStartAt ? formatRaceTime(item.raceScheduledStartAt) : '',
    message: item.message ?? '',
    status: mapApiInvitationStatus(item.status),
    salaryAmount: item.salaryAmount,
    invitedAt: item.createdAt ?? null,
    respondedAt: item.respondedAt ?? item.cancelledAt ?? null,
    raw: item,
  }
}

export async function loadRefereeInvitationsFromApi() {
  try {
    const list = await refereeService.getRefereeInvitations()
    cachedRefereeInvitations = (Array.isArray(list) ? list : []).map(mapApiInvitation)
  } catch {
    cachedRefereeInvitations = []
  }
  return cachedRefereeInvitations
}

function notifyInvitationsUpdated() {
  window.dispatchEvent(new CustomEvent(REFEREE_INVITATIONS_UPDATED_EVENT))
}

/** Tải lời mời từ BE. Phát event khi `notify: true`. */
export async function fetchRefereeInvitations({ notify = false } = {}) {
  await loadRefereeInvitationsFromApi()
  if (notify) notifyInvitationsUpdated()
  return cachedRefereeInvitations
}

export function getInvitationsForReferee(user) {
  if (!user) return []
  return [...cachedRefereeInvitations].sort((a, b) => {
    const orderA = STATUS_SORT[a.status] ?? 9
    const orderB = STATUS_SORT[b.status] ?? 9
    if (orderA !== orderB) return orderA - orderB
    return String(b.invitedAt).localeCompare(String(a.invitedAt))
  })
}

export function getPendingInvitationCountForReferee(user) {
  return getInvitationsForReferee(user).filter((item) => item.status === STATUS.PENDING).length
}

export async function respondToInvitation(invitationId, user, nextStatus, note = '') {
  if (![STATUS.ACCEPTED, STATUS.DECLINED].includes(nextStatus)) return null
  if (!user || invitationId == null) return null

  const id = Number(invitationId)
  if (!Number.isFinite(id)) return null

  if (nextStatus === STATUS.ACCEPTED) {
    await refereeService.acceptRefereeInvitation(id, note)
  } else {
    await refereeService.rejectRefereeInvitation(id, note)
  }

  await loadRefereeInvitationsFromApi()
  notifyInvitationsUpdated()
  return cachedRefereeInvitations.find((item) => String(item.id) === String(id)) ?? {
    id: String(id),
    status: nextStatus,
  }
}

export async function loadAssignedRacesFromApi() {
  try {
    const races = await refereeService.getAssignedRaces()
    cachedRefereeRaces = Array.isArray(races) ? races : []
  } catch {
    cachedRefereeRaces = []
  }
  return cachedRefereeRaces
}

/** BE chỉ trả cuộc đua đã được gán sau khi trọng tài chấp nhận lời mời. */
export function filterRacesForRefereeOperation(races) {
  return Array.isArray(races) ? races : []
}

/* -------------------------------------------------------------------------- */
/* Phía admin: lời mời lấy từ BE /admin/referee-invitations                   */
/* -------------------------------------------------------------------------- */

let cachedAdminInvitations = []
let adminInvitationsLoaded = false

function mapAdminApiInvitation(item) {
  return {
    id: String(item.id),
    tournamentId: item.tournamentId != null ? String(item.tournamentId) : '',
    tournamentName: item.tournamentName ?? '',
    tournamentLocation: item.venueAddress?.trim() || item.venueName?.trim() || '',
    raceId: String(item.raceId ?? ''),
    raceName: item.raceName ?? '',
    raceDate: item.raceScheduledStartAt ?? '',
    raceTime: item.raceScheduledStartAt ? formatRaceTime(item.raceScheduledStartAt) : '',
    refereeId: String(item.refereeId ?? ''),
    refereeEmail: '',
    refereeName: item.refereeUsername ?? '',
    message: item.message ?? '',
    status: mapApiInvitationStatus(item.status),
    invitedAt: item.createdAt ?? null,
    respondedAt: item.respondedAt ?? item.cancelledAt ?? null,
    raw: item,
  }
}

export async function loadAdminInvitationsFromApi() {
  try {
    const list = await refereeService.getAdminInvitations()
    cachedAdminInvitations = (Array.isArray(list) ? list : []).map(mapAdminApiInvitation)
    adminInvitationsLoaded = true
  } catch {
    cachedAdminInvitations = []
    adminInvitationsLoaded = false
  }
  return cachedAdminInvitations
}

/** Tải lời mời admin từ BE. Phát event khi `notify: true`. */
export async function fetchAdminInvitations({ notify = false } = {}) {
  await loadAdminInvitationsFromApi()
  if (notify) notifyInvitationsUpdated()
  return cachedAdminInvitations
}

function getAdminInvitationsForRace(raceId) {
  return cachedAdminInvitations
    .filter((item) => String(item.raceId) === String(raceId))
    .sort((a, b) => String(b.invitedAt).localeCompare(String(a.invitedAt)))
}

function getLatestAdminInvitationForReferee(raceId, refereeId) {
  const key = invitationKey(raceId, refereeId)
  const matches = cachedAdminInvitations
    .filter((item) => invitationKey(item.raceId, item.refereeId) === key)
    .sort((a, b) => String(b.invitedAt).localeCompare(String(a.invitedAt)))
  return matches[0] ?? null
}

function summarizeAdminInvitationsForRace(raceId) {
  const invitations = getAdminInvitationsForRace(raceId)
  const latestByReferee = new Map()

  invitations.forEach((item) => {
    const existing = latestByReferee.get(item.refereeId)
    if (!existing || String(item.invitedAt) > String(existing.invitedAt)) {
      latestByReferee.set(item.refereeId, item)
    }
  })

  const values = [...latestByReferee.values()]
  return {
    pending: values.filter((item) => item.status === STATUS.PENDING).length,
    accepted: values.filter((item) => item.status === STATUS.ACCEPTED).length,
    declined: values.filter((item) => item.status === STATUS.DECLINED).length,
    acceptedReferee: values.find((item) => item.status === STATUS.ACCEPTED) ?? null,
    pendingReferees: values.filter((item) => item.status === STATUS.PENDING),
  }
}

/* -------------------------------------------------------------------------- */
/* localStorage — dự phòng khi chưa tải được API                              */
/* -------------------------------------------------------------------------- */

function readStore() {
  try {
    const raw = localStorage.getItem(REFEREE_INVITATIONS_STORAGE_KEY)
    if (!raw) return { invitations: [] }
    const parsed = JSON.parse(raw)
    return { invitations: Array.isArray(parsed?.invitations) ? parsed.invitations : [] }
  } catch {
    return { invitations: [] }
  }
}

function writeStore(store) {
  localStorage.setItem(REFEREE_INVITATIONS_STORAGE_KEY, JSON.stringify(store))
  window.dispatchEvent(new CustomEvent(REFEREE_INVITATIONS_UPDATED_EVENT))
}

function invitationKey(raceId, refereeId) {
  return `${raceId}:${refereeId}`
}

function mapInvitation(item) {
  return {
    id: item.id,
    tournamentId: item.tournamentId,
    tournamentName: item.tournamentName ?? '',
    tournamentLocation: item.tournamentLocation ?? '',
    raceId: item.raceId,
    raceName: item.raceName ?? '',
    raceDate: item.raceDate ?? '',
    raceTime: item.raceTime ?? '',
    refereeId: String(item.refereeId ?? ''),
    refereeEmail: item.refereeEmail ?? '',
    refereeName: item.refereeName ?? '',
    message: item.message ?? '',
    status: item.status ?? STATUS.PENDING,
    invitedAt: item.invitedAt ?? null,
    respondedAt: item.respondedAt ?? null,
  }
}

export function getInvitationsForRace(raceId) {
  if (adminInvitationsLoaded) return getAdminInvitationsForRace(raceId)

  return readStore()
    .invitations.map(mapInvitation)
    .filter((item) => String(item.raceId) === String(raceId))
    .sort((a, b) => String(b.invitedAt).localeCompare(String(a.invitedAt)))
}

export function hasPendingInvitation(raceId, refereeId) {
  const latest = getLatestInvitationForReferee(raceId, refereeId)
  return latest?.status === STATUS.PENDING
}

export function getLatestInvitationForReferee(raceId, refereeId) {
  if (adminInvitationsLoaded) {
    return getLatestAdminInvitationForReferee(raceId, refereeId)
  }

  const key = invitationKey(raceId, refereeId)
  const matches = readStore()
    .invitations.filter((item) => invitationKey(item.raceId, item.refereeId) === key)
    .map(mapInvitation)
    .sort((a, b) => String(b.invitedAt).localeCompare(String(a.invitedAt)))

  return matches[0] ?? null
}

export function getInvitationSummaryForRace(raceId) {
  if (adminInvitationsLoaded) {
    return summarizeAdminInvitationsForRace(raceId)
  }

  const invitations = readStore()
    .invitations.map(mapInvitation)
    .filter((item) => String(item.raceId) === String(raceId))
  const latestByReferee = new Map()

  invitations.forEach((item) => {
    const existing = latestByReferee.get(item.refereeId)
    if (!existing || String(item.invitedAt) > String(existing.invitedAt)) {
      latestByReferee.set(item.refereeId, item)
    }
  })

  const values = [...latestByReferee.values()]
  return {
    pending: values.filter((item) => item.status === STATUS.PENDING).length,
    accepted: values.filter((item) => item.status === STATUS.ACCEPTED).length,
    declined: values.filter((item) => item.status === STATUS.DECLINED).length,
    acceptedReferee: values.find((item) => item.status === STATUS.ACCEPTED) ?? null,
    pendingReferees: values.filter((item) => item.status === STATUS.PENDING),
  }
}

export function sendRefereeInvitation({ tournament, race, referee, message = '' }) {
  if (!tournament?.id || !race?.id || !referee?.id) return null

  const store = readStore()
  const key = invitationKey(race.id, referee.id)
  const existing = store.invitations.find(
    (item) => invitationKey(item.raceId, item.refereeId) === key && item.status === STATUS.PENDING,
  )
  if (existing) return mapInvitation(existing)

  const declinedIndex = store.invitations.findIndex(
    (item) => invitationKey(item.raceId, item.refereeId) === key && item.status === STATUS.DECLINED,
  )
  if (declinedIndex >= 0) {
    store.invitations[declinedIndex] = {
      ...store.invitations[declinedIndex],
      message: String(message ?? '').trim(),
      status: STATUS.PENDING,
      invitedAt: new Date().toISOString(),
      respondedAt: null,
    }
    writeStore(store)
    return mapInvitation(store.invitations[declinedIndex])
  }

  const invitation = {
    id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    tournamentId: String(tournament.id),
    tournamentName: tournament.name ?? '',
    tournamentLocation: tournament.location ?? '',
    raceId: String(race.id),
    raceName: race.name ?? '',
    raceDate: race.date ?? '',
    raceTime: race.time ?? '',
    refereeId: String(referee.id),
    refereeEmail: referee.email ?? '',
    refereeName: referee.name ?? '',
    message: String(message ?? '').trim(),
    status: STATUS.PENDING,
    invitedAt: new Date().toISOString(),
    respondedAt: null,
  }

  store.invitations.unshift(invitation)
  writeStore(store)
  return mapInvitation(invitation)
}

export function invitationStatusLabel(status) {
  if (status === STATUS.ACCEPTED) return 'Đã chấp nhận'
  if (status === STATUS.DECLINED) return 'Đã từ chối'
  if (status === STATUS.CANCELLED) return 'Đã hủy'
  return 'Chờ phản hồi'
}

export function invitationStatusTone(status) {
  if (status === STATUS.ACCEPTED) return 'green'
  if (status === STATUS.DECLINED || status === STATUS.CANCELLED) return 'gray'
  return 'gold'
}

export { STATUS as REFEREE_INVITATION_STATUS }
