export const JUDGE_ROLES = [
  'Trọng tài chính',
  'Trọng tài biên',
  'Trọng tài xuất phát',
  'Trọng tài đích',
  'Giám sát doping',
]

const BANNER_A =
  'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
const BANNER_B =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
const BANNER_C =
  'https://images.unsplash.com/photo-1551134084-92ca8eea7cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'

function buildRaces(prefix, count, statusMix) {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-r${i + 1}`,
    no: i + 1,
    name:
      i === count - 1
        ? 'Chung kết'
        : i === count - 2
          ? 'Bán kết'
          : i === count - 3
            ? 'Tứ kết'
            : `Vòng loại ${i + 1}`,
    date: `2026-06-${String(10 + i).padStart(2, '0')}`,
    time: '14:30',
    status: statusMix[i % statusMix.length],
    judges: [],
  }))
}

export const MOCK_JUDGE_TOURNAMENTS = [
  {
    id: 'vietnam-grand-prix-2026',
    name: 'Vietnam Grand Prix 2026',
    banner: BANNER_A,
    location: 'Sân đua Phú Thọ, TP. HCM',
    startDate: '2026-06-10',
    status: 'Đang mở đăng ký',
    races: buildRaces('vgp', 6, ['Mở đăng ký', 'Sắp diễn ra', 'Nháp']),
  },
  {
    id: 'saigon-derby-2026',
    name: 'Saigon Derby 2026',
    banner: BANNER_B,
    location: 'Sân đua Phú Thọ, TP. HCM',
    startDate: '2026-07-15',
    status: 'Đang diễn ra',
    races: buildRaces('sgd', 5, ['Đang đua', 'Đã kết thúc', 'Sắp diễn ra']),
  },
  {
    id: 'hanoi-cup-2025',
    name: 'Hanoi Cup 2025',
    banner: BANNER_C,
    location: 'Sân đua Sóc Sơn, Hà Nội',
    startDate: '2025-12-05',
    status: 'Đã kết thúc',
    races: buildRaces('hnc', 8, ['Đã kết thúc']),
  },
  {
    id: 'spring-classic-2026',
    name: 'Spring Classic 2026',
    banner: BANNER_A,
    location: 'Sân đua Đà Lạt',
    startDate: '2026-03-10',
    status: 'Nháp',
    races: buildRaces('spc', 4, ['Nháp']),
  },
]

export function judgeStatusTone(status) {
  if (status === 'Nháp') return 'gray'
  if (status === 'Đang mở đăng ký' || status === 'Mở đăng ký') return 'gold'
  if (status === 'Đang diễn ra' || status === 'Đang đua') return 'green'
  if (status === 'Sắp diễn ra') return 'blue'
  return 'purple'
}

export function isRaceJudgeReady(race) {
  const assignments = race.judges ?? []
  const chiefCount = assignments.filter((item) => item.role === 'Trọng tài chính').length
  const hasDoping = assignments.some((item) => item.role === 'Giám sát doping')
  return chiefCount === 1 && hasDoping && assignments.length >= 3
}

export function refereeLevelTone(level) {
  if (level === 'Quốc tế') return 'gold'
  if (level === 'Quốc gia') return 'green'
  return 'blue'
}

export function refereeInitial(name) {
  const parts = name.trim().split(/\s+/)
  return parts[parts.length - 1]?.[0]?.toUpperCase() ?? '?'
}
