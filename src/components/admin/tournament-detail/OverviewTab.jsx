import { Activity, CheckCircle2, FileText, Flag, Sparkles, Trophy, Users } from 'lucide-react'
import Card from '@/components/admin/ui/Card'
import StatCard from '@/components/admin/ui/StatCard'
import { SectionHeading } from '@/components/admin/ui/Panel'
import { formatVnd } from './utils'

export default function OverviewTab({ tournament, totalPrize, totalRegistered }) {
  const progress = [
    { name: 'Tạo giải đấu', done: true },
    { name: 'Cấu hình cuộc đua', done: tournament.races.length > 0 },
    { name: 'Mở đăng ký', done: tournament.status !== 'Nháp' },
    {
      name: 'Diễn ra',
      done: tournament.status === 'Đang diễn ra' || tournament.status === 'Đã kết thúc',
    },
    { name: 'Hoàn tất kết quả', done: tournament.status === 'Đã kết thúc' },
  ]

  return (
    <>
      <div className="mb-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flag} tone="gold" value={String(tournament.races.length)} label="Cuộc đua" />
        <StatCard icon={Users} tone="green" value={String(totalRegistered)} label="Đăng ký" />
        <StatCard icon={Trophy} tone="purple" value={formatVnd(totalPrize)} label="Tổng giải thưởng" />
        <StatCard icon={Activity} tone="blue" value={tournament.status} label="Trạng thái" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[2.1fr_1fr]">
        <Card className="p-8">
          <SectionHeading icon={FileText}>Mô tả giải đấu</SectionHeading>
          <p className="mb-10 text-lg leading-8 text-white/70">{tournament.description}</p>
          <SectionHeading icon={FileText}>Luật giải đấu</SectionHeading>
          <pre className="whitespace-pre-wrap rounded-3xl border border-white/10 bg-white/[0.035] p-7 font-sans text-lg leading-8 text-white/70">
            {tournament.rules}
          </pre>
        </Card>
        <Card className="h-fit p-8">
          <SectionHeading icon={Sparkles}>Tiến độ tổ chức</SectionHeading>
          <div className="space-y-5">
            {progress.map((step) => (
              <div key={step.name} className="flex items-center gap-4">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 ${
                    step.done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-white/15 bg-white/[0.04] text-transparent'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <span className={`text-lg ${step.done ? 'font-semibold text-white' : 'text-white/42'}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
