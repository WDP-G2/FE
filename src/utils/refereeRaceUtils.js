/** Nhãn khi BE chưa trả đủ field cho UI */
export function missingBe(label, detail = '') {
  const base = `[Thiếu BE: ${label}]`
  return detail ? `${base} ${detail}` : base
}

const RACE_STATUS_VI = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã công bố',
  OPEN_REGISTRATION: 'Mở đăng ký',
  REGISTRATION_CLOSED: 'Đóng đăng ký',
  SCHEDULED: 'Sắp diễn ra',
  ONGOING: 'Đang đua',
  RESULT_CONFIRMED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
}

const PARTICIPANT_STATUS_VI = {
  REGISTERED: 'Chờ',
  CHECKED_IN: 'Đã check-in',
  FINISHED: 'Hoàn thành',
  DNF: 'Không hoàn thành',
  DISQUALIFIED: 'Loại',
  ABSENT: 'Vắng mặt',
}

export function raceStatusLabel(status) {
  if (!status) return '--'
  return RACE_STATUS_VI[status] ?? status
}

export function raceTabBucket(status) {
  if (status === 'ONGOING') return 'ongoing'
  if (status === 'RESULT_CONFIRMED') return 'completed'
  if (status === 'CANCELLED') return 'cancelled'
  return 'upcoming'
}

export function raceStatusTone(status) {
  const bucket = raceTabBucket(status)
  if (bucket === 'upcoming') return 'blue'
  if (bucket === 'ongoing') return 'green'
  if (bucket === 'completed') return 'purple'
  if (bucket === 'cancelled') return 'gray'
  return 'gold'
}

export function participantStatusLabel(status) {
  if (!status) return '--'
  return PARTICIPANT_STATUS_VI[status] ?? status
}

export function checkinTone(status) {
  if (status === 'CHECKED_IN') return 'green'
  if (status === 'REGISTERED') return 'gold'
  if (status === 'ABSENT') return 'gray'
  if (status === 'DISQUALIFIED') return 'purple'
  return 'red'
}

export const REFEREE_CHECK_IN_STATUSES = ['CHECKED_IN', 'ABSENT', 'DISQUALIFIED']

export function canRefereeCheckIn(raceStatus) {
  return raceStatus === 'SCHEDULED'
}

export function getRefereeCheckInBlockedMessage(raceStatus, statusLabel) {
  if (canRefereeCheckIn(raceStatus)) return ''
  const label = statusLabel || raceStatusLabel(raceStatus) || 'hiện tại'

  if (raceStatus === 'OPEN_REGISTRATION' || raceStatus === 'PUBLISHED') {
    return `Cuộc đua đang ở trạng thái "${label}". Admin cần đóng đăng ký giải, rồi lên lịch giải đấu — sau đó trọng tài mới check-in được.`
  }

  if (raceStatus === 'REGISTRATION_CLOSED') {
    return `Cuộc đua đang ở trạng thái "${label}". Admin cần bấm "Lên lịch giải đấu" (tab Cài đặt giải) — sau đó trọng tài mới check-in được.`
  }

  if (raceStatus === 'DRAFT') {
    return `Cuộc đua đang ở trạng thái "${label}". Giải cần được công bố, mở/đóng đăng ký và lên lịch trước khi trọng tài check-in.`
  }

  return `Cuộc đua đang ở trạng thái "${label}". Chỉ check-in được khi cuộc đua đã lên lịch (Sắp diễn ra).`
}

export function severityTone(severity) {
  if (severity === 'Cảnh cáo') return 'gold'
  if (severity === 'Phạt nhẹ') return 'gold'
  if (severity === 'Phạt nặng') return 'red'
  return 'purple'
}

function parseDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatRaceDate(value) {
  const d = parseDate(value)
  if (!d) return '--'
  return d.toLocaleDateString('vi-VN')
}

export function formatRaceTime(value) {
  const d = parseDate(value)
  if (!d) return '--'
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export function isRaceToday(scheduledStartAt) {
  const d = parseDate(scheduledStartAt)
  if (!d) return false
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export async function buildTournamentNameMap(tournamentIds = []) {
  const wanted = new Set(
    tournamentIds.filter(Boolean).map((id) => String(id)),
  )
  if (!wanted.size) return new Map()

  const { tournamentService } = await import('@/services/tournamentService')
  const nameById = new Map()

  try {
    const { data } = await tournamentService.getPublicTournaments()
    for (const tournament of data) {
      const id = String(tournament.id)
      if (wanted.has(id) && tournament.name) {
        nameById.set(id, tournament.name)
      }
    }
  } catch {
    // public list unavailable
  }

  const missing = [...wanted].filter((id) => !nameById.has(id))
  await Promise.all(
    missing.map(async (id) => {
      try {
        const { data } = await tournamentService.getPublicTournament(id)
        if (data?.name) nameById.set(id, data.name)
      } catch {
        // tournament not public or not found
      }
    }),
  )

  return nameById
}

export function parseRulesLines(rulesText) {
  const text = String(rulesText || '').trim()
  if (!text) return []

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^\d+\.\s*/, ''))
}

export async function fetchRaceRules(tournamentId) {
  const { tournamentService } = await import('@/services/tournamentService')
  const { fetchDefaultTournamentRules, DEFAULT_TOURNAMENT_RULES } = await import('@/services/systemSettingsService')

  if (tournamentId) {
    try {
      const { data } = await tournamentService.getPublicTournament(tournamentId)
      const tournamentRules = data?.rules?.trim()
      const isPlaceholder = !tournamentRules
        || tournamentRules.startsWith('Chưa có luật giải đấu')
      if (tournamentRules && !isPlaceholder) return tournamentRules
    } catch {
      // fallback to system rules
    }
  }

  try {
    return await fetchDefaultTournamentRules()
  } catch {
    return DEFAULT_TOURNAMENT_RULES
  }
}

export function mapRaceFromApi(raw, index = 0) {
  const participantCount = Number(raw?.participantCount ?? 0)
  const checkedInCount = Number(raw?.checkedInCount ?? 0)
  const tournamentName = raw?.tournamentName?.trim()
  return {
    id: raw?.id,
    raw,
    tournamentId: raw?.tournamentId,
    tournamentName: tournamentName || 'Chưa có tên giải',
    no: raw?.raceNumber || raw?.id || index + 1,
    name: raw?.name || '--',
    date: formatRaceDate(raw?.scheduledStartAt),
    time: formatRaceTime(raw?.scheduledStartAt),
    scheduledStartAt: raw?.scheduledStartAt,
    track: raw?.venueName || raw?.venueAddress || 'Sân vận động',
    distance: raw?.distance || '--',
    totalHorses: participantCount,
    participantCount,
    status: raw?.status,
    statusLabel: raceStatusLabel(raw?.status),
    tabBucket: raceTabBucket(raw?.status),
    checkedInDisplay: checkedInCount,
    checkedInCount,
    winnerDisplay: raw?.winnerDisplay || '--',
    prizeDisplay: 'Xem chi tiết',
    resultFinalizedAt: raw?.resultFinalizedAt,
    prizes: Array.isArray(raw?.prizes) ? raw.prizes : [],
  }
}

export function mapParticipantFromApi(raw, index = 0) {
  return {
    id: raw?.id,
    participantId: raw?.id,
    no: raw?.gateNumber ?? index + 1,
    horse: raw?.horseName ?? missingBe('horseName'),
    owner: raw?.ownerUsername ?? missingBe('ownerUsername'),
    jockey: raw?.jockeyUsername ?? missingBe('jockeyUsername'),
    gateNumber: raw?.gateNumber,
    status: raw?.status ?? 'REGISTERED',
    checkIn: participantStatusLabel(raw?.status),
    note: raw?.checkInNote ?? '',
    raw,
  }
}

/** Parse "mm:ss.cs" (VD: 01:23.45) → milliseconds */
export function parseFinishTimeToMillis(value) {
  const text = String(value ?? '').trim()
  if (!text) return 0

  const full = text.match(/^(\d+):(\d{1,2})\.(\d{1,2})$/)
  if (full) {
    const minutes = Number(full[1])
    const seconds = Number(full[2])
    const centis = Number(full[3])
    return minutes * 60_000 + seconds * 1_000 + centis * 10
  }

  const simple = text.match(/^(\d+):(\d{1,2})$/)
  if (simple) {
    return Number(simple[1]) * 60_000 + Number(simple[2]) * 1_000
  }

  const numeric = Number(text)
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : 0
}

export function formatMillisAsRaceTime(ms) {
  const total = Math.max(0, Number(ms) || 0)
  const minutes = Math.floor(total / 60_000)
  const seconds = Math.floor((total % 60_000) / 1_000)
  const centis = Math.floor((total % 1_000) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`
}

export function participantKey(id) {
  return String(id ?? '')
}

export function getAssignedGate(horse, positions = {}) {
  if (!horse) return 1
  const key = participantKey(horse.id)
  const assigned = positions[key]
  if (assigned != null && Number.isFinite(Number(assigned)) && Number(assigned) > 0) {
    return Number(assigned)
  }
  return Number(horse.gateNumber ?? horse.no ?? 1)
}

export function buildInitialGateMap(horses = []) {
  const map = {}
  horses.forEach((horse, index) => {
    const key = participantKey(horse.id)
    if (!key) return
    map[key] = Number(horse.gateNumber ?? index + 1)
  })
  return map
}

export function randomizeGateMap(horses = []) {
  const count = horses.length
  if (!count) return {}

  const gates = Array.from({ length: count }, (_, index) => index + 1)
  for (let i = gates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[gates[i], gates[j]] = [gates[j], gates[i]]
  }

  const map = {}
  horses.forEach((horse, index) => {
    const key = participantKey(horse.id)
    if (key) map[key] = gates[index]
  })
  return map
}

export function updateGateMap(positions = {}, horseId, nextGate, horses = []) {
  const key = participantKey(horseId)
  const max = horses.length || 1
  const gate = Math.min(max, Math.max(1, Math.floor(Number(nextGate)) || 1))
  const horse = horses.find((item) => participantKey(item.id) === key)
  const previousGate = getAssignedGate(horse ?? { id: horseId }, positions)
  const base = { ...positions, [key]: gate }

  if (previousGate !== gate) {
    const conflict = horses.find(
      (item) =>
        participantKey(item.id) !== key && getAssignedGate(item, positions) === gate,
    )
    if (conflict) {
      base[participantKey(conflict.id)] = previousGate
    }
  }

  return base
}

export function findHorseByGate(horses = [], positions = {}, gate) {
  return horses.find((horse) => getAssignedGate(horse, positions) === gate) ?? null
}
