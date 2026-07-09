import { formatRaceTime } from '@/utils/jockeyViewUtils'
import { ACTIVE_RACE_REGISTRATION_STATUSES } from '@/services/raceRegistrationService'
import { tournamentService } from '@/services/tournamentService'

export function resolveRegistrationScheduleAt(registration) {
  return (
    registration?.raceScheduledAt ||
    registration?.tournamentStartDate ||
    registration?.raw?.raceScheduledAt ||
    null
  )
}

export async function enrichOwnerRegistrations(registrations = []) {
  const list = Array.isArray(registrations) ? [...registrations] : []
  const needsSchedule = list.filter(
    (item) => !resolveRegistrationScheduleAt(item) && item.tournamentId && item.raceId,
  )

  if (!needsSchedule.length) return list

  const tournamentIds = [...new Set(needsSchedule.map((item) => String(item.tournamentId)))]
  const tournamentMap = {}

  await Promise.all(
    tournamentIds.map(async (tournamentId) => {
      try {
        const response = await tournamentService.getPublicTournament(tournamentId)
        if (response?.data) tournamentMap[tournamentId] = response.data
      } catch {
        return
      }
    }),
  )

  return list.map((item) => {
    if (resolveRegistrationScheduleAt(item)) return item

    const tournament = tournamentMap[String(item.tournamentId)]
    const race = tournament?.races?.find(
      (raceItem) => String(raceItem.id) === String(item.raceId),
    )
    if (!race?.scheduledStartAt) return item

    return {
      ...item,
      raceScheduledAt: race.scheduledStartAt,
      raceNumber: item.raceNumber ?? race.raceNumber ?? null,
      raceName: item.raceName || race.name || '',
      tournamentName: item.tournamentName || tournament?.name || '',
    }
  })
}

export function buildUpcomingRegistrations(registrations = [], limit = 5) {
  const now = Date.now()

  return [...registrations]
    .filter((item) => ACTIVE_RACE_REGISTRATION_STATUSES.includes(item.statusCode))
    .sort((a, b) => {
      const aTime = resolveRegistrationScheduleAt(a)
        ? new Date(resolveRegistrationScheduleAt(a)).getTime()
        : Number.MAX_SAFE_INTEGER
      const bTime = resolveRegistrationScheduleAt(b)
        ? new Date(resolveRegistrationScheduleAt(b)).getTime()
        : Number.MAX_SAFE_INTEGER
      const aFuture = aTime >= now ? 0 : 1
      const bFuture = bTime >= now ? 0 : 1
      if (aFuture !== bFuture) return aFuture - bFuture
      return aTime - bTime
    })
    .slice(0, limit)
    .map((item) => {
      const scheduleAt = resolveRegistrationScheduleAt(item)
      return {
        id: item.id,
        raceTime: formatRaceTime(scheduleAt),
        raceNo: item.raceName || (item.raceNumber ? `Race R${item.raceNumber}` : 'Race'),
        tournament: item.tournamentName || `Giải #${item.tournamentId ?? '—'}`,
        status: item.status,
        statusTone: item.statusTone,
        horse: item.horseName || '—',
        jockey: item.jockeyUsername || null,
        raceDate: scheduleAt || item.createdAt,
        checkInStatus: item.checkInStatus || 'PENDING',
      }
    })
}

export function countActiveTournaments(registrations = []) {
  const ids = new Set()
  registrations.forEach((item) => {
    if (!ACTIVE_RACE_REGISTRATION_STATUSES.includes(item.statusCode)) return
    if (item.tournamentId) ids.add(String(item.tournamentId))
  })
  return ids.size
}

export function countRegistrationCheckIn(registrations = []) {
  const todayKey = new Date().toDateString()
  const todayRegs = registrations.filter((item) => {
    if (!ACTIVE_RACE_REGISTRATION_STATUSES.includes(item.statusCode)) return false
    const scheduleAt = resolveRegistrationScheduleAt(item)
    if (!scheduleAt) return false
    return new Date(scheduleAt).toDateString() === todayKey
  })

  if (todayRegs.length) {
    const checkedIn = todayRegs.filter((item) => item.checkInStatus === 'CHECKED_IN').length
    return { checkedIn, total: todayRegs.length, scope: 'today' }
  }

  const withRace = registrations.filter((item) => item.raceId)
  const checkedIn = withRace.filter((item) => item.checkInStatus === 'CHECKED_IN').length
  return { checkedIn, total: withRace.length, scope: 'all' }
}
