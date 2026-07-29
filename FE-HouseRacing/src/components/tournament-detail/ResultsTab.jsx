import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { SimpleTable } from '@/components/ui/Panel'
import { formatVnd, getPrizeAmountByRank, getTotalPrize, getAdminRaceDisplayStatus, toneForStatus } from './utils'
import { formatDisplayDate } from '@/utils/dateFormat'
import { useRaceResults } from '@/services/raceResultService'

function RaceResultCard({ race, open, onToggle }) {
  const { rankedRows, disqualifiedRows, loading, error } = useRaceResults(race.id)
  const champion = rankedRows[0]?.horse ?? 'Chưa có'

  const prizeFor = (item) => {
    if (item.prizeAmount > 0) return formatVnd(item.prizeAmount)
    if (item.position != null && item.position < 4) {
      return formatVnd(getPrizeAmountByRank(race, item.position))
    }
    return '—'
  }

  let body = null
  if (open && loading) {
    body = (
      <p className="border-t border-white/10 px-6 py-8 text-center text-white/55">
        Đang tải kết quả...
      </p>
    )
  } else if (open && error) {
    body = (
      <p className="border-t border-white/10 px-6 py-8 text-center text-red-200/90">{error}</p>
    )
  } else if (open && rankedRows.length > 0) {
    body = (
      <>
        <SimpleTable
          headers={['Hạng', 'Ngựa', 'Chủ ngựa', 'Jockey', 'Thời gian', 'Thưởng']}
          rows={rankedRows.map((item) => [
            `#${item.position}`,
            item.horse,
            item.owner,
            item.jockey,
            item.time,
            prizeFor(item),
          ])}
        />
        {Array.isArray(race.financialSettlementSnapshot?.prizes) && race.financialSettlementSnapshot.prizes.length > 0 && (
          <div className="border-t border-white/10 px-6 py-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">Phân bổ thưởng đã khóa</p>
            <div className="flex flex-wrap gap-2">
              {race.financialSettlementSnapshot.prizes.map((prize) => (
                <span key={prize.registrationId} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
                  Hạng {prize.rank}: Owner {formatVnd(prize.ownerAmount)} · Jockey {formatVnd(prize.jockeyAmount)}
                </span>
              ))}
            </div>
          </div>
        )}
        {disqualifiedRows.length > 0 && (
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
      </>
    )
  } else if (open) {
    body = (
      <p className="border-t border-white/10 px-6 py-8 text-center text-white/55">
        Chưa có kết quả cho cuộc đua này.
      </p>
    )
  }
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-5 p-6 text-left transition hover:bg-white/[0.03]"
      >
        <span className="rounded-xl bg-[#dda50e] px-4 py-3 font-bold">R{race.no}</span>
        <span className="flex-1">
          <span className="mb-2 flex items-center gap-3">
            <span className="text-xl font-bold">{race.name}</span>
            <Badge tone={toneForStatus(getAdminRaceDisplayStatus(race))}>
              {getAdminRaceDisplayStatus(race)}
            </Badge>
          </span>
          <span className="text-sm text-white/55">
            {formatDisplayDate(race.date)} · {race.time} · Quán quân: {champion}
          </span>
          {race.financialSettlementStatus && race.financialSettlementStatus !== 'NONE' && (
            <span className="mt-2 block text-xs font-semibold text-emerald-300">
              Settlement: {race.financialSettlementStatus}{race.financialSettledAt ? ` · ${new Date(race.financialSettledAt).toLocaleString('vi-VN')}` : ''} · Kết quả đã khóa
            </span>
          )}
        </span>
        <span className="font-bold text-[#dda50e]">{formatVnd(getTotalPrize(race))}</span>
        <ArrowRight className={`h-5 w-5 text-white/45 transition ${open ? 'rotate-90' : ''}`} />
      </button>
      {body}
    </Card>
  )
}

export default function ResultsTab({ tournament }) {
  const [expanded, setExpanded] = useState(tournament.races[0]?.id)

  return (
    <div className="space-y-4">
      {tournament.races.map((race) => (
        <RaceResultCard
          key={race.id}
          race={race}
          open={expanded === race.id}
          onToggle={() => setExpanded(expanded === race.id ? '' : race.id)}
        />
      ))}
    </div>
  )
}
