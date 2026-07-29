import { useEffect, useMemo, useState } from 'react';
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
import { useAuthStore } from '@/store/authStore';
import { refereeService } from '@/services/refereeService';
import { getApiErrorMessage } from '@/utils/apiError';

export function RefereeHistory() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.fullName || user?.username || 'Trọng tài';
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const data = await refereeService.loadRefereeHistoryRaces();
        if (!cancelled) setRaces(data);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err) || 'Không tải được lịch sử điều hành');
          setRaces([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const confirmedCount = useMemo(
    () => races.filter((race) => race.resultFinalizedAt).length,
    [races],
  );

  return (
    <RefereeLayout
      title="Trọng tài · Lịch sử điều hành"
      subtitle="Tất cả race đã chốt kết quả và báo cáo đã nộp"
      actions={<GhostButton icon={Download}>Xuất báo cáo PDF</GhostButton>}
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Race đã điều hành" value={loading ? '...' : String(races.length)} icon={Flag} tone="gold" />
        <StatCard label="Vi phạm đã ghi" value="0" icon={AlertTriangle} tone="purple" />
        <StatCard label="Kết quả xác nhận" value={loading ? '...' : String(confirmedCount)} icon={CheckCircle2} tone="green" />
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
          {loading && (
            <div className="text-center py-12 text-white/40 text-sm">Đang tải lịch sử...</div>
          )}
          {!loading && races.length === 0 && (
            <div className="text-center py-12 text-white/40 text-sm">Chưa có race đã kết thúc.</div>
          )}
          {races.map((r) => (
            <div
              key={r.id}
              className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-[#D4A017]/40 transition-all"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#D4A017] to-[#B8941F] rounded-xl flex items-center justify-center font-bold shadow-md shadow-[#D4A017]/30 text-white text-sm px-1">
                    {typeof r.no === 'number' ? `R${r.no}` : 'R'}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{r.name}</div>
                    <div className="text-[11px] text-white/50">{r.tournamentName}</div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
                      <Calendar className="w-3 h-3" />
                      <span>{r.date} · {r.time}</span>
                      <span>·</span>
                      <span>{r.distance}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone="purple">{r.statusLabel}</Pill>
                  {r.resultFinalizedAt ? <Pill tone="green">Kết quả xác nhận</Pill> : null}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <Tile icon={Crown} label="Vô địch" value={r.winnerDisplay} tone="gold" />
                <Tile icon={CheckCircle2} label="Hoàn thành" value={`${r.checkedInDisplay} / ${r.participantCount}`} tone="green" />
                <Tile icon={AlertTriangle} label="Vi phạm" value="0" tone="gray" />
                <Tile icon={Trophy} label="Tiền thưởng" value={r.prizeDisplay} tone="gold" />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="text-[10px] text-white/40">
                  {r.resultFinalizedAt
                    ? `Kết quả xác nhận lúc ${new Date(r.resultFinalizedAt).toLocaleString('vi-VN')}`
                    : 'Chưa có thời gian chốt kết quả từ API'}
                  {' · '}Ký số bởi {displayName}
                </div>
                <Link
                  to={`/referee/races/${r.id}`}
                  className="text-xs text-[#D4A017] hover:underline font-semibold inline-flex items-center gap-1"
                >
                  Xem chi tiết <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
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
      <div className="text-sm font-bold text-white break-words">{value}</div>
    </div>
  );
}
