import { Link } from 'react-router-dom';
import {
  Flag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Activity,
  Gavel,
  ClipboardCheck,
  Calendar,
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, StatCard, Pill } from '@/pages/admin/AdminLayout';
import { assignedRaces, violations, raceStatusTone } from './data';
import { useAuthStore } from '@/store/authStore';

export function RefereeDashboard() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.fullName || user?.username || 'Trọng tài';
  const today = '2026-05-24';
  const todayRaces = assignedRaces.filter((r) => r.date === today);
  const upcoming = assignedRaces.filter((r) => r.status === 'Sắp diễn ra' || r.status === 'Đang check-in');
  const completed = assignedRaces.filter((r) => r.status === 'Đã kết thúc');
  const totalCheckedIn = assignedRaces.reduce((s, r) => s + r.checkedIn, 0);
  const pendingCheckins = assignedRaces
    .filter((r) => r.status === 'Đang check-in' || r.status === 'Sắp diễn ra')
    .reduce((s, r) => s + (r.totalHorses - r.checkedIn), 0);

  return (
    <RefereeLayout
      title="Trọng tài · Tổng quan"
      subtitle={`Chào ${displayName} · Hôm nay bạn có ${todayRaces.length} race cần điều hành`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Race hôm nay" value={String(todayRaces.length)} icon={Flag} tone="gold" delta={`+${upcoming.length} sắp tới`} />
        <StatCard label="Đã check-in" value={String(totalCheckedIn)} icon={CheckCircle2} tone="green" />
        <StatCard label="Chờ check-in" value={String(pendingCheckins)} icon={Clock} tone="blue" />
        <StatCard label="Vi phạm tuần này" value={String(violations.length)} icon={AlertTriangle} tone="purple" />
      </div>

      <div className="space-y-6">
          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Lịch race hôm nay</h2>
                  <p className="text-xs text-white/50">{today} · Phú Thọ Racecourse</p>
                </div>
              </div>
              <Link to="/referee/races" className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {todayRaces.length === 0 && (
                <div className="text-center text-white/40 py-8 text-sm">Hôm nay không có race nào được giao.</div>
              )}
              {todayRaces.map((r) => {
                const pct = Math.round((r.checkedIn / r.totalHorses) * 100);
                return (
                  <Link
                    key={r.id}
                    to={`/referee/races/${r.id}`}
                    className="block p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-[#D4A017]/40 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center shrink-0 w-16">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">Giờ</div>
                        <div className="text-xl font-bold text-[#D4A017]">{r.time}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold text-[#D4A017] bg-[#D4A017]/15 px-2 py-0.5 rounded-md border border-[#D4A017]/30">
                            R{r.no}
                          </span>
                          <h3 className="font-bold text-white text-sm truncate">{r.name}</h3>
                          <Pill tone={raceStatusTone(r.status)}>{r.status}</Pill>
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          {r.tournamentName} · {r.distance} · {r.surface} · {r.track}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-[#D4A017] to-[#E5B82F]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-white/60 font-mono shrink-0">
                            {r.checkedIn}/{r.totalHorses} check-in
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#D4A017] group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Race timeline · 24h</h2>
                <p className="text-xs text-white/50">Hoạt động trọng tài gần nhất</p>
              </div>
            </div>
            <div className="p-5">
              <div className="relative pl-6 border-l-2 border-white/10 space-y-5">
                {[
                  { icon: CheckCircle2, color: 'emerald', text: 'Xác nhận kết quả Race R2 Saigon Derby', time: '08:12' },
                  { icon: AlertTriangle, color: 'red', text: 'Ghi nhận vi phạm "Lái nguy hiểm" · ngựa #5 Storm Chaser', time: 'Hôm qua 15:48' },
                  { icon: ClipboardCheck, color: 'gold', text: 'Check-in 12/12 ngựa Race R2 Saigon Derby', time: 'Hôm qua 14:50' },
                  { icon: Gavel, color: 'blue', text: 'Được phân công Race R3 (Bán kết) Vietnam GP', time: 'Hôm qua 09:30' },
                ].map((e, i) => {
                  const Icon = e.icon;
                  const map = {
                    emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    red: 'bg-red-500/15 text-red-300 border-red-500/30',
                    gold: 'bg-[#D4A017]/15 text-[#D4A017] border-[#D4A017]/30',
                    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
                  };
                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[34px] w-7 h-7 rounded-full border flex items-center justify-center ${map[e.color]}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-sm text-white/90">{e.text}</div>
                      <div className="text-[11px] text-white/40 mt-0.5">{e.time}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
      </div>
    </RefereeLayout>
  );
}
