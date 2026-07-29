import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Eye,
  Flag,
  MapPin,
  RefreshCw,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  setTournamentBannerFallback,
  tournamentService,
} from "@/services/tournamentService";
import { GlassCard, Pill } from "../admin/AdminLayout";
import { JockeyLayout } from "./JockeyLayout";
import { JockeyInfoRow } from "./components/JockeyInfoRow";
import { formatDisplayDate } from "@/utils/dateFormat";
import { fmtVND } from "@/utils/formatCurrency";
import { useFetch } from "@/hooks/useFetch";
import { jockeyService } from "@/services/jockeyService";
import {
  buildJockeySchedules,
  getTournamentRelation,
} from "@/utils/jockeyViewUtils";

const DEFAULT_STATUS_FILTERS = [
  "Tất cả",
  "Đã công bố",
  "Đang mở đăng ký",
  "Đã đóng đăng ký",
  "Đã lên lịch",
  "Đang diễn ra",
  "Đã kết thúc",
];

function formatCapacity(tournament) {
  const maxHorses = Number(tournament.maxHorses ?? 0);
  const registeredHorses = Number(tournament.registeredHorses ?? 0);
  return maxHorses > 0
    ? `${registeredHorses} / ${maxHorses} đăng ký`
    : `${registeredHorses} đăng ký`;
}

export function JockeyTournaments() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [invitations, setInvitations] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadJockeyData() {
      try {
        const [inviteData, raceData] = await Promise.all([
          jockeyService.getJockeyInvitations(),
          jockeyService.getRaces(),
        ]);
        if (!active) return;
        setInvitations(inviteData);
        setSchedules(buildJockeySchedules(raceData, inviteData));
      } catch {
        if (!active) return;
        setInvitations([]);
        setSchedules([]);
      }
    }

    loadJockeyData();
    return () => {
      active = false;
    };
  }, []);
  const { data, loading, error: fetchError, refetch } = useFetch(
    async () => {
      const response = await tournamentService.getPublicTournaments();
      return response.data;
    },
    { cacheKey: "public:tournaments" },
  );
  const tournaments = data ?? [];
  const error =
    fetchError?.response?.data?.message ||
    fetchError?.message ||
    (fetchError ? "Không thể tải danh sách giải đấu." : "");

  const statusFilters = useMemo(() => {
    const usedStatuses = new Set(tournaments.map((tournament) => tournament.status));
    return DEFAULT_STATUS_FILTERS.filter(
      (status) => status === "Tất cả" || usedStatuses.has(status),
    );
  }, [tournaments]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("vi");

    return tournaments.filter(
      (tournament) =>
        (statusFilter === "Tất cả" || tournament.status === statusFilter) &&
        (!normalizedSearch ||
          `${tournament.name} ${tournament.location}`
            .toLocaleLowerCase("vi")
            .includes(normalizedSearch)),
    );
  }, [search, statusFilter, tournaments]);

  return (
    <JockeyLayout
      title="Jockey · Giải đấu"
      subtitle="Danh sách giải đấu, race và trạng thái liên quan đến bạn"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm giải đấu, địa điểm..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-[#D4A017]/50 focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {statusFilters.map((status) => {
          const count =
            status === "Tất cả"
              ? tournaments.length
              : tournaments.filter((tournament) => tournament.status === status).length;

          return (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                statusFilter === status
                  ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/25"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {status}
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  statusFilter === status ? "bg-white/20" : "bg-white/10"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
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
          {filtered.map((tournament) => {
            const relation = getTournamentRelation(tournament, invitations, schedules);

            return (
              <GlassCard key={tournament.id} className="overflow-hidden">
                <div className="relative h-36 overflow-hidden bg-[#0F1E3A]">
                  <img
                    src={tournament.banner}
                    alt=""
                    onError={setTournamentBannerFallback}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/20 to-transparent" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <Pill tone={tournament.statusTone}>{tournament.status}</Pill>
                    <Pill tone={relation.tone}>{relation.label}</Pill>
                  </div>
                  <div className="absolute bottom-3 right-3 text-right">
                    <div className="text-[10px] text-white/60">Prize Pool</div>
                    <div className="text-sm font-bold text-[#D4A017]">
                      {fmtVND(tournament.prizePool)}
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
                    <JockeyInfoRow
                      icon={MapPin}
                      text={tournament.location || "Chưa cập nhật địa điểm"}
                    />
                    <JockeyInfoRow
                      icon={Calendar}
                      text={`${formatDisplayDate(tournament.startDate)} → ${formatDisplayDate(
                        tournament.endDate,
                      )}`}
                    />
                    <JockeyInfoRow
                      icon={Clock}
                      text={`Hạn đăng ký: ${formatDisplayDate(tournament.deadline)}`}
                      highlight
                    />
                    <JockeyInfoRow
                      icon={Users}
                      text={formatCapacity(tournament)}
                    />
                    <JockeyInfoRow icon={Flag} text={relation.detail} />
                  </div>

                  <Link
                    to={`/jockey/tournaments/${tournament.id}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                    Chi tiết
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </JockeyLayout>
  );
}
