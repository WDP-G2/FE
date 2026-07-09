import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  PawPrint,
  Trophy,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Medal,
} from "lucide-react";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  StatCard,
  Pill,
  PrimaryButton,
  GhostButton,
} from "../admin/AdminLayout";
import { HorseOwnerQuickAction } from "./components/HorseOwnerQuickAction";
import { HorseOwnerClipboardListIcon } from "./components/HorseOwnerClipboardListIcon";
import { formatDisplayDate } from "@/utils/dateFormat";
import { fmtVND } from "@/utils/formatCurrency";
import { getApiErrorMessage } from "@/utils/apiError";
import { useAuthStore } from "@/store/authStore";
import { horseService } from "@/services/horseService";
import {
  ACTIVE_RACE_REGISTRATION_STATUSES,
  raceRegistrationService,
} from "@/services/raceRegistrationService";
import {
  buildOwnerResults,
} from "@/utils/ownerViewUtils";
import {
  buildUpcomingRegistrations,
  countActiveTournaments,
  countRegistrationCheckIn,
  enrichOwnerRegistrations,
} from "@/utils/ownerRegistrationUtils";

export function HorseOwnerDashboard() {
  const user = useAuthStore((s) => s.user);
  const [horses, setHorses] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [summary, setSummary] = useState({
    totalPrize: 0,
    bestHorseName: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [horseList, registrationList, resultsPayload] = await Promise.all([
          horseService.getOwnerHorses(),
          raceRegistrationService.getOwnerRegistrations(),
          horseService.getOwnerResults(),
        ]);

        const enrichedRegistrations = await enrichOwnerRegistrations(registrationList);

        if (!active) return;

        setHorses(horseList);
        setRegistrations(enrichedRegistrations);
        setRecentResults(buildOwnerResults(resultsPayload?.results ?? []).slice(0, 5));
        setSummary({
          totalPrize: Number(resultsPayload?.summary?.totalPrize ?? 0),
          bestHorseName: resultsPayload?.summary?.bestHorseName || "",
        });
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err) || "Không thể tải dashboard chủ ngựa");
        setHorses([]);
        setRegistrations([]);
        setRecentResults([]);
        setSummary({ totalPrize: 0, bestHorseName: "" });
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const displayName = user?.fullName || user?.username || "Chủ ngựa";
  const upcoming = useMemo(
    () => buildUpcomingRegistrations(registrations, 5),
    [registrations],
  );
  const activeTournamentCount = useMemo(
    () => countActiveTournaments(registrations),
    [registrations],
  );
  const upcomingRaceCount = useMemo(
    () =>
      registrations.filter((item) =>
        ACTIVE_RACE_REGISTRATION_STATUSES.includes(item.statusCode),
      ).length,
    [registrations],
  );
  const checkInStats = useMemo(
    () => countRegistrationCheckIn(registrations),
    [registrations],
  );
  const checkInLabel =
    checkInStats.scope === "today" ? "Check-in hôm nay" : "Check-in đăng ký";

  const subtitle = upcoming.length
    ? `Chào ${displayName} · Bạn có ${upcoming.length} race sắp diễn ra`
    : `Chào ${displayName} · Chưa có race sắp diễn ra`;

  return (
    <HorseOwnerLayout
      title="Horse Owner · Dashboard"
      subtitle={subtitle}
      actions={
        <>
          <Link to="/horse-owner/registrations">
            <GhostButton icon={HorseOwnerClipboardListIcon}>
              Đăng ký mới
            </GhostButton>
          </Link>
          <Link to="/horse-owner/horses">
            <PrimaryButton icon={PawPrint}>Quản lý ngựa</PrimaryButton>
          </Link>
        </>
      }
    >
      {error && (
        <GlassCard className="mb-6 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </GlassCard>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="Tổng số ngựa"
          value={loading ? "…" : String(horses.length)}
          icon={PawPrint}
          tone="gold"
        />
        <StatCard
          label="Giải đang tham gia"
          value={loading ? "…" : String(activeTournamentCount)}
          icon={Trophy}
          tone="green"
        />
        <StatCard
          label="Trận sắp tới"
          value={loading ? "…" : String(upcomingRaceCount)}
          icon={Calendar}
          tone="blue"
        />
        <StatCard
          label="Tổng tiền thưởng"
          value={loading ? "…" : fmtVND(summary.totalPrize)}
          icon={DollarSign}
          tone="purple"
        />
        <StatCard
          label={checkInLabel}
          value={
            loading
              ? "…"
              : `${checkInStats.checkedIn} / ${checkInStats.total}`
          }
          icon={CheckCircle2}
          tone="gold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Lịch thi đấu sắp tới
                  </h2>
                  <p className="text-xs text-white/50">
                    Các race đã đăng ký và được duyệt
                  </p>
                </div>
              </div>
              <Link
                to="/horse-owner/registrations"
                className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1"
              >
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {loading ? (
                <div className="text-center text-white/40 py-8 text-sm">
                  Đang tải lịch thi đấu...
                </div>
              ) : upcoming.length === 0 ? (
                <div className="text-center text-white/40 py-8 text-sm">
                  Không có race nào sắp tới.
                </div>
              ) : (
                upcoming.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-[#D4A017]/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center shrink-0 w-16">
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">
                          Giờ
                        </div>
                        <div className="text-xl font-bold text-[#D4A017]">
                          {reg.raceTime}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold text-[#D4A017] bg-[#D4A017]/15 px-2 py-0.5 rounded-md border border-[#D4A017]/30">
                            {reg.raceNo}
                          </span>
                          <h3 className="font-bold text-white text-sm truncate">
                            {reg.tournament}
                          </h3>
                          <Pill tone={reg.statusTone}>{reg.status}</Pill>
                        </div>
                        <div className="text-[11px] text-white/50">
                          {reg.horse} · Jockey: {reg.jockey ?? "Chưa chọn"} ·{" "}
                          {formatDisplayDate(reg.raceDate)}
                          {reg.checkInStatus === "CHECKED_IN" ? " · Đã check-in" : ""}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/30 shrink-0" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                  <Medal className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Kết quả gần đây
                  </h2>
                  <p className="text-xs text-white/50">
                    Thành tích thi đấu mới nhất
                  </p>
                </div>
              </div>
              <Link
                to="/horse-owner/results"
                className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1"
              >
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {loading ? (
                <div className="text-center text-white/40 py-8 text-sm">
                  Đang tải kết quả...
                </div>
              ) : recentResults.length === 0 ? (
                <div className="text-center text-white/40 py-8 text-sm">
                  Chưa có kết quả thi đấu đã chốt.
                </div>
              ) : (
                recentResults.map((res) => (
                  <div
                    key={res.id}
                    className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl border border-white/8"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        res.position === 1
                          ? "bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/40"
                          : res.position === 2
                            ? "bg-slate-400/20 text-slate-300 border border-slate-400/40"
                            : "bg-amber-700/20 text-amber-600 border border-amber-700/40"
                      }`}
                    >
                      #{res.position}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">
                        {res.horse}
                      </div>
                      <div className="text-[11px] text-white/50">
                        {res.race} · {res.tournament}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-emerald-300">
                        +{fmtVND(res.prize)}
                      </div>
                      <div className="text-[11px] text-white/40">
                        {formatDisplayDate(res.date)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-5 bg-gradient-to-br from-[#D4A017]/15 to-transparent border-[#D4A017]/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#D4A017]" />
              <h3 className="text-sm font-bold text-white">Thao tác nhanh</h3>
            </div>
            <div className="space-y-2">
              <HorseOwnerQuickAction
                to="/horse-owner/horses"
                icon={PawPrint}
                label="Thêm ngựa mới"
                sub="Đăng ký ngựa thi đấu"
              />
              <HorseOwnerQuickAction
                to="/horse-owner/tournaments"
                icon={Trophy}
                label="Xem giải đấu"
                sub="Giải đấu đang mở"
              />
              <HorseOwnerQuickAction
                to="/horse-owner/registrations"
                icon={HorseOwnerClipboardListIcon}
                label="Đăng ký thi đấu"
                sub="Chọn ngựa & jockey"
              />
              <HorseOwnerQuickAction
                to="/horse-owner/payments"
                icon={DollarSign}
                label="Thanh toán"
                sub="Entry fee & tiền thưởng"
              />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Tình trạng ngựa
                  </h3>
                  <p className="text-[11px] text-white/50">
                    {loading ? "Đang tải..." : `${horses.length} ngựa trong đội`}
                  </p>
                </div>
              </div>
              <Link
                to="/horse-owner/horses"
                className="text-xs text-[#D4A017] hover:underline font-semibold"
              >
                Quản lý
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {loading ? (
                <div className="text-center text-white/40 py-6 text-sm">
                  Đang tải danh sách ngựa...
                </div>
              ) : horses.length === 0 ? (
                <div className="text-center text-white/40 py-6 text-sm">
                  Chưa có ngựa nào.
                </div>
              ) : (
                horses.slice(0, 5).map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl"
                  >
                    <div className="w-9 h-9 bg-[#D4A017]/10 rounded-lg flex items-center justify-center shrink-0">
                      <PawPrint className="w-4 h-4 text-[#D4A017]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">
                        {h.name}
                      </div>
                      <div className="text-[11px] text-white/40">
                        {h.breed || "—"}
                        {h.age ? ` · ${h.age} tuổi` : ""}
                      </div>
                    </div>
                    <Pill tone={h.healthTone}>{h.health}</Pill>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </HorseOwnerLayout>
  );
}
