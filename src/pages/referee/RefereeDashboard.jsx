import { Link } from 'react-router-dom';
import {
  Flag,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Activity,
  Calendar,
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, StatCard, Pill } from '@/pages/admin/AdminLayout';
import { useRefereeViolations } from './refereeViolationsMock';
import { useAuthStore } from '@/store/authStore';
import { useRefereeRaces } from './useRefereeRaces';
import { isRaceToday, missingBe, raceStatusTone } from '@/utils/refereeRaceUtils';

export function RefereeDashboard() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.fullName || user?.username || 'Trọng tài';
  const violations = useRefereeViolations();
  const { races, loading, error } = useRefereeRaces();

  const todayRaces = races.filter((r) => isRaceToday(r.scheduledStartAt));
  const upcoming = races.filter((r) => r.tabBucket === 'upcoming');
  const completed = races.filter((r) => r.tabBucket === 'completed');
  const pendingCheckins = missingBe('Đã Check-in');

  return (
    <RefereeLayout
      title="Trọng tài · Tổng quan"
      subtitle={`Chào ${displayName} · Hôm nay bạn có ${todayRaces.length} race cần điều hành`}
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Race hôm nay" value={String(todayRaces.length)} icon={Flag} tone="gold" delta={`+${upcoming.length} sắp tới`} />
        <StatCard label="Đã check-in" value={pendingCheckins} icon={CheckCircle2} tone="green" />
        <StatCard label="Chờ check-in" value={pendingCheckins} icon={Clock} tone="blue" />
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
                  <p className="text-xs text-white/50">{loading ? 'Đang tải...' : 'Theo ngày thi đấu từ API'}</p>
                </div>
              </div>
              <Link to="/referee/races" className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {loading && (
                <div className="text-center text-white/40 py-8 text-sm">Đang tải danh sách cuộc đua...</div>
              )}
              {!loading && todayRaces.length === 0 && (
                <div className="text-center text-white/40 py-8 text-sm">Hôm nay không có race nào được giao.</div>
              )}
              {todayRaces.map((r) => (
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
                            {typeof r.no === 'number' ? `R${r.no}` : r.no}
                          </span>
                          <h3 className="font-bold text-white text-sm truncate">{r.name}</h3>
                          <Pill tone={raceStatusTone(r.status)}>{r.statusLabel}</Pill>
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          {r.tournamentName} · {r.distance} · {r.track}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-0 bg-gradient-to-r from-[#D4A017] to-[#E5B82F]" />
                          </div>
                          <span className="text-[11px] text-white/60 font-mono shrink-0">
                            {r.checkedInDisplay} / {r.participantCount}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#D4A017] group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </Link>
                ))}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Race timeline · 24h</h2>
                <p className="text-xs text-white/50">{missingBe('Timeline hoạt động')}</p>
              </div>
            </div>
            <div className="p-5">
              <div className="text-center py-10 text-white/45 text-sm">
                {missingBe('Lịch sử hoạt động trọng tài')}
                <div className="text-xs mt-2 text-white/35">
                  Đã hoàn thành {completed.length} race từ API · Vi phạm mock: {violations.length}
                </div>
              </div>
            </div>
          </GlassCard>
      </div>
    </RefereeLayout>
  );
}
