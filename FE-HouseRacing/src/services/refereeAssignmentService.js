const STORAGE_KEY = 'referee:published-assignments'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : { raceAssignments: {} }
  } catch {
    return { raceAssignments: {} }
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  window.dispatchEvent(new CustomEvent('referee-assignments-updated'))
}

function inferRefereeStatus(race) {
  const label = String(race.status ?? '').toLowerCase()
  if (label.includes('kết thúc') || label.includes('finished')) return 'Đã kết thúc'
  if (label.includes('đua') || label.includes('running')) return 'Đang đua'
  if (label.includes('check-in')) return 'Đang check-in'

  const start = new Date(`${race.date}T${race.time || '08:00'}:00`)
  if (!Number.isNaN(start.getTime()) && start.getTime() <= Date.now()) {
    return 'Đang check-in'
  }

  return 'Sắp diễn ra'
}

function buildRefereeRaceSnapshot(tournament, race) {
  const totalHorses = Math.max(
    Number(race.raw?.maxParticipants ?? race.maxHorses ?? race.registered ?? 0),
    1,
  )

  return {
    id: String(race.id),
    tournamentId: String(tournament.id),
    tournamentName: tournament.name,
    no: race.no,
    name: race.name,
    date: race.date,
    time: race.time,
    track:
      race.raw?.venueName ||
      race.venueName ||
      race.raw?.track ||
      race.track ||
      tournament.location ||
      'Chưa cập nhật',
    distance: race.raw?.distance || race.distance || '',
    totalHorses,
    status: inferRefereeStatus(race),
    checkedIn: 0,
    surface: race.raw?.surface || race.surface || 'Cỏ',
  }
}

export function getPublishedAssignmentsForRace(raceId) {
  const entry = readStore().raceAssignments[String(raceId)]
  if (!entry?.assignments?.length) return []

  return entry.assignments.map(({ refereeId, role }) => ({
    refereeId: String(refereeId),
    role,
  }))
}

export function getPublishedAssignmentEntry(raceId) {
  return readStore().raceAssignments[String(raceId)] ?? null
}

export function publishRaceAssignments({ tournament, race, assignments, refereesById }) {
  if (!tournament || !race || !assignments?.length) return null

  const raceSnapshot = buildRefereeRaceSnapshot(tournament, race)
  const enrichedAssignments = assignments.map((assignment) => {
    const referee = refereesById.get(assignment.refereeId)
    return {
      refereeId: String(assignment.refereeId),
      role: assignment.role,
      refereeEmail: referee?.email ?? '',
      refereeName: referee?.name ?? '',
    }
  })

  const store = readStore()
  store.raceAssignments[String(race.id)] = {
    tournamentId: String(tournament.id),
    tournamentName: tournament.name,
    tournamentLocation: tournament.location ?? '',
    race: raceSnapshot,
    assignments: enrichedAssignments,
    publishedAt: new Date().toISOString(),
  }
  writeStore(store)

  return store.raceAssignments[String(race.id)]
}

export function getAssignedRacesForReferee(user) {
  if (!user) return []

  const refereeId = String(user.id ?? user.userId ?? '')
  const normalizedEmail = user.email?.trim().toLowerCase()
  const races = []

  for (const entry of Object.values(readStore().raceAssignments)) {
    const mine = entry.assignments?.find(
      (assignment) =>
        String(assignment.refereeId) === refereeId ||
        (normalizedEmail &&
          assignment.refereeEmail?.trim().toLowerCase() === normalizedEmail),
    )

    if (!mine) continue

    races.push({
      ...entry.race,
      tournamentId: entry.tournamentId,
      tournamentName: entry.tournamentName,
      tournamentLocation: entry.tournamentLocation,
      refereeRole: mine.role,
      assignedAt: entry.publishedAt,
    })
  }

  return races.sort((first, second) => {
    const firstKey = `${first.date}T${first.time}`
    const secondKey = `${second.date}T${second.time}`
    return firstKey.localeCompare(secondKey)
  })
}

export function getAssignedRaceForReferee(user, raceId) {
  return getAssignedRacesForReferee(user).find((race) => String(race.id) === String(raceId))
}
