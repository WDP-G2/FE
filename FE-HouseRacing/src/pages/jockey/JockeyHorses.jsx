import { useEffect, useState } from "react";
import { PawPrint, Trophy, Activity, FileText } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { GlassCard, Pill, StatCard } from "../admin/AdminLayout";
import { jockeyService } from "@/services/jockeyService";
import { buildAssignedHorses } from "@/utils/jockeyViewUtils";
import { formatDisplayDate } from "@/utils/dateFormat";
import { getApiErrorMessage } from "@/utils/apiError";

export function JockeyHorses() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const invitations = await jockeyService.getJockeyInvitations();
        if (!active) return;
        setHorses(buildAssignedHorses(invitations));
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err) || "Không thể tải danh sách ngựa");
        setHorses([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <JockeyLayout
      title="Jockey · Ngựa được giao"
      subtitle={loading ? "Đang tải..." : `${horses.length} ngựa từ lời mời đã nhận`}
    >
      {error && (
        <GlassCard className="mb-6 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </GlassCard>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng ngựa được giao" value={String(horses.length)} icon={PawPrint} tone="gold" />
        <StatCard
          label="Đang thi đấu"
          value={String(horses.filter((h) => h.healthTone === "green").length)}
          icon={Activity}
          tone="green"
        />
        <StatCard label="Giải liên quan" value={String(new Set(horses.map((h) => h.tournament)).size)} icon={Trophy} tone="blue" />
        <StatCard label="Chủ ngựa" value={String(new Set(horses.map((h) => h.owner)).size)} icon={Activity} tone="purple" />
      </div>

      {loading ? (
        <GlassCard className="p-10 text-center text-white/50">Đang tải danh sách ngựa...</GlassCard>
      ) : horses.length === 0 ? (
        <GlassCard className="p-10 text-center text-white/50">
          Chưa có ngựa nào từ lời mời đã chấp nhận.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {horses.map((h) => (
            <GlassCard key={h.id}>
              <div className="h-36 bg-gradient-to-br from-[#D4A017]/10 to-[#0F1E3A] rounded-t-2xl flex items-center justify-center relative">
                <PawPrint className="w-20 h-20 text-[#D4A017]/25" />
                <div className="absolute top-3 left-3">
                  <Pill tone={h.healthTone}>{h.health}</Pill>
                </div>
                <div className="absolute top-3 right-3 text-right">
                  <div className="text-[10px] text-white/50">Chủ ngựa</div>
                  <div className="text-xs font-semibold text-white">{h.owner}</div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-white text-lg">{h.name}</h3>
                <p className="text-sm text-white/50">{h.tournament}</p>
                <div className="mt-3 p-3 bg-[#D4A017]/10 border border-[#D4A017]/20 rounded-xl flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#D4A017]" />
                  <div>
                    <div className="text-xs font-semibold text-white">{h.tournament}</div>
                    <div className="text-[10px] text-white/50">
                      Race: {formatDisplayDate(h.lastRace)}
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-white/[0.04] rounded-xl border border-white/10">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                      Ghi chú
                    </span>
                  </div>
                  <p className="text-xs text-white/70">{h.notes}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </JockeyLayout>
  );
}
