import { useEffect, useMemo, useState } from "react";
import {
  Trophy,
  MapPin,
  Calendar,
  Users,
  Search,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  setTournamentBannerFallback,
  tournamentService,
} from "@/services/tournamentService";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  PrimaryButton,
} from "../admin/AdminLayout";
import { fmt } from "./data";
import { HorseOwnerInfoRow } from "./components/HorseOwnerInfoRow";

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
                  onError={setTournamentBannerFallback}
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
                    icon={Users}
                    text={formatCapacity(tournament)}
                  />
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/horse-owner/tournaments/${tournament.id}`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                    Chi tiết
                  </Link>
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

    </HorseOwnerLayout>
  );
}
