import { useEffect, useMemo, useState } from "react";
import { BarChart3, Trophy, Medal, TrendingUp } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { GlassCard, StatCard } from "../admin/AdminLayout";
import { jockeyService } from "@/services/jockeyService";
import { buildJockeyResults } from "@/utils/jockeyViewUtils";
import { formatDisplayDate } from "@/utils/dateFormat";
import { fmtVND } from "@/utils/formatCurrency";
import { getApiErrorMessage } from "@/utils/apiError";

const positionColor = (pos) =>
  pos === 1
    ? "bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/40"
    : pos === 2
      ? "bg-slate-400/20 text-slate-300 border-slate-400/40"
      : pos === 3
        ? "bg-amber-700/20 text-amber-600 border-amber-700/40"
        : "bg-white/10 text-white/60 border-white/20";

export function JockeyResults() {
  const [profile, setProfile] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const [profileData, performanceData] = await Promise.all([
          jockeyService.getMyProfile(),
          jockeyService.getPerformance(),
        ]);
        if (!active) return;
        setProfile(profileData);
        setPerformance(performanceData);
        setResults(buildJockeyResults(profileData?.raceHistory ?? []));
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err) || "Không thể tải kết quả thi đấu");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const wins = Number(performance?.firstPlaces ?? profile?.wins ?? 0);
    const races = Number(performance?.raceCount ?? profile?.races ?? 0);
    const winRate =
      profile?.winRate ??
      (races > 0 ? ((wins / races) * 100).toFixed(1) : "0.0");
    const totalPrize =
      Number(performance?.totalJockeyPayout ?? 0) +
      Number(performance?.totalPrizePayout ?? 0);

    return { wins, races, winRate, totalPrize };
  }, [performance, profile]);

  return (
    <JockeyLayout
      title="Jockey · Kết quả thi đấu"
      subtitle="Lịch sử và thống kê hiệu suất cá nhân"
    >
      {error && (
        <GlassCard className="mb-6 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </GlassCard>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng chiến thắng" value={String(stats.wins)} icon={Trophy} tone="gold" />
        <StatCard label="Tổng race" value={String(stats.races)} icon={BarChart3} tone="blue" />
        <StatCard label="Tỷ lệ thắng" value={`${stats.winRate}%`} icon={TrendingUp} tone="green" />
        <StatCard label="Tổng thưởng" value={fmtVND(stats.totalPrize)} icon={Medal} tone="purple" />
      </div>

      <GlassCard>
        <div className="p-5 border-b border-white/10">
          <h2 className="font-bold text-white">Lịch sử kết quả</h2>
        </div>
        {loading ? (
          <div className="p-10 text-center text-white/50">Đang tải dữ liệu...</div>
        ) : results.length === 0 ? (
          <div className="p-10 text-center text-white/50">Chưa có kết quả thi đấu.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-[11px] text-white/40">Hạng</th>
                  <th className="text-left px-5 py-3 text-[11px] text-white/40">Ngựa</th>
                  <th className="text-left px-5 py-3 text-[11px] text-white/40">Giải đấu</th>
                  <th className="text-left px-5 py-3 text-[11px] text-white/40">Thời gian</th>
                  <th className="text-left px-5 py-3 text-[11px] text-white/40">Ngày</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-white/[0.06] hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border ${positionColor(r.position)}`}
                      >
                        #{r.position}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-white">{r.horse}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-white/80">{r.race}</div>
                      <div className="text-[11px] text-white/50">{r.tournament}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-sky-300">{r.finishTime}</td>
                    <td className="px-5 py-4 text-sm text-white/50">{formatDisplayDate(r.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </JockeyLayout>
  );
}
