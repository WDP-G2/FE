import { useEffect, useState } from "react";
import { Calendar, MapPin, PawPrint } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { GlassCard, Pill } from "../admin/AdminLayout";
import { jockeyService } from "@/services/jockeyService";
import { buildJockeySchedules } from "@/utils/jockeyViewUtils";
import { formatDisplayDate } from "@/utils/dateFormat";
import { getApiErrorMessage } from "@/utils/apiError";

export function JockeySchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const [races, invitations] = await Promise.all([
          jockeyService.getRaces(),
          jockeyService.getJockeyInvitations(),
        ]);
        if (!active) return;
        setSchedules(buildJockeySchedules(races, invitations));
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err) || "Không thể tải lịch thi đấu");
        setSchedules([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const confirmedCount = schedules.filter((item) =>
    ["Đã lên lịch", "Đang đua", "Hoàn thành", "Đã chốt kết quả"].includes(item.status),
  ).length;

  return (
    <JockeyLayout
      title="Jockey · Lịch thi đấu"
      subtitle={loading ? "Đang tải..." : `${schedules.length} race đã đăng ký`}
    >
      {error && (
        <GlassCard className="mb-6 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </GlassCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#D4A017]" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{schedules.length}</div>
            <div className="text-xs text-white/50">Tổng race</div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{confirmedCount}</div>
            <div className="text-xs text-white/50">Đã có lịch</div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {Math.max(schedules.length - confirmedCount, 0)}
            </div>
            <div className="text-xs text-white/50">Khác</div>
          </div>
        </GlassCard>
      </div>

      {loading ? (
        <GlassCard className="p-10 text-center text-white/50">Đang tải lịch thi đấu...</GlassCard>
      ) : schedules.length === 0 ? (
        <GlassCard className="p-10 text-center text-white/50">Chưa có lịch race nào.</GlassCard>
      ) : (
        <div className="space-y-4">
          {schedules.map((s) => (
            <GlassCard key={s.id}>
              <div className="p-5">
                <div className="flex items-start gap-5">
                  <div className="shrink-0 text-center p-3 bg-[#D4A017]/10 border border-[#D4A017]/20 rounded-xl w-20">
                    <div className="text-[10px] text-[#D4A017] uppercase tracking-wider font-bold">
                      {formatDisplayDate(s.date).slice(0, 5)}
                    </div>
                    <div className="text-2xl font-bold text-[#D4A017]">
                      {formatDisplayDate(s.date).slice(6)}
                    </div>
                    <div className="text-sm font-bold text-white">{s.time}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Pill tone={s.statusTone}>{s.status}</Pill>
                    </div>
                    <h3 className="font-bold text-white text-base">{s.tournament}</h3>
                    <p className="text-sm text-white/60">{s.race}</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <PawPrint className="w-3.5 h-3.5 text-[#D4A017]" />
                        Ngựa: {s.horse} · Chủ: {s.owner}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <MapPin className="w-3.5 h-3.5 text-white/30" />
                        {s.location}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </JockeyLayout>
  );
}
