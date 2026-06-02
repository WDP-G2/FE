import { CalendarRange, MapPin, Route, Timer } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { Meta, PanelHeader } from '@/components/ui/Panel'
import { formatVnd, getTotalPrize, toneForStatus } from './utils'

export default function ScheduleTab({ tournament }) {
  return (
    <Card>
      <PanelHeader icon={CalendarRange} title="Lịch thi đấu" subtitle="Tất cả cuộc đua theo thứ tự thời gian" />
      <div className="space-y-4 p-6">
        {tournament.races.map((race) => (
          <div
            key={race.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:flex-row md:items-center"
          >
            <div className="w-28 shrink-0 text-center">
              <div className="text-sm text-white/50">{race.date.slice(5)}</div>
              <div className="text-2xl font-bold text-[#dda50e]">{race.time}</div>
            </div>
            <div className="hidden h-14 w-px bg-white/10 md:block" />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <span className="font-bold text-[#dda50e]">R{race.no}</span>
                <span className="text-lg font-bold">{race.name}</span>
                <Badge tone={toneForStatus(race.status)}>{race.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-white/55">
                <Meta icon={Route} text={race.distance} />
                <Meta icon={MapPin} text={race.track} />
                <Meta icon={Timer} text={`Check-in ${race.checkIn}`} />
              </div>
            </div>
            <Badge tone="purple">{formatVnd(getTotalPrize(race))}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
