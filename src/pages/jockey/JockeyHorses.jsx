import { PawPrint, Trophy, Activity, FileText } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { GlassCard, Pill, StatCard } from "../admin/AdminLayout";
import { assignedHorses } from "./data";

export function JockeyHorses() {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignedHorses.map((h) => (
          <GlassCard key={h.id}>
            <div className="h-36 bg-gradient-to-br from-[#D4A017]/10 to-[#0F1E3A] rounded-t-2xl flex items-center justify-center relative">
              <PawPrint className="w-20 h-20 text-[#D4A017]/25" />
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
              <p className="text-sm text-white/50">
                {h.breed} · {h.color} · {h.age} tuổi · {h.weight}kg
              </p>
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
              <div className="mt-3 p-3 bg-white/[0.04] rounded-xl border border-white/10">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <FileText className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                    Ghi chú huấn luyện
                  </span>
                </div>
                <p className="text-xs text-white/70">{h.notes}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </JockeyLayout>
  );
}
