import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  Flag,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  Plus,
  Search,
  Settings,
  Trophy,
  Users,
} from "lucide-react";
import { PrimaryLink } from "@/components/ui/AdminButton";
import AdminLayout from "@/components/AdminLayout";
import {
  setTournamentBannerFallback,
  tournamentService,
} from "@/services/tournamentService";
import { useApiCacheStore } from "@/store/apiCacheStore";

const STATUS_TABS = [
  "Tất cả",
  "Nháp",
  "Đã công bố",
  "Đang mở đăng ký",
  "Đã đóng đăng ký",
  "Đã lên lịch",
  "Đang diễn ra",
  "Đã kết thúc",
  "Đã hủy",
];

const ADMIN_TOURNAMENTS_CACHE_KEY = "admin:tournaments";

export default function AdminTournamentsPage() {
  const cachedTournaments = useApiCacheStore.getState().getCache(ADMIN_TOURNAMENTS_CACHE_KEY)?.data;
  const hasInitialCache = useRef(Boolean(cachedTournaments));
  const [tournaments, setTournaments] = useState(cachedTournaments ?? []);
  const [status, setStatus] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(!cachedTournaments);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTournaments() {
      try {
        if (!hasInitialCache.current) setLoading(true);
        setError("");
        const response = await tournamentService.getAdminTournaments();
        if (!cancelled) {
          const changed = useApiCacheStore.getState().setCache(ADMIN_TOURNAMENTS_CACHE_KEY, response.data);
          if (changed || !hasInitialCache.current) setTournaments(response.data);
        }
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

  const statusTabs = useMemo(() => {
    const usedStatuses = new Set(
      tournaments.map((tournament) => tournament.status),
    );
    return STATUS_TABS.filter(
      (tab) => tab === "Tất cả" || usedStatuses.has(tab),
    );
  }, [tournaments]);

  const counts = useMemo(
    () =>
      statusTabs.reduce((result, tab) => {
        result[tab] =
          tab === "Tất cả"
            ? tournaments.length
            : tournaments.filter((tournament) => tournament.status === tab)
                .length;
        return result;
      }, {}),
    [statusTabs, tournaments],
  );

  const visibleTournaments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi");
    const filtered = tournaments.filter(
      (tournament) =>
        (status === "Tất cả" || tournament.status === status) &&
        (!normalizedQuery ||
          `${tournament.name} ${tournament.location}`
            .toLocaleLowerCase("vi")
            .includes(normalizedQuery)),
    );

    return [...filtered].sort((first, second) => {
      if (sortBy === "name") return first.name.localeCompare(second.name, "vi");
      const order = sortBy === "oldest" ? 1 : -1;
      return (
        order * String(first.startDate).localeCompare(String(second.startDate))
      );
    });
  }, [query, sortBy, status, tournaments]);

  return (
    <AdminLayout
      heading="Quản lý"
      highlight="Giải đấu"
      subtitle="Tạo, cấu hình và theo dõi các giải đua ngựa"
      action={
        <PrimaryLink to="/admin/tournaments/new" icon={Plus} size="lg">
          Tạo giải đấu
        </PrimaryLink>
      }
    >
      <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
        <div className="flex flex-wrap gap-3 border-b border-white/10 px-7 py-7">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatus(tab)}
              className={`inline-flex h-14 items-center gap-4 rounded-2xl px-7 font-semibold transition ${
                status === tab
                  ? "bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/30"
                  : "bg-white/[0.06] text-white/60 hover:text-white"
              }`}
            >
              {tab}
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  status === tab ? "bg-white/20" : "bg-white/10"
                }`}
              >
                {counts[tab] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5 px-7 py-7 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Tìm giải đấu</span>
            <Search className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-white/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc địa điểm..."
              className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-16 pr-5 text-lg text-white outline-none placeholder:text-white/35 focus:border-[#dda50e]/60"
            />
          </label>

          <label className="relative lg:w-64">
            <span className="sr-only">Sắp xếp giải đấu</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-16 w-full appearance-none rounded-2xl border border-white/10 bg-[#162338] px-7 pr-14 text-lg font-semibold text-white outline-none focus:border-[#dda50e]/60"
            >
              <option value="latest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Theo tên</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
          </label>

          <div className="flex h-16 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
            <ViewButton
              label="Dạng thẻ"
              active={view === "grid"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-6 w-6" />
            </ViewButton>
            <ViewButton
              label="Dạng danh sách"
              active={view === "list"}
              onClick={() => setView("list")}
            >
              <List className="h-6 w-6" />
            </ViewButton>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] py-20 text-center text-white/55">
          Đang tải danh sách giải đấu...
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-400/25 bg-red-500/10 py-20 text-center text-red-200">
          {error}
        </div>
      ) : visibleTournaments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center text-white/45">
          <Trophy className="mx-auto mb-4 h-12 w-12" />
          Không có giải đấu nào phù hợp.
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <TournamentTable tournaments={visibleTournaments} />
      )}
    </AdminLayout>
  );
}

function ViewButton({ active, children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-12 w-14 items-center justify-center rounded-xl transition ${
        active ? "bg-[#dda50e] text-white" : "text-white/55 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const tones = {
    "Đang mở đăng ký": "border-[#f2c94c]/75 bg-[#dda50e]/40 text-[#fff4c2]",
    "Đang diễn ra": "border-emerald-300/70 bg-emerald-500/35 text-emerald-100",
    "Đã kết thúc": "border-purple-300/70 bg-purple-500/35 text-purple-100",
    "Đã hủy": "border-red-300/70 bg-red-500/35 text-red-100",
    "Đã đóng đăng ký": "border-cyan-300/70 bg-cyan-500/35 text-cyan-100",
    "Đã lên lịch": "border-blue-300/70 bg-blue-500/35 text-blue-100",
    "Đã công bố": "border-sky-300/70 bg-sky-500/35 text-sky-100",
    Nháp: "border-white/40 bg-white/20 text-white",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold shadow-md shadow-black/35 backdrop-blur-md ${tones[status] ?? tones.Nháp}`}
    >
      {status}
    </span>
  );
}

function formatTournamentDate(value, label) {
  if (!value) return `${label}: -`;
  return `${label}: ${value}`;
}

function TournamentCard({ tournament }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
      <div className="relative h-60 overflow-hidden">
        <img
          src={tournament.banner}
          alt=""
          onError={setTournamentBannerFallback}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111d32] via-transparent to-transparent" />
        <div className="absolute left-5 top-5">
          <StatusBadge status={tournament.status} />
        </div>
        <h2 className="absolute bottom-5 left-5 right-5 truncate text-2xl font-bold">
          {tournament.name}
        </h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-b border-white/10 pb-6 text-base text-white/60">
          <CardMeta
            icon={MapPin}
            text={tournament.location || "Chưa có địa điểm"}
            className="col-span-2"
          />
          <CardMeta
            icon={CalendarDays}
            text={formatTournamentDate(tournament.registrationOpenDate, "Mở đăng ký")}
          />
          <CardMeta
            icon={CalendarDays}
            text={formatTournamentDate(tournament.registrationCloseDate, "Đóng đăng ký")}
          />
          <CardMeta
            icon={CalendarDays}
            text={formatTournamentDate(tournament.startDate, "Bắt đầu")}
          />
          <CardMeta
            icon={CalendarDays}
            text={formatTournamentDate(tournament.endDate, "Kết thúc")}
          />
          <CardMeta icon={Flag} text={`${tournament.raceCount} cuộc đua`} />
          <CardMeta icon={Users} text={`${tournament.registrations} người đăng ký`} />
        </div>

        <div className="mt-5 flex items-center gap-4">
          <Link
            to={`/admin/tournaments/${tournament.id}`}
            className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-[#dda50e] font-semibold shadow-lg shadow-[#d4a017]/20 transition hover:bg-[#c8940f]"
          >
            <Settings className="h-5 w-5" />
            Quản lý
          </Link>
          <ActionLink
            to={`/admin/tournaments/${tournament.id}?tab=races`}
            label="Chỉnh sửa cấu hình cuộc đua"
          >
            <Pencil className="h-5 w-5" />
          </ActionLink>
        </div>
      </div>
    </article>
  );
}

function TournamentTable({ tournaments: rows }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-white/10 text-left text-sm uppercase tracking-wider text-white/45">
            <tr>
              <th className="px-7 py-5">Giải đấu</th>
              <th className="px-7 py-5">Địa điểm</th>
              <th className="px-7 py-5">Ngày bắt đầu</th>
              <th className="px-7 py-5">Ngày kết thúc</th>
              <th className="px-7 py-5">Số cuộc đua</th>
              <th className="px-7 py-5">Trạng thái</th>
              <th className="px-7 py-5">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tournament) => (
              <tr
                key={tournament.id}
                className="border-b border-white/5 text-white/70 last:border-0"
              >
                <td className="px-7 py-5 font-semibold text-white">
                  {tournament.name}
                </td>
                <td className="px-7 py-5">
                  {tournament.location || "Chưa có địa điểm"}
                </td>
                <td className="px-7 py-5">{tournament.startDate || "-"}</td>
                <td className="px-7 py-5">{tournament.endDate || "-"}</td>
                <td className="px-7 py-5">{tournament.raceCount}</td>
                <td className="px-7 py-5">
                  <StatusBadge status={tournament.status} />
                </td>
                <td className="px-7 py-5">
                  <Link
                    className="font-semibold text-[#dda50e]"
                    to={`/admin/tournaments/${tournament.id}`}
                  >
                    Quản lý
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardMeta({ icon: Icon, text, className = "" }) {
  return (
    <span className={`flex min-w-0 items-center gap-3 ${className}`}>
      <Icon className="h-5 w-5 shrink-0 text-[#dda50e]" />
      <span className="truncate">{text}</span>
    </span>
  );
}

function ActionLink({ children, label, to }) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="rounded-xl p-3 text-white/60 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </Link>
  );
}
