import { Activity, Award, DollarSign, Flag, Trophy, Users } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'

const revenue = [
  { label: 'T1', value: 120 },
  { label: 'T2', value: 180 },
  { label: 'T3', value: 240 },
  { label: 'T4', value: 210 },
  { label: 'T5', value: 320 },
  { label: 'T6', value: 410 },
]

const tournaments = [
  { name: 'Vietnam GP', registered: 42, races: 6 },
  { name: 'Saigon Derby', registered: 40, races: 5 },
  { name: 'Hanoi Cup', registered: 42, races: 8 },
  { name: 'Spring Classic', registered: 36, races: 4 },
]

const topHorses = [
  { name: 'Thunder Bolt', owner: 'Nguyễn Văn A', wins: 12, earnings: '850,000,000 đ' },
  { name: 'Black Pearl', owner: 'Trần Thị B', wins: 9, earnings: '620,000,000 đ' },
  { name: 'Wind Runner', owner: 'Lê Văn C', wins: 7, earnings: '480,000,000 đ' },
  { name: 'Golden Star', owner: 'Phạm Thị D', wins: 6, earnings: '410,000,000 đ' },
]

function maxValue(items, key) {
  return Math.max(...items.map((item) => item[key]))
}

export default function AdminStatisticsPage() {
  const maxRevenue = maxValue(revenue, 'value')
  const maxRegistered = maxValue(tournaments, 'registered')

  return (
    <AdminLayout
      heading="Thống kê"
      highlight="Toàn hệ thống"
      subtitle="Báo cáo tổng quan về giải đấu, doanh thu và hiệu suất thi đấu"
    >
      <section className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Giải đấu', value: '4', icon: Trophy, tone: 'bg-[#dda50e]/15 text-[#dda50e]' },
          { label: 'Cuộc đua', value: '23', icon: Flag, tone: 'bg-sky-500/15 text-sky-300' },
          { label: 'Đăng ký', value: '160', icon: Users, tone: 'bg-emerald-500/15 text-emerald-300' },
          { label: 'Doanh thu', value: '2.4 tỷ', icon: DollarSign, tone: 'bg-purple-500/15 text-purple-300' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${item.tone}`}>
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-3xl font-bold">{item.value}</p>
              <p className="mt-2 text-sm text-white/50">{item.label}</p>
            </div>
          )
        })}
      </section>

      <section className="mb-8 grid gap-7 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-7">
          <div className="mb-6 flex items-center gap-3">
            <Activity className="h-6 w-6 text-[#dda50e]" />
            <h2 className="text-2xl font-bold">Doanh thu 6 tháng</h2>
          </div>
          <div className="space-y-5">
            {revenue.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">{item.label}</span>
                  <span className="text-white/55">{item.value} triệu</span>
                </div>
                <div className="h-4 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#dda50e]"
                    style={{ width: `${(item.value / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-7">
          <div className="mb-6 flex items-center gap-3">
            <Flag className="h-6 w-6 text-[#dda50e]" />
            <h2 className="text-2xl font-bold">Đăng ký theo giải</h2>
          </div>
          <div className="space-y-5">
            {tournaments.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-white/55">{item.registered} đăng ký</span>
                </div>
                <div className="h-4 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-sky-400"
                    style={{ width: `${(item.registered / maxRegistered) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/45">{item.races} cuộc đua</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-7 xl:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
            <Trophy className="h-5 w-5 text-[#dda50e]" />
            <h2 className="text-xl font-bold">Top ngựa thắng giải</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Ngựa</th>
                  <th className="px-6 py-4 text-center">Thắng</th>
                  <th className="px-6 py-4 text-right">Tiền thưởng</th>
                </tr>
              </thead>
              <tbody>
                {topHorses.map((item, index) => (
                  <tr key={item.name} className="border-b border-white/5 text-white/70 last:border-0">
                    <td className="px-6 py-4">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#dda50e]/15 font-bold text-[#dda50e]">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="mt-1 text-xs text-white/45">{item.owner}</p>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-white">{item.wins}</td>
                    <td className="px-6 py-4 text-right font-bold text-[#dda50e]">
                      {item.earnings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-7">
          <div className="mb-6 flex items-center gap-3">
            <Award className="h-6 w-6 text-[#dda50e]" />
            <h2 className="text-2xl font-bold">Phân tích nhanh</h2>
          </div>
          <div className="space-y-4">
            {[
              'Tỉ lệ lấp đầy đăng ký trung bình đạt 83%.',
              'Vietnam GP đang có doanh thu và số đăng ký cao nhất.',
              'Top 3 ngựa dẫn đầu tạo ra hơn 60% tổng giải thưởng nổi bật.',
              'Các giải mùa hè có xu hướng thu hút nhiều jockey hơn mùa xuân.',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-white/68"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
