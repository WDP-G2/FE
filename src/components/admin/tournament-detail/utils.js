import { horsePool } from '@/data/admin/tournamentMocks'

export function registrationsFor(race) {
  return Array.from({ length: race.registered }, (_, index) => {
    const member = horsePool[index % horsePool.length]
    return {
      ...member,
      approval: index % 4 === 3 ? 'Chờ duyệt' : 'Đã duyệt',
    }
  })
}

export function resultsFor(race) {
  if (Array.isArray(race.results) && race.results.length) {
    return race.results
      .filter(Boolean)
      .map((item, index) => ({
        horse: item.horse || 'Chưa cập nhật',
        owner: item.owner || 'Chưa cập nhật',
        jockey: item.jockey || 'Chưa cập nhật',
        position: item.position ?? index + 1,
        time: item.time || '—',
        ...item,
      }))
  }
  return registrationsFor(race).map((member, index) => ({
    ...member,
    position: index + 1,
    time: `01:${String(12 + index).padStart(2, '0')}.${String(24 + index * 3).padStart(2, '0')}`,
  }))
}

const legacyPrizeNames = {
  first: { rank: 1, itemName: 'Giải nhất' },
  second: { rank: 2, itemName: 'Giải nhì' },
  third: { rank: 3, itemName: 'Giải ba' },
  bonus: { rank: 4, itemName: 'Thưởng phụ' },
}

export function normalizePrizeList(prizes) {
  const rawPrizes = Array.isArray(prizes)
    ? prizes
    : Object.entries(prizes || {}).map(([key, amount], index) => ({
        id: key,
        rank: legacyPrizeNames[key]?.rank ?? index + 1,
        itemName: legacyPrizeNames[key]?.itemName ?? key,
        amount,
      }))

  return rawPrizes
    .filter(Boolean)
    .map((item, index) => ({
      id: String(item.id ?? `prize-${item.rank ?? index + 1}-${index}`),
      rank: Number(item.rank || index + 1),
      itemName: String(item.itemName || item.label || `Giải ${index + 1}`),
      amount: Math.max(0, Number(item.amount ?? 0)),
    }))
    .sort((firstPrize, secondPrize) => firstPrize.rank - secondPrize.rank)
}

export function getPrizeAmountByRank(race, rank) {
  return normalizePrizeList(race.prizes).find((prize) => prize.rank === rank)?.amount ?? 0
}

export function getTotalPrize(race) {
  return normalizePrizeList(race.prizes).reduce((total, prize) => total + prize.amount, 0)
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
