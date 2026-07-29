import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { GlassCard, Pill } from "../../../admin/AdminLayout";
import { formatDisplayDate } from "@/utils/dateFormat";

export function UpcomingSchedulesCard({ loading, schedules }) {
  return (
    <GlassCard>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#D4A017]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Lịch race sắp tới</h2>
            <p className="text-xs text-white/50">Race đã đăng ký</p>
          </div>
        </div>
        <Link
          to="/jockey/schedules"
          className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1"
        >
          Xem tất cả <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="p-5 space-y-3">
        {loading ? (
          <p className="text-sm text-white/50">Đang tải lịch...</p>
        ) : schedules.length === 0 ? (
          <p className="text-sm text-white/50">Chưa có lịch race nào.</p>
        ) : (
          schedules.slice(0, 3).map((s) => (
            <div
              key={s.id}
              className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-[#D4A017]/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="text-center shrink-0 w-16">
                  <div className="text-[10px] text-white/40 uppercase tracking-wider">Giờ</div>
                  <div className="text-xl font-bold text-[#D4A017]">{s.time}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Pill tone={s.statusTone}>{s.status}</Pill>
                    <h3 className="font-bold text-white text-sm truncate">{s.tournament}</h3>
                  </div>
                  <div className="text-[11px] text-white/50">
                    {s.race} · Ngựa: {s.horse}
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    {formatDisplayDate(s.date)} · {s.location}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/30 shrink-0" />
              </div>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
