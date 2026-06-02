import { DollarSign, Flag, TrendingUp, Trophy, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import { BarSummary, SectionHeading } from '@/components/ui/Panel'
import { formatVnd, getTotalPrize } from './utils'

export default function StatisticsTab({ tournament, totalPrize, totalRegistered }) {
  const maxRegistered = Math.max(...tournament.races.map((race) => race.registered))
  const maxPrize = Math.max(...tournament.races.map((race) => getTotalPrize(race)))
  const revenue = tournament.races.reduce((sum, race) => sum + race.entryFee * race.registered, 0)

  return (
    <>
      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flag} tone="gold" value={String(tournament.races.length)} label="Cuộc đua" />
        <StatCard icon={Users} tone="green" value={String(totalRegistered)} label="Tổng đăng ký" />
        <StatCard icon={DollarSign} tone="blue" value={formatVnd(revenue)} label="Doanh thu lệ phí" />
        <StatCard icon={Trophy} tone="purple" value={formatVnd(totalPrize)} label="Tổng thưởng" />
      </div>
      <div className="grid gap-7 lg:grid-cols-2">
        <Card className="p-7">
          <SectionHeading icon={Users}>Đăng ký theo cuộc đua</SectionHeading>
          <BarSummary
            items={tournament.races.map((race) => ({ label: `R${race.no}`, value: race.registered }))}
            max={maxRegistered}
          />
        </Card>
        <Card className="p-7">
          <SectionHeading icon={TrendingUp}>Giải thưởng theo cuộc đua</SectionHeading>
          <BarSummary
            items={tournament.races.map((race) => ({
              label: `R${race.no}`,
              value: getTotalPrize(race),
            }))}
            max={maxPrize}
            format={formatVnd}
          />
        </Card>
      </div>
    </>
  )
}
