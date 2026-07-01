import { useMemo } from 'react'
import {
  DollarSign,
  Flag,
  Trophy,
  Users,
} from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import { useFetch } from '@/hooks/useFetch'
import { dashboardService } from '@/services/dashboardService'
import {
  formatCompactVND,
  toRevenueChartPoints,
} from '@/utils/adminDashboardFormat'

const REVENUE_MONTHS = 6

export default function AdminDashboardPage() {
  const { data: summary, loading: summaryLoading } = useFetch(
    () => dashboardService.getAdminSummary(),
    { cacheKey: 'admin:dashboard:summary' },
  )

  const { data: revenue = [], loading: revenueLoading } = useFetch(
    () => dashboardService.getAdminRevenue(REVENUE_MONTHS),
    { cacheKey: `admin:dashboard:revenue:${REVENUE_MONTHS}` },
  )

  const statistics = useMemo(() => {
    if (!summary) return []

    return [
      {
        key: 'tournaments',
        label: 'Tổng giải đấu',
        value: String(summary.tournamentCount ?? 0),
        icon: Trophy,
        tone: 'gold',
      },
      {
        key: 'races',
        label: 'Tổng cuộc đua',
        value: String(summary.raceCount ?? 0),
        icon: Flag,
        tone: 'blue',
      },
      {
        key: 'participants',
        label: 'Lượt đăng ký',
        value: String(summary.registrationCount ?? 0),
        icon: Users,
        tone: 'green',
      },
      {
        key: 'revenue',
        label: 'Doanh thu',
        value: formatCompactVND(summary.revenue),
        icon: DollarSign,
        tone: 'purple',
      },
    ]
  }, [summary])

  const revenuePoints = useMemo(() => toRevenueChartPoints(revenue), [revenue])

  const loading = summaryLoading || revenueLoading

  return (
    <AdminLayout>
      <section aria-label="Chỉ số tổng quan" className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {loading && !summary
          ? Array.from({ length: 4 }).map((_, index) => (
              <GlassCard key={index} className="p-7 animate-pulse">
                <div className="mb-7 h-16 w-16 rounded-2xl bg-white/10" />
                <div className="mb-3 h-10 w-24 rounded bg-white/10" />
                <div className="h-4 w-32 rounded bg-white/10" />
              </GlassCard>
            ))
          : statistics.map((stat) => <StatCard key={stat.key} {...stat} />)}
      </section>

      <section aria-label="Biểu đồ thống kê" className="mb-8">
        <GlassCard className="p-7">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Doanh thu 6 tháng</h2>
            <p className="mt-1 text-base text-white/50">Đơn vị: triệu VNĐ</p>
          </div>
          {revenueLoading && revenuePoints.length === 0 ? (
            <ChartSkeleton />
          ) : revenuePoints.length > 0 ? (
            <RevenueChart data={revenuePoints} />
          ) : (
            <EmptyChart message="Chưa có dữ liệu doanh thu" />
          )}
        </GlassCard>
      </section>
    </AdminLayout>
  )
}

function GlassCard({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.045] ${className}`}>
      {children}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    gold: 'border-[#dda50e]/25 bg-[#dda50e]/15 text-[#dda50e]',
    blue: 'border-sky-400/25 bg-sky-400/15 text-sky-300',
    green: 'border-emerald-400/25 bg-emerald-400/15 text-emerald-300',
    purple: 'border-purple-400/25 bg-purple-400/15 text-purple-300',
  }

  return (
    <GlassCard className="p-7">
      <div className="mb-7">
        <span className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${tones[tone]}`}>
          <Icon className="h-8 w-8" />
        </span>
      </div>
      <p className="text-4xl font-bold">{value}</p>
      <p className="mt-2 text-base text-white/50">{label}</p>
    </GlassCard>
  )
}

function ChartSkeleton() {
  return <div className="h-[275px] animate-pulse rounded-2xl bg-white/5" />
}

function EmptyChart({ message }) {
  return (
    <div className="flex h-[275px] items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-white/45">
      {message}
    </div>
  )
}

function RevenueChart({ data }) {
  const width = 840
  const height = 275
  const left = 45
  const top = 10
  const right = 12
  const bottom = 36
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom
  const maxValue = Math.max(...data.map((item) => item.value), 1)
  const max = Math.ceil((maxValue * 1.15) / 50) * 50 || 50
  const tickStep = max <= 100 ? 25 : max <= 300 ? 50 : Math.ceil(max / 4 / 50) * 50
  const tickValues = Array.from({ length: Math.floor(max / tickStep) + 1 }, (_, index) => index * tickStep)

  const points = data.map((item, index) => ({
    ...item,
    x: data.length === 1 ? left + chartWidth / 2 : left + (index * chartWidth) / (data.length - 1),
    y: top + chartHeight - (item.value / max) * chartHeight,
  }))
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const fill = `${left},${top + chartHeight} ${line} ${left + chartWidth},${top + chartHeight}`

  return (
    <svg
      className="block h-auto w-full overflow-visible"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Biểu đồ doanh thu 6 tháng gần nhất"
    >
      <defs>
        <linearGradient id="admin-revenue-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dda50e" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#dda50e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {tickValues.map((tick) => {
        const y = top + chartHeight - (tick / max) * chartHeight
        return (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={y} y2={y} stroke="rgba(255,255,255,.08)" />
            <text x={left - 10} y={y + 4} textAnchor="end" fill="rgba(255,255,255,.47)" fontSize="12">
              {tick}
            </text>
          </g>
        )
      })}
      {points.map((point) => (
        <g key={point.label}>
          <line
            x1={point.x}
            x2={point.x}
            y1={top}
            y2={top + chartHeight}
            stroke="rgba(255,255,255,.055)"
          />
          <text
            x={point.x}
            y={height - 10}
            textAnchor="middle"
            fill="rgba(255,255,255,.47)"
            fontSize="13"
          >
            {point.label}
          </text>
        </g>
      ))}
      <polyline points={fill} fill="url(#admin-revenue-fill)" />
      <polyline points={line} fill="none" stroke="#dda50e" strokeWidth="3" strokeLinejoin="round" />
      <line
        x1={left}
        x2={width - right}
        y1={top + chartHeight}
        y2={top + chartHeight}
        stroke="rgba(255,255,255,.42)"
      />
    </svg>
  )
}
