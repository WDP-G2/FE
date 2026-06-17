import { Link } from 'react-router-dom';
import {
  History,
  Trophy,
  Flag,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  Crown,
  Download,
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, Pill, StatCard, GhostButton } from '@/pages/admin/AdminLayout';
import { assignedRaces, violations } from './data';
import { useAuthStore } from '@/store/authStore';

export function RefereeHistory() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.fullName || user?.username || 'Trọng tài';
  const completed = assignedRaces.filter((r) => r.status === 'Đã kết thúc');

  return (
    <RefereeLayout
      title="Trọng tài · Lịch sử điều hành"
      subtitle="Tất cả race đã hoàn thành và báo cáo đã nộp"
      actions={<GhostButton icon={Download}>Xuất báo cáo PDF</GhostButton>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Race đã điều hành" value={String(completed.length)} icon={Flag} tone="gold" />
        <StatCard label="Vi phạm đã ghi" value={String(violations.length)} icon={AlertTriangle} tone="purple" />
        <StatCard label="Kết quả xác nhận" value={String(completed.length)} icon={CheckCircle2} tone="green" delta="100%" />
        <StatCard label="Khiếu nại" value="0" icon={Trophy} tone="blue" />
      </div>

      <GlassCard>
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
            <History className="w-5 h-5 text-[#D4A017]" />
          </div>
          <div>
            <h2 className="font-bold text-white">Race đã điều hành</h2>
            <p className="text-xs text-white/50">Sắp xếp theo ngày gần nhất</p>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {completed.map((r) => {
            const vlist = violations.filter((v) => v.raceId === r.id);
            return (
              <div key={r.id} className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-[#D4A017]/40 transition-all">
                <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#D4A017] to-[#B8941F] rounded-xl flex items-center justify-center font-bold shadow-md shadow-[#D4A017]/30">
                      R{r.no}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{r.name}</div>
                      <div className="text-[11px] text-white/50">{r.tournamentName}</div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
                        <Calendar className="w-3 h-3" />
                        <span>{r.date} · {r.time}</span>
                        <span>·</span>
                        <span>{r.distance} · {r.surface}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone="purple">Đã kết thúc</Pill>
                    <Pill tone="green">Kết quả xác nhận</Pill>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  <Tile icon={Crown} label="Vô địch" value="Thunder Bolt" tone="gold" />
                  <Tile icon={CheckCircle2} label="Hoàn thành" value={`${r.totalHorses}/${r.totalHorses}`} tone="green" />
                  <Tile icon={AlertTriangle} label="Vi phạm" value={String(vlist.length)} tone={vlist.length > 0 ? 'red' : 'gray'} />
                  <Tile icon={Trophy} label="Tiền thưởng" value="500M VNĐ" tone="gold" />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="text-[10px] text-white/40">
                    Báo cáo nộp lúc {r.date} 18:00 · Ký số bởi {displayName}
                  </div>
                  <Link
                    to={`/referee/races/${r.id}`}
                    className="text-xs text-[#D4A017] hover:underline font-semibold inline-flex items-center gap-1"
                  >
                    Xem chi tiết <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </RefereeLayout>
  );
}

function Tile({ icon: Icon, label, value, tone }) {
  const map = {
    gold: 'bg-[#D4A017]/10 border-[#D4A017]/30 text-[#D4A017]',
    green: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    red: 'bg-red-500/10 border-red-500/30 text-red-300',
    gray: 'bg-white/5 border-white/10 text-white/50',
  };
  return (
    <div className={`p-3 border rounded-xl ${map[tone]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-wider font-bold">{label}</span>
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}
