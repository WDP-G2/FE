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
  ONGOING: 'Đang diễn ra',
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

export function getRefereeRaceTabBucket(race) {
  const raceStatus = normalizeRaceStatusCode(race?.status)
  if (raceStatus === 'RESULT_CONFIRMED') return 'completed'
  if (raceStatus === 'ONGOING') return 'ongoing'
  if (raceStatus === 'CANCELLED') return 'cancelled'
  return 'upcoming'
}

/** Race đã kết thúc / đã chốt kết quả — dùng cho trang Lịch sử */
export function isRefereeRaceHistory(race) {
  const raceStatus = normalizeRaceStatusCode(race?.status)
  return raceStatus === 'RESULT_CONFIRMED'
}

export function pickWinnerFromRaceResults(results = []) {
  const list = Array.isArray(results) ? results : []
  const winner =
    list.find((row) => Number(row?.rank) === 1 && String(row?.status ?? '').toUpperCase() === 'FINISHED') ||
    list.find((row) => Number(row?.rank) === 1)
  if (!winner) return '--'
  return winner.horseName?.trim() || winner.jockeyUsername?.trim() || '--'
}

export function sumRacePrizeAmount(results = []) {
  return (Array.isArray(results) ? results : []).reduce(
    (sum, row) => sum + Number(row?.prizeAmount ?? row?.ownerPrizeAmount ?? 0),
    0,
  )
}

export function getRefereeRaceDisplayLabel(race) {
  const raceStatus = normalizeRaceStatusCode(race?.status)
  if (raceStatus === 'RESULT_CONFIRMED') return 'Đã kết thúc'
  if (raceStatus === 'ONGOING') return 'Đang diễn ra'
  if (raceStatus === 'SCHEDULED') return 'Sắp diễn ra'
  if (raceStatus === 'CANCELLED') return 'Đã hủy'
  return raceStatusLabel(raceStatus)
}

export function getRefereeRaceStatusTone(race) {
  const bucket = getRefereeRaceTabBucket(race)
  if (bucket === 'ongoing') return 'green'
  if (bucket === 'completed') return 'purple'
  if (bucket === 'cancelled') return 'gray'
  return 'blue'
}

/** Chuẩn hóa mã trạng thái cuộc đua từ API (string/object/nhãn tiếng Việt) */
const RACE_STATUS_ALIASES = {
  'ĐANG DIỄN RA': 'ONGOING',
  'ĐANG ĐUA': 'ONGOING',
  'ĐANG CHẠY': 'ONGOING',
  'SẮP DIỄN RA': 'SCHEDULED',
  'ĐÃ LÊN LỊCH': 'SCHEDULED',
  'ĐÃ CHỐT KẾT QUẢ': 'RESULT_CONFIRMED',
  'ĐÃ HỦY': 'CANCELLED',
}

const TOURNAMENT_STATUS_ALIASES = {
  'ĐANG DIỄN RA': 'ONGOING',
  'ĐÃ KẾT THÚC': 'COMPLETED',
  'ĐÃ LÊN LỊCH': 'SCHEDULED',
  'ĐÃ CÔNG BỐ': 'PUBLISHED',
  'ĐANG MỞ ĐĂNG KÝ': 'OPEN_REGISTRATION',
  'ĐÃ ĐÓNG ĐĂNG KÝ': 'REGISTRATION_CLOSED',
}

export function normalizeRaceStatusCode(status) {
  if (!status) return ''
  if (typeof status === 'string') {
    const upper = status.trim().toUpperCase()
    if (RACE_STATUS_ALIASES[upper]) return RACE_STATUS_ALIASES[upper]
    return upper
  }
  if (typeof status === 'object') {
    return normalizeRaceStatusCode(status.code ?? status.name ?? status.status)
  }
  return String(status).trim().toUpperCase()
}

export function normalizeTournamentStatusCode(status) {
  if (!status) return ''
  if (typeof status === 'string') {
    const upper = status.trim().toUpperCase()
    if (TOURNAMENT_STATUS_ALIASES[upper]) return TOURNAMENT_STATUS_ALIASES[upper]
    return upper
  }
  if (typeof status === 'object') {
    return normalizeTournamentStatusCode(status.code ?? status.name ?? status.status)
  }
  return String(status).trim().toUpperCase()
}

/** Sau khi giải bắt đầu, quyền nhập kết quả chỉ còn phụ thuộc trạng thái riêng của race. */
export function canRefereeEditRaceResults(raceStatus) {
  return normalizeRaceStatusCode(raceStatus) === 'ONGOING'
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
  if (status === 'CHECKED_IN' || status === 'FINISHED' || status === 'DNF' || status === 'DISQUALIFIED') {
    return 'green'
  }
  if (status === 'REGISTERED') return 'gold'
  if (status === 'ABSENT') return 'gray'
  return 'gray'
}

/** Nhãn check-in — không hiển thị trạng thái kết quả (Hoàn thành, Loại...) */
export function checkInDisplayLabel(status) {
  if (status === 'CHECKED_IN' || status === 'FINISHED' || status === 'DNF' || status === 'DISQUALIFIED') {
    return 'Có mặt'
  }
  if (status === 'ABSENT') return 'Vắng mặt'
  if (status === 'REGISTERED') return 'Chờ'
  return 'Chờ'
}

export function needsRefereeStartRace(raceStatus, tournamentStatus) {
  const tournament = normalizeTournamentStatusCode(tournamentStatus)
  const race = normalizeRaceStatusCode(raceStatus)
  return tournament === 'ONGOING' && race === 'SCHEDULED'
}

export function canRefereeCheckIn(raceStatus) {
  return normalizeRaceStatusCode(raceStatus) === 'SCHEDULED'
}

export function getRefereeCheckInBlockedMessage(raceStatus, statusLabel) {
  if (canRefereeCheckIn(raceStatus)) return ''
  const race = normalizeRaceStatusCode(raceStatus)
  const label = statusLabel || raceStatusLabel(race) || 'hiện tại'

  if (race === 'OPEN_REGISTRATION' || race === 'PUBLISHED') {
    return `Cuộc đua đang ở trạng thái "${label}". Admin cần đóng đăng ký giải, rồi lên lịch giải đấu — sau đó trọng tài mới check-in được.`
  }

  if (race === 'REGISTRATION_CLOSED') {
    return `Cuộc đua đang ở trạng thái "${label}". Admin cần bấm "Lên lịch giải đấu" (tab Cài đặt giải) — sau đó trọng tài mới check-in được.`
  }

  if (race === 'DRAFT') {
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

export function isRaceUpcoming(scheduledStartAt) {
  const d = parseDate(scheduledStartAt)
  if (!d) return false
  return d.getTime() >= Date.now()
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

export async function buildTournamentStatusMap(tournamentIds = []) {
  const wanted = new Set(tournamentIds.filter(Boolean).map((id) => String(id)))
  if (!wanted.size) return new Map()

  const { tournamentService } = await import('@/services/tournamentService')
  const statusById = new Map()

  await Promise.all(
    [...wanted].map(async (id) => {
      try {
        const { data, raw } = await tournamentService.getPublicTournament(id)
        statusById.set(
          id,
          normalizeTournamentStatusCode(raw?.status ?? data?.statusCode ?? data?.status),
        )
      } catch {
        // giải không public hoặc không tìm thấy
      }
    }),
  )

  return statusById
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

export function mapRaceFromApi(raw, index = 0, { tournamentStatus = '' } = {}) {
  const participantCount = Number(raw?.participantCount ?? 0)
  const checkedInCount = Number(raw?.checkedInCount ?? 0)
  const tournamentName = raw?.tournamentName?.trim()
  const raceCore = {
    id: raw?.id,
    status: normalizeRaceStatusCode(raw?.status),
    tournamentStatus: normalizeTournamentStatusCode(tournamentStatus || raw?.tournamentStatus),
  }
  return {
    id: raw?.id,
    raw,
    tournamentId: raw?.tournamentId,
    tournamentName: tournamentName || 'Chưa có tên giải',
    tournamentStatus: raceCore.tournamentStatus,
    no: raw?.raceNumber || raw?.id || index + 1,
    name: raw?.name || '--',
    date: formatRaceDate(raw?.scheduledStartAt),
    time: formatRaceTime(raw?.scheduledStartAt),
    scheduledStartAt: raw?.scheduledStartAt,
    track: raw?.venueName || raw?.venueAddress || 'Sân vận động',
    distance: raw?.distance || '--',
    totalHorses: participantCount,
    participantCount,
    status: raceCore.status,
    statusLabel: getRefereeRaceDisplayLabel(raceCore),
    tabBucket: getRefereeRaceTabBucket(raceCore),
    checkedInDisplay: checkedInCount,
    checkedInCount,
    winnerDisplay: raw?.winnerName || raw?.winnerDisplay || '--',
    prizeDisplay: 'Xem chi tiết',
    resultFinalizedAt: raw?.resultFinalizedAt || null,
    resultFinalizedBy: raw?.resultFinalizedBy || null,
    totalPrizeAmount: Number(raw?.totalPrizeAmount ?? 0),
    prizes: Array.isArray(raw?.prizes) ? raw.prizes : [],
  }
}

export function mapParticipantFromApi(raw, index = 0) {
  return {
    id: raw?.id,
    participantId: raw?.participantId ?? raw?.id,
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

/** Parse race time → milliseconds. Supports MM:SS:CC, mm:ss.cs, mm:ss */
export function parseFinishTimeToMillis(value) {
  const text = String(value ?? '').trim()
  if (!text) return 0

  const colonTriple = text.match(/^(\d{2}):(\d{2}):(\d{2})$/)
  if (colonTriple) {
    const minutes = Number(colonTriple[1])
    const seconds = Number(colonTriple[2])
    const centis = Number(colonTriple[3])
    if (seconds > 59 || centis > 99) return 0
    return minutes * 60_000 + seconds * 1_000 + centis * 10
  }

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

export function sanitizeRaceTimeInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 6)
  if (!digits) return ''
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`
}

export function formatRaceTimeOnBlur(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) return ''
  const padded = digits.padEnd(6, '0').slice(0, 6)
  return `${padded.slice(0, 2)}:${padded.slice(2, 4)}:${padded.slice(4, 6)}`
}

export function isCompleteRaceTime(value) {
  return /^\d{2}:\d{2}:\d{2}$/.test(String(value ?? '').trim())
}

export function isValidRaceTime(value) {
  const text = String(value ?? '').trim()
  if (!isCompleteRaceTime(text)) return false
  const [minutes, seconds, centis] = text.split(':').map((part) => Number(part))
  if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || !Number.isFinite(centis)) {
    return false
  }
  return minutes >= 0 && seconds >= 0 && seconds <= 59 && centis >= 0 && centis <= 99
}

export function recompactFinishedRanks(rows) {
  return assignRanksByFinishTime(rows)
}

/** Xếp hạng theo thời gian về đích (nhỏ hơn = hạng cao hơn) */
export function assignRanksByFinishTime(rows) {
  const list = Array.isArray(rows) ? [...rows] : []
  const finished = list.filter((row) => !row.dq)
  const withValidTime = finished.filter(
    (row) => isCompleteRaceTime(row.time) && isValidRaceTime(row.time),
  )
  const withoutValidTime = finished.filter(
    (row) => !isCompleteRaceTime(row.time) || !isValidRaceTime(row.time),
  )
  const disqualified = list.filter((row) => row.dq)

  withValidTime.sort(
    (first, second) => parseFinishTimeToMillis(first.time) - parseFinishTimeToMillis(second.time),
  )

  let rank = 1
  const rankedValid = withValidTime.map((row) => {
    const next = { ...row, position: rank }
    rank += 1
    return next
  })
  const rankedPending = withoutValidTime.map((row) => ({ ...row, position: rank++ }))
  const rankedDq = disqualified.map((row) => ({ ...row, position: 0 }))

  return sortResultRowsForDisplay([...rankedValid, ...rankedPending, ...rankedDq])
}

/** Hiển thị: hạng 1 → 2 → 3…, ngựa loại (DQ) ở cuối */
export function sortResultRowsForDisplay(rows) {
  const list = Array.isArray(rows) ? [...rows] : []
  const active = list
    .filter((row) => !row.dq)
    .sort((first, second) => {
      const rankDiff = (Number(first.position) || 999) - (Number(second.position) || 999)
      if (rankDiff !== 0) return rankDiff
      return parseFinishTimeToMillis(first.time) - parseFinishTimeToMillis(second.time)
    })
  const disqualified = list.filter((row) => row.dq)
  return [...active, ...disqualified]
}

export function isParticipantCheckedIn(status) {
  return ['CHECKED_IN', 'FINISHED', 'DNF', 'DISQUALIFIED'].includes(String(status ?? '').toUpperCase())
}

export function countCheckedInParticipants(participants = []) {
  const list = Array.isArray(participants) ? participants : []
  return list.filter((item) => isParticipantCheckedIn(item?.status)).length
}

/** Đếm có mặt / chờ / vắng mặt — dùng cho mọi giải được giao */
export function summarizeParticipantCheckIn(participants = []) {
  const list = Array.isArray(participants) ? participants : []
  let presentCount = 0
  let pendingCount = 0
  let absentCount = 0

  for (const item of list) {
    const status = String(item?.status ?? '').toUpperCase()
    if (status === 'REGISTERED') {
      pendingCount += 1
    } else if (status === 'ABSENT') {
      absentCount += 1
    } else if (
      status === 'CHECKED_IN' ||
      status === 'FINISHED' ||
      status === 'DNF' ||
      status === 'DISQUALIFIED'
    ) {
      presentCount += 1
    }
  }

  return {
    presentCount,
    pendingCount,
    absentCount,
    total: list.length,
    checkedInCount: list.filter((item) => String(item?.status ?? '').toUpperCase() === 'CHECKED_IN').length,
  }
}

export function isValidParticipantId(value) {
  const id = String(value ?? '').trim()
  return id.length > 0
}

/** Payload gửi BE — ngựa loại chỉ gửi lý do, không có rank */
export function buildRaceFinalizePayload(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => {
    const participantId = String(row.participantId ?? row.id ?? '').trim()
    if (row.dq) {
      const note = String(row.dqReason ?? '').trim() || undefined
      return {
        participantId,
        status: 'DISQUALIFIED',
        finishTimeMillis: 0,
        note,
      }
    }
    return {
      participantId,
      rank: Number(row.position),
      finishTimeMillis: parseFinishTimeToMillis(row.time),
      status: 'FINISHED',
    }
  })
}

function defaultResultRow(horse, index, startPositions) {
  return {
    id: horse.id,
    participantId: horse.participantId,
    horse: horse.horse,
    owner: horse.owner,
    jockey: horse.jockey,
    startPos: getAssignedGate(horse, startPositions),
    position: index + 1,
    time: '',
    dqReason: '',
    dq: false,
  }
}

export function buildResultRowsFromHorses(
  horses,
  startPositions = {},
  { results = null, draftRows = null } = {},
) {
  const horseList = Array.isArray(horses) ? horses : []
  const safeStartPositions =
    startPositions && typeof startPositions === 'object' && !Array.isArray(startPositions)
      ? startPositions
      : {}

  if (Array.isArray(results) && results.length) {
    const resultByParticipant = new Map(
      results.map((item) => [String(item.participantId), item]),
    )
    return sortResultRowsForDisplay(
      horseList.map((horse, index) => {
        const result = resultByParticipant.get(String(horse.participantId ?? horse.id))
        const startPos = getAssignedGate(horse, safeStartPositions)
        if (!result) return defaultResultRow(horse, index, safeStartPositions)

        const dq = result.status === 'DISQUALIFIED'
        return {
          id: horse.id,
          participantId: horse.participantId ?? result.participantId,
          horse: horse.horse ?? result.horseName,
          owner: horse.owner ?? result.ownerUsername,
          jockey: horse.jockey ?? result.jockeyUsername,
          startPos,
          position: dq ? 0 : (result.rank ?? index + 1),
          time: dq ? '' : formatMillisAsRaceTime(result.finishTimeMillis),
          dqReason: dq ? (result.note ?? '') : '',
          dq,
        }
      }),
    )
  }

  if (Array.isArray(draftRows) && draftRows.length) {
    const draftById = new Map(draftRows.map((row) => [String(row.id), row]))
    return sortResultRowsForDisplay(
      horseList.map((horse, index) => {
        const draft = draftById.get(String(horse.id))
        const startPos = getAssignedGate(horse, safeStartPositions)
        if (!draft) return defaultResultRow(horse, index, safeStartPositions)
        return {
          ...draft,
          participantId: horse.participantId,
          horse: horse.horse,
          owner: horse.owner,
          jockey: horse.jockey,
          startPos,
          dqReason: draft.dqReason ?? draft.penalty ?? '',
        }
      }),
    )
  }

  return horseList.map((horse, index) => defaultResultRow(horse, index, safeStartPositions))
}

export function formatMillisAsRaceTime(ms) {
  const total = Math.max(0, Number(ms) || 0)
  const minutes = Math.floor(total / 60_000)
  const seconds = Math.floor((total % 60_000) / 1_000)
  const centis = Math.floor((total % 1_000) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(centis).padStart(2, '0')}`
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

export function getResultsDraftStorageKey(raceId) {
  return `referee-race-results-draft:${raceId}`
}

export function loadResultsDraft(raceId) {
  if (!raceId) return null
  try {
    const raw = sessionStorage.getItem(getResultsDraftStorageKey(raceId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveResultsDraft(raceId, rows) {
  if (!raceId) return
  sessionStorage.setItem(getResultsDraftStorageKey(raceId), JSON.stringify(rows))
}

export function clearResultsDraft(raceId) {
  if (!raceId) return
  sessionStorage.removeItem(getResultsDraftStorageKey(raceId))
}
