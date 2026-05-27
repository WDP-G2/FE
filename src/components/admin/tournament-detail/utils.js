import { horsePool } from '@/data/admin/tournamentMocks'

export function registrationsFor(race) {
  return Array.from({ length: race.registered }, (_, index) => {
    const member = horsePool[index % horsePool.length]
    return {
      ...member,
      deposit: index % 5 === 4 ? 'Chưa thanh toán' : 'Đã thanh toán',
      approval: index % 4 === 3 ? 'Chờ duyệt' : 'Đã duyệt',
    }
  })
}

export function resultsFor(race) {
  return registrationsFor(race).map((member, index) => ({
    ...member,
    position: index + 1,
    time: `01:${String(12 + index).padStart(2, '0')}.${String(24 + index * 3).padStart(2, '0')}`,
  }))
}

export function getTotalPrize(race) {
  return race.prizes.first + race.prizes.second + race.prizes.third + race.prizes.bonus
}

export function formatVnd(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`
}

export function toneForStatus(status) {
  if (status.includes('mở') || status.includes('Mở')) return 'gold'
  if (status.includes('diễn') || status.includes('đua')) return 'green'
  if (status.includes('kết thúc')) return 'purple'
  return 'blue'
}
