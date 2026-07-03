import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Search, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import {
  tournamentService,
  setTournamentBannerFallback,
} from "@/services/tournamentService";
import { fmtVND } from "@/utils/formatCurrency";
import { formatDisplayDate } from "@/utils/dateFormat";
import { enrichPublicTournamentCards } from "@/utils/publicTournamentCards";

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTournaments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await tournamentService.getPublicTournaments();
      setTournaments(
        await enrichPublicTournamentCards(
          response.data || [],
          tournamentService.getPublicTournament,
        ),
      );
    } catch (err) {
      const message = err?.message || "Không tải được danh sách giải đấu";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTournaments();
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return tournaments;
    return tournaments.filter((tournament) =>
      [
        tournament.name,
        tournament.location,
        tournament.status,
        tournament.provinceName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    );
  }, [query, tournaments]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
      <section className="relative overflow-hidden pb-16 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA]" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #1E3A5F 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="pt-10 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A017]/20 bg-gradient-to-r from-[#D4A017]/10 to-[#D4A017]/5 px-5 py-2.5 shadow-sm">
              <Trophy className="h-5 w-5 text-[#D4A017]" />
              <span className="font-semibold text-[#D4A017]">Giải đấu</span>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-[#1E3A5F] md:text-7xl">
              Danh sách giải đấu
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-[#1E3A5F]/60 md:text-2xl">
              Khám phá các giải đua đang mở đăng ký, lịch tổ chức, địa điểm,
              số lượng ngựa tham gia và tổng giải thưởng được cập nhật trực
              tiếp từ hệ thống.
            </p>

            <div className="mx-auto max-w-2xl">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1E3A5F]/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo tên, địa điểm, trạng thái"
                  className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-4 text-base text-[#1E3A5F] outline-none transition placeholder:text-[#1E3A5F]/35 focus:border-[#D4A017]"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-80 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={loadTournaments}
                className="mt-4 rounded-xl bg-[#D4A017] px-4 py-2 font-semibold text-white"
              >
                Tải lại
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#1E3A5F]/15 bg-white p-10 text-center text-[#1E3A5F]/55">
              <Search className="mx-auto mb-3 h-10 w-10 text-[#D4A017]" />
              <p className="font-semibold">Không có giải đấu phù hợp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function TournamentCard({ tournament }) {
  return (
    <Link
      to={`/spectator/tournaments/${tournament.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-[#D4A017] hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={tournament.banner}
          alt=""
          onError={setTournamentBannerFallback}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute right-4 top-4 rounded-full bg-[#D4A017] px-3 py-1 text-xs font-semibold text-white">
          {tournament.status}
        </span>
      </div>

      <div className="p-6">
        <h3 className="mb-4 text-xl font-bold text-[#1E3A5F] transition group-hover:text-[#D4A017]">
          {tournament.name}
        </h3>
        <div className="mb-6 space-y-3 text-sm text-[#1E3A5F]/60">
          <Meta
            icon={Calendar}
            text={`${formatDisplayDate(tournament.startDate)} - ${formatDisplayDate(tournament.endDate)}`}
          />
          <Meta
            icon={MapPin}
            text={
              tournament.location || tournament.provinceName || "Chưa cập nhật"
            }
          />
          <Meta
            icon={Users}
            text={`${tournament.registeredHorses || 0} đăng ký`}
          />
          <Meta icon={Trophy} text={fmtVND(tournament.prizePool)} />
        </div>
      </div>
    </Link>
  );
}

function Meta({ icon: Icon, text }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-[#D4A017]" />
      <span className="truncate">{text}</span>
    </span>
  );
}
