import { useState } from "react";
import {
  Trophy,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Search,
  Eye,
  X,
} from "lucide-react";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  PrimaryButton,
  GhostButton,
} from "../admin/AdminLayout";
import { tournaments, fmt } from "./data";
import { toast } from "sonner";
import { HorseOwnerInfoRow } from "./components/HorseOwnerInfoRow";
import { HorseOwnerStatBox } from "./components/HorseOwnerStatBox";

export function HorseOwnerTournaments() {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);

  const filtered = tournaments.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <HorseOwnerLayout
      title="Horse Owner · Giải đấu"
      subtitle="Danh sách giải đấu đang mở đăng ký và sắp diễn ra"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm giải đấu, địa điểm..."
            className="pl-10 pr-4 py-2.5 w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4A017]/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((t) => (
          <GlassCard key={t.id} className="overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-[#D4A017]/20 via-[#0F1E3A] to-[#0A1628] flex items-center justify-center relative">
              <Trophy className="w-14 h-14 text-[#D4A017]/25" />
              <div className="absolute top-3 left-3">
                <Pill tone={t.statusTone}>{t.status}</Pill>
              </div>
              <div className="absolute bottom-3 right-3 text-right">
                <div className="text-[10px] text-white/50">Prize Pool</div>
                <div className="text-sm font-bold text-[#D4A017]">
                  {fmt(t.prizePool)}
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-white text-base mb-1">{t.name}</h3>
              <p className="text-xs text-white/50 mb-4">{t.description}</p>
              <div className="space-y-2 mb-4">
                <HorseOwnerInfoRow icon={MapPin} text={t.location} />
                <HorseOwnerInfoRow
                  icon={Calendar}
                  text={`${t.startDate} → ${t.endDate}`}
                />
                <HorseOwnerInfoRow
                  icon={Calendar}
                  text={`Hạn đăng ký: ${t.deadline}`}
                  highlight
                />
                <HorseOwnerInfoRow
                  icon={DollarSign}
                  text={`Entry fee: ${fmt(t.entryFee)}`}
                />
                <HorseOwnerInfoRow
                  icon={Users}
                  text={`${t.registeredHorses} / ${t.maxHorses} ngựa đã đăng ký`}
                />
              </div>
              <div className="flex gap-2">
                <GhostButton
                  icon={Eye}
                  className="flex-1"
                  onClick={() => setDetail(t)}
                >
                  Chi tiết
                </GhostButton>
                {t.status === "Đang mở đăng ký" && (
                  <PrimaryButton
                    className="flex-1"
                    onClick={() =>
                      toast.success(`Đã chuyển đến trang đăng ký · ${t.name}`)
                    }
                  >
                    Đăng ký ngay
                  </PrimaryButton>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <GlassCard className="w-full max-w-lg">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-[#D4A017]" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-base">
                    {detail.name}
                  </h2>
                  <p className="text-xs text-white/50">{detail.location}</p>
                </div>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <HorseOwnerStatBox
                  label="Prize Pool"
                  value={fmt(detail.prizePool)}
                  tone="gold"
                />
                <HorseOwnerStatBox
                  label="Entry Fee"
                  value={fmt(detail.entryFee)}
                  tone="blue"
                />
                <HorseOwnerStatBox
                  label="Ngựa đã đăng ký"
                  value={`${detail.registeredHorses}/${detail.maxHorses}`}
                  tone="green"
                />
                <HorseOwnerStatBox
                  label="Trạng thái"
                  value={detail.status}
                  tone={detail.statusTone}
                />
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </HorseOwnerLayout>
  );
}
