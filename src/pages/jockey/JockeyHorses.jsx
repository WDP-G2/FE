import { useEffect, useMemo, useState } from "react";
import { PawPrint, Trophy, Activity, FileText, X } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { GlassCard, Pill, StatCard, GhostButton } from "../admin/AdminLayout";
import { tournamentService } from "@/services/tournamentService";
import { buildAssignedHorses } from "./jockeyMappings";

function calculateAge(birthDate, fallbackAge) {
  if (!birthDate) return "—";
  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) {
    return Number.isFinite(fallbackAge) ? String(fallbackAge) : "—";
  }
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }
  if (age >= 0) return age;
  return Number.isFinite(fallbackAge) ? String(fallbackAge) : "—";
}

export function JockeyHorses() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHorse, setSelectedHorse] = useState(null);

  useEffect(() => {
    let alive = true;
    tournamentService
      .listJockeyRegistrations()
      .then((list) => {
        if (!alive) return;
        setRegistrations(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!alive) return;
        setRegistrations([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const assignedHorses = useMemo(
    () => buildAssignedHorses(registrations),
    [registrations],
  );

  return (
    <JockeyLayout
      title="Jockey · Ngựa được assign"
      subtitle={`${assignedHorses.length} ngựa được giao trong các giải đấu hiện tại`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Tổng ngựa được giao"
          value={String(assignedHorses.length)}
          icon={PawPrint}
          tone="gold"
        />
        <StatCard
          label="Sức khỏe tốt"
          value={String(
            assignedHorses.filter((h) => h.health === "Tốt").length,
          )}
          icon={Activity}
          tone="green"
        />
        <StatCard
          label="Race sắp tới"
          value={String(assignedHorses.length)}
          icon={Trophy}
          tone="blue"
        />
        <StatCard
          label="Tổng race đã chạy"
          value={String(assignedHorses.reduce((s, h) => s + h.races, 0))}
          icon={Activity}
          tone="purple"
        />
      </div>
      {loading && (
        <GlassCard className="p-6 text-center text-white/50">
          Đang tải danh sách ngựa...
        </GlassCard>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignedHorses.map((h) => (
          <GlassCard key={h.id}>
            <div className="h-36 bg-gradient-to-br from-[#D4A017]/10 to-[#0F1E3A] rounded-t-2xl flex items-center justify-center relative">
              {h.imageUrl ? (
                <img
                  src={h.imageUrl}
                  alt={h.name}
                  className="h-full w-full object-cover rounded-t-2xl"
                />
              ) : (
                <PawPrint className="w-20 h-20 text-[#D4A017]/25" />
              )}
              <div className="absolute top-3 left-3">
                <Pill tone={h.healthTone}>{h.health}</Pill>
              </div>
              <div className="absolute top-3 right-3 text-right">
                <div className="text-[10px] text-white/50">Chủ ngựa</div>
                <div className="text-xs font-semibold text-white">
                  {h.owner}
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-white text-lg">{h.name}</h3>
              <div className="mt-3 p-3 bg-[#D4A017]/10 border border-[#D4A017]/20 rounded-xl flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#D4A017]" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    {h.tournament}
                  </div>
                  <div className="text-[10px] text-white/50">
                    Race tiếp theo: {h.lastRace}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <GhostButton
                  className="w-full"
                  onClick={() => setSelectedHorse(h)}
                >
                  Xem thông tin
                </GhostButton>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {selectedHorse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {selectedHorse.name}
                </h2>
                <p className="text-sm text-white/45">
                  Thông tin ngựa được ghép thi đấu
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHorse(null)}
                className="rounded-lg p-2 transition hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                {selectedHorse.imageUrl ? (
                  <img
                    src={selectedHorse.imageUrl}
                    alt={selectedHorse.name}
                    className="h-64 w-full object-cover"
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <PawPrint className="h-20 w-20 text-[#D4A017]/30" />
                  </div>
                )}
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Pill tone={selectedHorse.healthTone}>
                      {selectedHorse.health}
                    </Pill>
                    <Pill tone="gold">{selectedHorse.tournament}</Pill>
                  </div>
                  <p className="text-sm text-white/60">
                    {selectedHorse.breed} · {selectedHorse.gender}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <DetailRow label="Chủ ngựa" value={selectedHorse.owner} />
                <DetailRow
                  label="Tuổi"
                  value={`${calculateAge(selectedHorse.birthDate, selectedHorse.age)} tuổi`}
                />
                <DetailRow
                  label="Số race"
                  value={String(selectedHorse.races ?? 0)}
                />
                <DetailRow
                  label="Số thắng"
                  value={String(selectedHorse.wins ?? 0)}
                />
                <DetailRow
                  label="Race gần nhất"
                  value={selectedHorse.lastRace || "Chưa cập nhật"}
                />
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    Ghi chú
                  </div>
                  <p className="text-xs text-white/70">{selectedHorse.notes}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </JockeyLayout>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
      <span className="text-white/45">{label}</span>
      <span className="text-white font-semibold text-right">{value}</span>
    </div>
  );
}
