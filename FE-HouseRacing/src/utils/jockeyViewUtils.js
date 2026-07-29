import { formatDisplayDate } from '@/utils/dateFormat'

const RACE_STATUS_META = {
  SCHEDULED: { label: 'Đã lên lịch', tone: 'blue' },
  ONGOING: { label: 'Đang đua', tone: 'gold' },
  COMPLETED: { label: 'Hoàn thành', tone: 'green' },
  RESULT_CONFIRMED: { label: 'Đã chốt kết quả', tone: 'green' },
  CANCELLED: { label: 'Đã hủy', tone: 'red' },
}

export function formatRaceTime(value) {
  if (!value) return '--:--'
  const raw = String(value)
  const match = raw.match(/T(\d{2}:\d{2})/)
  if (match) return match[1]

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export function formatFinishTimeMillis(value) {
  const ms = Number(value)
  if (!ms) return '—'
  const totalSec = ms / 1000
  const min = Math.floor(totalSec / 60)
  const sec = (totalSec % 60).toFixed(2)
  return `${min}:${sec.padStart(5, '0')}`
}

function raceStatusMeta(status) {
  const code = String(status ?? '').toUpperCase()
  return RACE_STATUS_META[code] ?? { label: code || 'Không rõ', tone: 'gray' }
}

export function mapRaceToSchedule(race, invitation) {
  const status = raceStatusMeta(race.status)
  const location = [race.venueName, race.venueAddress].filter(Boolean).join(' · ')

  return {
    id: String(race.id),
    tournament: invitation?.tournamentName || `Giải #${race.tournamentId ?? '—'}`,
    race: race.name || `Race #${race.id}`,
    horse: invitation?.horseName || '—',
    owner: invitation?.ownerUsername || '—',
    date: race.scheduledStartAt,
    time: formatRaceTime(race.scheduledStartAt),
    location: location || '—',
    status: status.label,
    statusTone: status.tone,
    laneNo: '—',
    checkedIn: false,
  }
}

export function buildJockeySchedules(races = [], invitations = []) {
  const inviteByRaceId = new Map(
    invitations
      .filter((item) => item.statusCode === 'ACCEPTED' && item.raceId)
      .map((item) => [String(item.raceId), item]),
  )

  return [...races]
    .map((race) => mapRaceToSchedule(race, inviteByRaceId.get(String(race.id))))
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0
      const bTime = b.date ? new Date(b.date).getTime() : 0
      return aTime - bTime
    })
}

export function buildAssignedHorses(invitations = []) {
  const accepted = invitations.filter((item) => item.statusCode === 'ACCEPTED' && item.horseId)
  const byHorse = new Map()

  accepted.forEach((inv) => {
    byHorse.set(String(inv.horseId), {
      id: String(inv.horseId),
      name: inv.horseName || 'Ngựa',
      breed: '—',
      age: '—',
      weight: '—',
      color: '—',
      health: 'Đang thi đấu',
      healthTone: 'green',
      owner: inv.ownerUsername || `Owner #${inv.ownerId ?? '—'}`,
      tournament: inv.tournamentName || '—',
      lastRace: inv.raceScheduledStartAt,
      notes: inv.message || 'Chưa có ghi chú',
      wins: 0,
      races: 0,
    })
  })

  return [...byHorse.values()]
}

export function mapRaceHistoryRow(item, index) {
  return {
    id: String(item.raceId ?? index),
    tournament: item.tournamentName || '—',
    race: item.raceName || '—',
    horse: item.horseName || '—',
    owner: '—',
    position: item.rank ?? '—',
    finishTime: formatFinishTimeMillis(item.finishTimeMillis),
    prize: 0,
    date: item.finalizedAt || item.scheduledStartAt,
  }
}

export function buildJockeyResults(raceHistory = []) {
  return [...raceHistory]
    .map(mapRaceHistoryRow)
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0
      const bTime = b.date ? new Date(b.date).getTime() : 0
      return bTime - aTime
    })
}

export function parseAchievementLines(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)

  return String(value)
    .split(/\r?\n|[;|]/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function mapRankingEntry(entry, currentUserId) {
  const raceCount = Number(entry.raceCount ?? 0)
  const winCount = Number(entry.winCount ?? 0)
  const winRate = raceCount > 0 ? ((winCount / raceCount) * 100).toFixed(1) : '0.0'

  return {
    rank: entry.rank,
    name: entry.jockeyFullName || entry.jockeyUsername || `Jockey #${entry.jockeyId}`,
    wins: winCount,
    races: raceCount,
    winRate,
    points: Number(entry.totalPrizeAmount ?? 0),
    isMe: currentUserId != null && String(entry.jockeyId) === String(currentUserId),
  }
}

export function getTournamentRelation(tournament, invitations = [], schedules = []) {
  const tournamentName = tournament?.name
  const schedule = schedules.find((item) => item.tournament === tournamentName)
  if (schedule) {
    return {
      label: 'Đã có lịch',
      tone: schedule.statusTone,
      detail: schedule.race,
    }
  }

  const invitation = invitations.find((item) => item.tournamentName === tournamentName)
  if (invitation) {
    return {
      label: 'Có lời mời',
      tone: invitation.statusTone,
      detail: invitation.status,
    }
  }

  return {
    label: 'Theo dõi',
    tone: 'gray',
    detail: 'Chưa có lịch/lời mời',
  }
}

export function formatScheduleDateLabel(value) {
  return formatDisplayDate(value)
}
