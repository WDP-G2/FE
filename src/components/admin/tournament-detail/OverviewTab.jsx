import { Activity, CheckCircle2, FileText, Flag, Sparkles, Trophy, Users } from 'lucide-react'
import Card from '@/components/admin/ui/Card'
import StatCard from '@/components/admin/ui/StatCard'
import { SectionHeading } from '@/components/admin/ui/Panel'
import { formatVnd } from './utils'

export default function OverviewTab({ tournament, totalPrize, totalRegistered }) {
  const progress = [
    { name: 'Tß║ío giß║úi ─æß║Ñu', done: true },
    { name: 'Cß║Ñu h├¼nh cuß╗Öc ─æua', done: tournament.races.length > 0 },
    { name: 'Mß╗ƒ ─æ─âng k├╜', done: tournament.status !== 'Nh├íp' },
    {
      name: 'Diß╗àn ra',
      done: tournament.status === '─Éang diß╗àn ra' || tournament.status === '─É├ú kß║┐t th├║c',
    },
    { name: 'Ho├án tß║Ñt kß║┐t quß║ú', done: tournament.status === '─É├ú kß║┐t th├║c' },
  ]

  return (
    <>
      <div className="mb-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flag} tone="gold" value={String(tournament.races.length)} label="Cuß╗Öc ─æua" />
        <StatCard icon={Users} tone="green" value={String(totalRegistered)} label="─É─âng k├╜" />
        <StatCard icon={Trophy} tone="purple" value={formatVnd(totalPrize)} label="Tß╗òng giß║úi th╞░ß╗ƒng" />
        <StatCard icon={Activity} tone="blue" value={tournament.status} label="Trß║íng th├íi" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[2.1fr_1fr]">
        <Card className="p-8">
          <SectionHeading icon={FileText}>M├┤ tß║ú giß║úi ─æß║Ñu</SectionHeading>
          <p className="mb-10 text-lg leading-8 text-white/70">{tournament.description}</p>
          <SectionHeading icon={FileText}>Luß║¡t giß║úi ─æß║Ñu</SectionHeading>
          <pre className="whitespace-pre-wrap rounded-3xl border border-white/10 bg-white/[0.035] p-7 font-sans text-lg leading-8 text-white/70">
            {tournament.rules}
          </pre>
        </Card>
        <Card className="h-fit p-8">
          <SectionHeading icon={Sparkles}>Tiß║┐n ─æß╗Ö tß╗ò chß╗⌐c</SectionHeading>
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
