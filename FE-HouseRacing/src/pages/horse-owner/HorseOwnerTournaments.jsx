import { useMemo, useState } from "react";
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
import {
  setTournamentBannerFallback,
  tournamentService,
} from "@/services/tournamentService";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
} from "../admin/AdminLayout";
import { HorseOwnerInfoRow } from "./components/HorseOwnerInfoRow";
import { formatDisplayDate } from "@/utils/dateFormat";
import { useFetch } from "@/hooks/useFetch";

function formatRegistrationRange(tournament) {
  return `${formatDisplayDate(tournament.registrationOpenDate)} → ${formatDisplayDate(
    tournament.registrationCloseDate,
  )}`;
}

function dateOnly(value, endOfDay = false) {
  if (!value) return null;

  const [datePart] = String(value).split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;

  return endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59, 999)
    : new Date(year, month - 1, day);
}

function isWithinRegistrationDates(tournament) {
  const openDate = dateOnly(tournament.registrationOpenDate);
  const closeDate = dateOnly(tournament.registrationCloseDate, true);
  if (!openDate || !closeDate) return false;

  const now = new Date();
  return now >= openDate && now <= closeDate;
}

function formatCapacity(tournament) {
  const registeredHorses = Number(tournament.registeredHorses ?? 0);
  return `${registeredHorses} ngựa đã đăng ký`;
}

function isOpenRegistration(tournament) {
  return tournament.statusCode === "OPEN_REGISTRATION";
}

export function HorseOwnerTournaments() {
  const [search, setSearch] = useState("");
  const { data, loading, error: fetchError } = useFetch(
    async () => {
      const response = await tournamentService.getPublicTournaments();
      return response.data;
    },
    { cacheKey: "public:tournaments" },
  );
  const tournaments = useMemo(() => data ?? [], [data]);
  const error =
    fetchError?.response?.data?.message ||
    fetchError?.message ||
    (fetchError ? "Không thể tải danh sách giải đấu." : "");

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");
    if (!normalizedSearch) return tournaments;

    return tournaments.filter((tournament) =>
      `${tournament.name} ${tournament.location}`
        .toLocaleLowerCase("vi")
        .includes(normalizedSearch),
    );
  }, [search, tournaments]);

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
                    text={`${formatDisplayDate(tournament.startDate)} → ${formatDisplayDate(
                      tournament.endDate,
                    )}`}
                  />
                  <HorseOwnerInfoRow
                    icon={Calendar}
                    text={`Đăng ký: ${formatRegistrationRange(tournament)}`}
                    highlight
                    tone={isWithinRegistrationDates(tournament) ? "green" : "red"}
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
                    <Link
                      to={`/horse-owner/registrations?tournamentId=${tournament.id}&open=1`}
                      className="flex flex-1 items-center justify-center rounded-xl bg-[#D4A017] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#D4A017]/30 transition-all hover:bg-[#B8941F]"
                    >
                      Đăng ký ngay
                    </Link>
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
