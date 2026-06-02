import { Activity, CalendarDays, FileText, Flag, Trophy, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import { SectionHeading } from '@/components/ui/Panel'
import { formatVnd } from './utils'

export default function OverviewTab({ tournament, totalPrize, totalRegistered }) {
  return (
    <>
      <div className="mb-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flag} tone="gold" value={String(tournament.races.length)} label="Cuộc đua" />
        <StatCard icon={Users} tone="green" value={String(totalRegistered)} label="Đăng ký" />
        <StatCard icon={Trophy} tone="purple" value={formatVnd(totalPrize)} label="Tổng giải thưởng" />
        <StatCard icon={Activity} tone="blue" value={tournament.status} label="Trạng thái" />
      </div>

      <Card className="p-8">
        <SectionHeading icon={CalendarDays}>Thời gian đăng ký</SectionHeading>
        <div className="mb-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/45">Mở đăng ký</p>
            <p className="text-xl font-bold text-white">{tournament.registrationOpenDate || 'Chưa cập nhật'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/45">Kết thúc đăng ký</p>
            <p className="text-xl font-bold text-white">{tournament.registrationCloseDate || 'Chưa cập nhật'}</p>
          </div>
        </div>

        <SectionHeading icon={FileText}>Mô tả giải đấu</SectionHeading>
        <p className="mb-10 text-lg leading-8 text-white/70">{tournament.description}</p>
        <SectionHeading icon={FileText}>Luật giải đấu</SectionHeading>
        <pre className="whitespace-pre-wrap rounded-3xl border border-white/10 bg-white/[0.035] p-7 font-sans text-lg leading-8 text-white/70">
          {tournament.rules}
        </pre>
      </Card>
    </>
  )
}
