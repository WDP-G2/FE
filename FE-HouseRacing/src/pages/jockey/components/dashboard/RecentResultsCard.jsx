import { Link } from "react-router-dom";
import { ArrowRight, Medal } from "lucide-react";
import { GlassCard } from "../../../admin/AdminLayout";
import { formatDisplayDate } from "@/utils/dateFormat";

function positionClass(position) {
  if (position === 1) return "bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/40";
  if (position === 2) return "bg-slate-400/20 text-slate-300 border-slate-400/40";
  return "bg-amber-700/20 text-amber-600 border-amber-700/40";
}

export function RecentResultsCard({ results }) {
  return (
    <GlassCard>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
            <Medal className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Kết quả gần đây</h2>
            <p className="text-xs text-white/50">Lịch sử thi đấu</p>
          </div>
        </div>
        <Link
          to="/jockey/results"
          className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1"
        >
          Xem tất cả <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="p-5 space-y-3">
        {results.length === 0 ? (
          <p className="text-sm text-white/50">Chưa có kết quả thi đấu.</p>
        ) : (
          results.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${positionClass(r.position)}`}
              >
                #{r.position}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white truncate">{r.horse}</div>
                <div className="text-[11px] text-white/50">
                  {r.race} · {r.tournament}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[11px] text-white/40">{formatDisplayDate(r.date)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
