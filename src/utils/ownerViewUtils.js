import { formatFinishTimeMillis } from '@/utils/jockeyViewUtils'

export function mapOwnerResultRow(item, index) {  return {
    id: String(item.id ?? index),
    position: Number(item.position || 0),
    horse: item.horseName || '—',
    jockey: item.jockeyName || '—',
    race: item.raceName || '—',
    tournament: item.tournamentName || '—',
    finishTime: formatFinishTimeMillis(item.finishTimeMillis),
    prize: Number(item.prizeAmount || 0),
    date: item.date || null,
  }
}

export function buildOwnerResults(results = []) {
  return [...results]
    .map(mapOwnerResultRow)
    .sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0
      const bTime = b.date ? new Date(b.date).getTime() : 0
      return bTime - aTime
    })
}
