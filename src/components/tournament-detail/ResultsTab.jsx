import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { SimpleTable } from '@/components/ui/Panel'
import { formatVnd, getPrizeAmountByRank, getTotalPrize, resultsFor, toneForStatus } from './utils'

export default function ResultsTab({ tournament }) {
  const [expanded, setExpanded] = useState(tournament.races[0]?.id)

  return (
    <div className="space-y-4">
      {tournament.races.map((race) => {
        const open = expanded === race.id
        const results = resultsFor(race)
        const champion = results[0]?.horse ?? 'Chưa có'

        return (
          <Card key={race.id} className="overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(open ? '' : race.id)}
              className="flex w-full items-center gap-5 p-6 text-left transition hover:bg-white/[0.03]"
            >
              <span className="rounded-xl bg-[#dda50e] px-4 py-3 font-bold">R{race.no}</span>
              <span className="flex-1">
                <span className="mb-2 flex items-center gap-3">
                  <span className="text-xl font-bold">{race.name}</span>
                  <Badge tone={toneForStatus(race.status)}>{race.status}</Badge>
                </span>
                <span className="text-sm text-white/55">
                  {race.date} · {race.time} · Quán quân: {champion}
                </span>
              </span>
              <span className="font-bold text-[#dda50e]">{formatVnd(getTotalPrize(race))}</span>
              <ArrowRight className={`h-5 w-5 text-white/45 transition ${open ? 'rotate-90' : ''}`} />
            </button>
            {open &&
              (results.length ? (
                <SimpleTable
                  headers={['Hạng', 'Ngựa', 'Chủ ngựa', 'Jockey', 'Thời gian', 'Thưởng']}
                  rows={results.map((item) => [
                    `#${item.position}`,
                    item.horse,
                    item.owner,
                    item.jockey,
                    item.time,
                    item.position < 4 ? formatVnd(getPrizeAmountByRank(race, item.position)) : '—',
                  ])}
                />
              ) : (
                <p className="border-t border-white/10 px-6 py-8 text-center text-white/55">
                  Chưa có kết quả cho cuộc đua này.
                </p>
              ))}
          </Card>
        )
      })}
    </div>
  )
}
