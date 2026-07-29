import { useEffect, useMemo, useState } from "react";
import { BarChart3, Trophy, TrendingUp, PawPrint } from "lucide-react";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { GlassCard, StatCard } from "../admin/AdminLayout";
import { horseService } from "@/services/horseService";
import { buildOwnerResults } from "@/utils/ownerViewUtils";
import { formatDisplayDate } from "@/utils/dateFormat";
import { fmtVND } from "@/utils/formatCurrency";
import { getApiErrorMessage } from "@/utils/apiError";

const positionColor = (pos) => {
  if (pos === 1) return "bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/40";
  if (pos === 2) return "bg-slate-400/20 text-slate-300 border-slate-400/40";
  if (pos === 3) return "bg-amber-700/20 text-amber-600 border-amber-700/40";
  return "bg-white/10 text-white/60 border-white/20";
};

export function HorseOwnerResults() {
  const [summary, setSummary] = useState({
    totalWins: 0,
    totalRaces: 0,
    totalPrize: 0,
    bestHorseName: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await horseService.getOwnerResults();
        if (!active) return;

        setSummary({
          totalWins: Number(data?.summary?.totalWins ?? 0),
          totalRaces: Number(data?.summary?.totalRaces ?? 0),
          totalPrize: Number(data?.summary?.totalPrize ?? 0),
          bestHorseName: data?.summary?.bestHorseName || "",
        });
        setResults(buildOwnerResults(data?.results ?? []));
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err) || "Không thể tải kết quả thi đấu");
        setSummary({
          totalWins: 0,
          totalRaces: 0,
          totalPrize: 0,
          bestHorseName: "",
        });
        setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const bestHorseLabel = useMemo(() => {
    if (summary.bestHorseName) return summary.bestHorseName;
    return "—";
  }, [summary.bestHorseName]);

  return (
    <HorseOwnerLayout
      title="Horse Owner · Kết quả thi đấu"
      subtitle="Lịch sử và thống kê hiệu suất thi đấu"
    >
      {error && (
        <GlassCard className="mb-6 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </GlassCard>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Tổng lần thắng"
          value={String(summary.totalWins)}
          icon={Trophy}
          tone="gold"
        />
        <StatCard
          label="Tổng race tham gia"
          value={String(summary.totalRaces)}
          icon={BarChart3}
          tone="blue"
        />
        <StatCard
          label="Tổng tiền thưởng"
          value={fmtVND(summary.totalPrize)}
          icon={TrendingUp}
          tone="green"
        />
        <StatCard
          label="Ngựa xuất sắc nhất"
          value={bestHorseLabel}
          icon={PawPrint}
          tone="purple"
        />
      </div>
      <GlassCard>
        <div className="p-5 border-b border-white/10">
          <h2 className="font-bold text-white">Lịch sử kết quả</h2>
        </div>
        {loading ? (
          <div className="p-10 text-center text-white/50">Đang tải dữ liệu...</div>
        ) : results.length === 0 ? (
          <div className="p-10 text-center text-white/50">
            Chưa có kết quả thi đấu đã chốt.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">
                    Hạng
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">
                    Ngựa
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">
                    Giải đấu
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">
                    Thời gian
                  </th>
                  <th className="text-right px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">
                    Thưởng
                  </th>
                  <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">
                    Ngày
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border ${positionColor(r.position)}`}
                      >
                        #{r.position}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-bold text-white">{r.horse}</div>
                      <div className="text-[11px] text-white/50">Jockey: {r.jockey}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-white/80">{r.race}</div>
                      <div className="text-[11px] text-white/50">{r.tournament}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-sky-300">
                      {r.finishTime}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-emerald-300">
                        +{fmtVND(r.prize)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/50">
                      {formatDisplayDate(r.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </HorseOwnerLayout>
  );
}
