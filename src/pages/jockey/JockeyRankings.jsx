import { Trophy, Medal, Star, TrendingUp } from 'lucide-react'
import { JockeyLayout } from './JockeyLayout'
import { GlassCard, StatCard } from '../admin/AdminLayout'
import { rankings, jockeyProfile } from './data'

export function JockeyRankings() {
  const myRank = rankings.find((r) => r.isMe)
  return (
    <JockeyLayout title="Jockey · Bảng xếp hạng" subtitle="Xếp hạng jockey mùa giải 2026">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><StatCard label="Xếp hạng hiện tại" value={`#${jockeyProfile.ranking}`} icon={Trophy} tone="gold" /><StatCard label="Điểm tích lũy" value={String(myRank?.points ?? 0)} icon={Star} tone="blue" /><StatCard label="Tỷ lệ thắng" value={`${jockeyProfile.winRate}%`} icon={TrendingUp} tone="green" /><StatCard label="Tổng jockey" value={String(rankings.length)} icon={Medal} tone="purple" /></div>
      <GlassCard><div className="p-5 border-b border-white/10"><h2 className="font-bold text-white">Bảng xếp hạng mùa 2026</h2></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-white/10"><th className="text-left px-5 py-3 text-[11px] text-white/40">Hạng</th><th className="text-left px-5 py-3 text-[11px] text-white/40">Jockey</th><th className="text-right px-5 py-3 text-[11px] text-white/40">Thắng</th><th className="text-right px-5 py-3 text-[11px] text-white/40">Race</th><th className="text-right px-5 py-3 text-[11px] text-white/40">Tỷ lệ</th><th className="text-right px-5 py-3 text-[11px] text-white/40">Điểm</th></tr></thead><tbody>{rankings.map((r) => <tr key={r.rank} className={`border-b border-white/[0.06] ${r.isMe ? 'bg-[#D4A017]/5' : 'hover:bg-white/[0.03]'}`}><td className="px-5 py-4">#{r.rank}</td><td className="px-5 py-4 text-white">{r.name}</td><td className="px-5 py-4 text-right text-[#D4A017] font-bold">{r.wins}</td><td className="px-5 py-4 text-right text-white/70">{r.races}</td><td className="px-5 py-4 text-right text-emerald-300 font-bold">{r.winRate}%</td><td className="px-5 py-4 text-right text-white font-bold">{r.points}</td></tr>)}</tbody></table></div></GlassCard>
    </JockeyLayout>
  )
}
