import { BarChart3, Trophy, Medal, TrendingUp } from 'lucide-react'
import { JockeyLayout } from './JockeyLayout'
import { GlassCard, StatCard } from '../admin/AdminLayout'
import { jockeyResults, jockeyProfile, fmt } from './data'

const positionColor = (pos) => (pos === 1 ? 'bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/40' : pos === 2 ? 'bg-slate-400/20 text-slate-300 border-slate-400/40' : pos === 3 ? 'bg-amber-700/20 text-amber-600 border-amber-700/40' : 'bg-white/10 text-white/60 border-white/20')

export function JockeyResults() {
  const totalPrize = jockeyResults.reduce((s, r) => s + r.prize, 0)
  return (
    <JockeyLayout title="Jockey · Kết quả thi đấu" subtitle="Lịch sử và thống kê hiệu suất cá nhân">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><StatCard label="Tổng chiến thắng" value={String(jockeyProfile.wins)} icon={Trophy} tone="gold" /><StatCard label="Tổng race" value={String(jockeyProfile.races)} icon={BarChart3} tone="blue" /><StatCard label="Tỷ lệ thắng" value={`${jockeyProfile.winRate}%`} icon={TrendingUp} tone="green" /><StatCard label="Tổng thưởng (hiển thị)" value={fmt(totalPrize)} icon={Medal} tone="purple" /></div>
      <GlassCard><div className="p-5 border-b border-white/10"><h2 className="font-bold text-white">Lịch sử kết quả</h2></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-white/10"><th className="text-left px-5 py-3 text-[11px] text-white/40">Hạng</th><th className="text-left px-5 py-3 text-[11px] text-white/40">Ngựa</th><th className="text-left px-5 py-3 text-[11px] text-white/40">Giải đấu</th><th className="text-left px-5 py-3 text-[11px] text-white/40">Thời gian</th><th className="text-right px-5 py-3 text-[11px] text-white/40">Thưởng</th><th className="text-left px-5 py-3 text-[11px] text-white/40">Ngày</th></tr></thead><tbody>{jockeyResults.map((r) => <tr key={r.id} className="border-b border-white/[0.06] hover:bg-white/[0.03]"><td className="px-5 py-4"><div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border ${positionColor(r.position)}`}>#{r.position}</div></td><td className="px-5 py-4"><div className="text-sm font-bold text-white">{r.horse}</div><div className="text-[11px] text-white/50">{r.owner}</div></td><td className="px-5 py-4"><div className="text-sm text-white/80">{r.race}</div><div className="text-[11px] text-white/50">{r.tournament}</div></td><td className="px-5 py-4 font-mono text-sm text-sky-300">{r.finishTime}</td><td className="px-5 py-4 text-right"><span className="text-sm font-bold text-emerald-300">+{fmt(r.prize)}</span></td><td className="px-5 py-4 text-sm text-white/50">{r.date}</td></tr>)}</tbody></table></div></GlassCard>
    </JockeyLayout>
  )
}
