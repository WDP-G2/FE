import { useEffect, useState } from 'react'
import { Activity, CalendarDays, FileText, Flag, Trophy, Users } from 'lucide-react'
import Card from '@/components/ui/Card'
import StatCard from '@/components/ui/StatCard'
import { SectionHeading } from '@/components/ui/Panel'
import { formatVnd } from './utils'
import { formatDisplayDate } from '@/utils/dateFormat'
import { fetchDefaultTournamentRules } from '@/services/systemSettingsService'

export default function OverviewTab({ tournament, totalPrize, totalRegistered }) {
  const [rules, setRules] = useState(tournament.rules ?? '')
  const [loadingRules, setLoadingRules] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadRules() {
      try {
        setLoadingRules(true)
        const systemRules = await fetchDefaultTournamentRules()
        if (!cancelled) setRules(systemRules)
      } catch {
        if (!cancelled) setRules(tournament.rules ?? '')
      } finally {
        if (!cancelled) setLoadingRules(false)
      }
    }

    loadRules()
    return () => {
      cancelled = true
    }
  }, [tournament.id, tournament.rules])

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
            <p className="text-xl font-bold text-white">{formatDisplayDate(tournament.registrationOpenDate, 'Chưa cập nhật')}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-white/45">Kết thúc đăng ký</p>
            <p className="text-xl font-bold text-white">{formatDisplayDate(tournament.registrationCloseDate, 'Chưa cập nhật')}</p>
          </div>
        </div>

        <SectionHeading icon={FileText}>Mô tả giải đấu</SectionHeading>
        <p className="mb-10 text-lg leading-8 text-white/70">{tournament.description}</p>
        <SectionHeading icon={FileText}>Luật giải đấu</SectionHeading>
        <pre className="whitespace-pre-wrap rounded-3xl border border-white/10 bg-white/[0.035] p-7 font-sans text-lg leading-8 text-white/70">
          {loadingRules ? 'Đang tải luật từ cài đặt hệ thống...' : rules || 'Chưa có luật giải đấu.'}
        </pre>
        <p className="mt-3 text-xs text-white/45">
          Đồng bộ từ Admin → Cài đặt → Luật mặc định.
        </p>
      </Card>
    </>
  )
}
