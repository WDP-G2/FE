import { useEffect, useState } from "react";
import { Calendar, MapPin, CheckCircle, Clock, PawPrint } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { GlassCard, Pill, PrimaryButton } from "../admin/AdminLayout";
import { toast } from "sonner";
import { tournamentService } from "@/services/tournamentService";
import { buildScheduleItems } from "./jockeyMappings";

export function JockeySchedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    tournamentService
      .listJockeyRegistrations()
      .then((list) => {
        if (!alive) return;
        setSchedules(buildScheduleItems(Array.isArray(list) ? list : []));
      })
      .catch(() => {
        if (!alive) return;
        setSchedules([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  const confirm = (id) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "Xác nhận", statusTone: "green" } : s,
      ),
    );
    toast.success("Đã xác nhận tham gia race");
  };
  const checkin = (id) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checkedIn: true } : s)),
    );
    toast.success("Check-in thành công!");
  };
  return (
    <JockeyLayout
      title="Jockey · Lịch thi đấu"
      subtitle={`${schedules.length} race đã đăng ký`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#D4A017]" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {schedules.length}
            </div>
            <div className="text-xs text-white/50">Tổng race</div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {schedules.filter((s) => s.status === "Xác nhận").length}
            </div>
            <div className="text-xs text-white/50">Đã xác nhận</div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {schedules.filter((s) => s.status !== "Xác nhận").length}
            </div>
            <div className="text-xs text-white/50">Chờ xác nhận</div>
          </div>
        </GlassCard>
      </div>
      <div className="space-y-4">
        {loading ? (
          <GlassCard className="p-6 text-center text-white/50">
            Đang tải lịch thi đấu...
          </GlassCard>
        ) : (
          schedules.map((s) => (
            <GlassCard key={s.id}>
              <div className="p-5">
                <div className="flex items-start gap-5">
                  <div className="shrink-0 text-center p-3 bg-[#D4A017]/10 border border-[#D4A017]/20 rounded-xl w-20">
                    <div className="text-[10px] text-[#D4A017] uppercase tracking-wider font-bold">
                      {new Date(s.date).toLocaleDateString("vi-VN", {
                        month: "short",
                      })}
                    </div>
                    <div className="text-2xl font-bold text-[#D4A017]">
                      {new Date(s.date).getDate()}
                    </div>
                    <div className="text-sm font-bold text-white">{s.time}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Pill tone={s.statusTone}>{s.status}</Pill>
                      {s.checkedIn && (
                        <Pill tone="green">
                          <CheckCircle className="w-3 h-3" /> Đã check-in
                        </Pill>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {s.tournament}
                    </h3>
                    <p className="text-sm text-white/60">{s.race}</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <PawPrint className="w-3.5 h-3.5 text-[#D4A017]" />
                        Ngựa: {s.horse} · Chủ: {s.owner} · Lane #
                        {s.laneNo ?? "-"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <MapPin className="w-3.5 h-3.5 text-white/30" />
                        {s.location}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      {s.status === "Chờ xác nhận" && (
                        <PrimaryButton
                          icon={CheckCircle}
                          onClick={() => confirm(s.id)}
                        >
                          Xác nhận tham gia
                        </PrimaryButton>
                      )}
                      {s.status === "Xác nhận" && !s.checkedIn && (
                        <PrimaryButton
                          icon={CheckCircle}
                          onClick={() => checkin(s.id)}
                        >
                          Check-in
                        </PrimaryButton>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </JockeyLayout>
  );
}
