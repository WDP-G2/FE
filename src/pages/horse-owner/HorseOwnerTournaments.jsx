import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  DollarSign,
  Eye,
  MapPin,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  PrimaryButton,
  GhostButton,
} from "../admin/AdminLayout";
import { tournamentService } from "@/services/tournamentService";

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
}

function statusTone(status) {
  if (status === "Đang mở đăng ký") return "green";
  if (status === "Đang diễn ra") return "blue";
  if (status === "Đã kết thúc") return "gray";
  return "gold";
}

export function HorseOwnerTournaments() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const items = await tournamentService.listOwnerOpen();
        if (active) setTournaments(items);
      } catch (error) {
        console.error("Error loading owner tournaments:", error);
        toast.error("Không thể tải danh sách giải đấu đang mở");
        if (active) setTournaments([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tournaments;
    return tournaments.filter((tournament) => {
      return (
        tournament.name.toLowerCase().includes(query) ||
        tournament.location.toLowerCase().includes(query) ||
        tournament.description.toLowerCase().includes(query)
      );
    });
  }, [search, tournaments]);

  return (
    <HorseOwnerLayout
      title="Horse Owner · Giải đấu"
      subtitle="Chỉ hiển thị giải đã mở đăng ký và các race đủ điều kiện"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm giải đấu, địa điểm, mô tả..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D4A017]/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {loading ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center text-white/50">
            Đang tải danh sách giải đấu...
          </div>
        ) : (
          filtered.map((tournament) => (
            <GlassCard key={tournament.id} className="overflow-hidden">
              <div className="relative h-44 bg-gradient-to-br from-[#D4A017]/20 via-[#0F1E3A] to-[#0A1628]">
                <img
                  src={tournament.banner}
                  alt={tournament.name}
                  className="h-full w-full object-cover opacity-65"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute left-4 top-4 flex gap-2">
                  <Pill tone={statusTone(tournament.status)}>
                    {tournament.status}
                  </Pill>
                  <Pill tone="gold">
                    {tournament.type === "championship"
                      ? "Championship"
                      : "Regular"}
                  </Pill>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-white">
                      {tournament.name}
                    </h3>
                    <p className="truncate text-sm text-white/70">
                      {tournament.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-white/45">
                      Race mở
                    </div>
                    <div className="text-sm font-bold text-[#D4A017]">
                      {tournament.openRaceCount ||
                        tournament.races?.length ||
                        0}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <MetaItem
                    icon={MapPin}
                    value={tournament.location || "Chưa cập nhật"}
                  />
                  <MetaItem
                    icon={Calendar}
                    value={`${formatDate(tournament.startDate)} → ${formatDate(tournament.endDate)}`}
                  />
                  <MetaItem
                    icon={DollarSign}
                    value={`Entry fee: ${formatMoney(tournament.config?.entryFee || 0)}`}
                  />
                  <MetaItem
                    icon={Users}
                    value={`${tournament.registrationCount || 0} lượt đăng ký`}
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="mb-2 text-xs uppercase tracking-wider text-white/40">
                    Race có thể đăng ký
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(tournament.races || []).length ? (
                      tournament.races.map((race) => (
                        <span
                          key={race.id}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/75"
                        >
                          {race.raceNumber}. {race.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-white/50">
                        Chưa có race nào mở đăng ký
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <GhostButton
                    icon={Eye}
                    className="flex-1"
                    onClick={() => navigate("/horse-owner/registrations")}
                  >
                    Xem đăng ký của tôi
                  </GhostButton>
                  <PrimaryButton
                    className="flex-1"
                    onClick={() =>
                      navigate(
                        `/horse-owner/tournaments/${tournament.id}/register`,
                      )
                    }
                    disabled={!tournament.races?.length}
                  >
                    Đăng ký ngay
                  </PrimaryButton>
                </div>
              </div>
            </GlassCard>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-16 text-center text-white/45">
            <Trophy className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>Chưa có giải đấu nào đang mở đăng ký</p>
          </div>
        )}
      </div>
    </HorseOwnerLayout>
  );
}

function MetaItem({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white/40" />
      <span className="truncate text-xs text-white/70">{value}</span>
    </div>
  );
}
