import { Award } from 'lucide-react'
import Card from '@/components/ui/Card'
import { PanelHeader, SimpleTable } from '@/components/ui/Panel'
import { formatVnd, getPrizeAmountByRank } from '../utils'
import { useRaceResults } from '@/services/raceResultService'

export default function RaceResults({ race }) {
  const { rankedRows, disqualifiedRows, loading, error } = useRaceResults(race?.id)
  const raceOngoing = race?.statusCode === 'ONGOING'

  const prizeFor = (item) => {
    if (item.prizeAmount > 0) return formatVnd(item.prizeAmount)
    if (item.position != null && item.position < 4) {
      return formatVnd(getPrizeAmountByRank(race, item.position))
    }
    return '—'
  }

  const subtitle = raceOngoing
    ? 'Cuộc đua đang diễn ra — chỉ hiển thị ngựa có hạng'
    : rankedRows.length
      ? 'Bảng xếp hạng cuộc đua'
      : 'Chưa có kết quả xếp hạng'

  return (
    <Card>
      <PanelHeader icon={Award} title="Kết quả cuộc đua" subtitle={subtitle} />

      {loading && (
        <p className="px-6 pb-6 text-sm text-white/50">Đang tải kết quả...</p>
      )}

      {error && (
        <p className="mx-6 mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {!loading && !error && rankedRows.length === 0 && (
        <p className="px-6 pb-6 text-sm text-white/50">
          Chưa có kết quả xếp hạng cho cuộc đua này.
        </p>
      )}

      {!loading && rankedRows.length > 0 && (
        <SimpleTable
          headers={['Hạng', 'Ngựa', 'Jockey', 'Thời gian', 'Giải thưởng']}
          rows={rankedRows.map((item) => [
            `#${item.position}`,
            item.horse,
            item.jockey,
            item.time,
            prizeFor(item),
          ])}
        />
      )}

      {!loading && disqualifiedRows.length > 0 && (
        <div className="border-t border-white/10 px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/45">
            Ngựa bị loại (không xếp hạng)
          </p>
          <ul className="space-y-2">
            {disqualifiedRows.map((item) => (
              <li
                key={item.participantId ?? item.id}
                className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm"
              >
                <span className="font-semibold text-white">{item.horse}</span>
                <span className="text-white/50"> · {item.jockey}</span>
                {item.note ? (
                  <span className="mt-1 block text-xs text-red-200/90">Lý do: {item.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
