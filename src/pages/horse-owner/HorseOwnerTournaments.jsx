import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Search,
  Eye,
  X,
  Flag,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { tournamentService } from "@/services/tournamentService";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  PrimaryButton,
  GhostButton,
} from "../admin/AdminLayout";
import { fmt } from "./data";
import { HorseOwnerInfoRow } from "./components/HorseOwnerInfoRow";
import { HorseOwnerStatBox } from "./components/HorseOwnerStatBox";

function formatDate(value) {
  return value || "-";
}

function formatCapacity(tournament) {
  const maxHorses = Number(tournament.maxHorses ?? 0);
  const registeredHorses = Number(tournament.registeredHorses ?? 0);
  return maxHorses > 0
    ? `${registeredHorses} / ${maxHorses} ngựa đã đăng ký`
    : `${registeredHorses} ngựa đã đăng ký`;
}

function isOpenRegistration(tournament) {
  return tournament.statusCode === "OPEN_REGISTRATION";
}

export function HorseOwnerTournaments() {
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTournaments() {
      try {
        setLoading(true);
        setError("");
        const response = await tournamentService.getPublicTournaments();
        if (!cancelled) setTournaments(response.data);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Không thể tải danh sách giải đấu.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTournaments();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");
    if (!normalizedSearch) return tournaments;

    return tournaments.filter((tournament) =>
      `${tournament.name} ${tournament.location}`
        .toLocaleLowerCase("vi")
        .includes(normalizedSearch),
    );
  }, [search, tournaments]);

  const handleRegister = (tournament) => {
    toast.success(`Đã chọn giải đấu: ${tournament.name}`);
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Giải đấu"
      subtitle="Danh sách giải đấu đang mở đăng ký và sắp diễn ra"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm giải đấu, địa điểm..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-[#D4A017]/50 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <GlassCard className="flex items-center justify-center gap-3 p-10 text-white/60">
          <RefreshCw className="h-5 w-5 animate-spin text-[#D4A017]" />
          Đang tải danh sách giải đấu...
        </GlassCard>
      ) : error ? (
        <GlassCard className="border-red-500/20 bg-red-500/10 p-10 text-center text-red-200">
          {error}
        </GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard className="p-10 text-center text-white/50">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-white/30" />
          Không có giải đấu nào phù hợp.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tournament) => (
            <GlassCard key={tournament.id} className="overflow-hidden">
              <div className="relative h-36 overflow-hidden bg-[#0F1E3A]">
                <img
                  src={tournament.banner}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/20 to-transparent" />
                <div className="absolute left-3 top-3">
                  <Pill tone={tournament.statusTone}>{tournament.status}</Pill>
                </div>
                <div className="absolute bottom-3 right-3 text-right">
                  <div className="text-[10px] text-white/60">Prize Pool</div>
                  <div className="text-sm font-bold text-[#D4A017]">
                    {fmt(tournament.prizePool)}
                  </div>
                </div>
              </div>

              <div className="p-5">
                <h3 className="mb-1 line-clamp-1 text-base font-bold text-white">
                  {tournament.name}
                </h3>
                <p className="mb-4 line-clamp-2 min-h-8 text-xs text-white/50">
                  {tournament.description}
                </p>

                <div className="mb-4 space-y-2">
                  <HorseOwnerInfoRow
                    icon={MapPin}
                    text={tournament.location || "Chưa cập nhật địa điểm"}
                  />
                  <HorseOwnerInfoRow
                    icon={Calendar}
                    text={`${formatDate(tournament.startDate)} → ${formatDate(
                      tournament.endDate,
                    )}`}
                  />
                  <HorseOwnerInfoRow
                    icon={Calendar}
                    text={`Hạn đăng ký: ${formatDate(tournament.deadline)}`}
                    highlight
                  />
                  <HorseOwnerInfoRow
                    icon={DollarSign}
                    text={`Entry fee: ${fmt(tournament.entryFee)}`}
                  />
                  <HorseOwnerInfoRow
                    icon={Users}
                    text={formatCapacity(tournament)}
                  />
                </div>

                <div className="flex gap-2">
                  <GhostButton
                    icon={Eye}
                    className="flex-1"
                    onClick={() => setDetail(tournament)}
                  >
                    Chi tiết
                  </GhostButton>
                  {isOpenRegistration(tournament) && (
                    <PrimaryButton
                      className="flex-1"
                      onClick={() => handleRegister(tournament)}
                    >
                      Đăng ký ngay
                    </PrimaryButton>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <GlassCard className="max-h-[90vh] w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D4A017]/15">
                  <Trophy className="h-4 w-4 text-[#D4A017]" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-white">
                    {detail.name}
                  </h2>
                  <p className="truncate text-xs text-white/50">
                    {detail.location || "Chưa cập nhật địa điểm"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="rounded-lg p-1.5 hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-80px)] space-y-4 overflow-y-auto p-5">
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
                  value={
                    Number(detail.maxHorses ?? 0) > 0
                      ? `${detail.registeredHorses}/${detail.maxHorses}`
                      : String(detail.registeredHorses ?? 0)
                  }
                  tone="green"
                />
                <HorseOwnerStatBox
                  label="Trạng thái"
                  value={detail.status}
                  tone={detail.statusTone}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                  <Flag className="h-4 w-4 text-[#D4A017]" />
                  Cuộc đua trong giải
                </div>
                <div className="space-y-2">
                  {detail.races.length === 0 ? (
                    <p className="text-sm text-white/45">
                      Chưa có cuộc đua được công bố.
                    </p>
                  ) : (
                    detail.races.map((race) => (
                      <div
                        key={race.id}
                        className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-white">
                              {race.name}
                            </div>
                            <div className="mt-1 text-xs text-white/45">
                              {formatDate(race.date)} · {race.time || "--:--"} ·{" "}
                              {race.distance || "Chưa cập nhật cự ly"}
                            </div>
                          </div>
                          <Pill tone="blue">{race.status}</Pill>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </HorseOwnerLayout>
  );
}
