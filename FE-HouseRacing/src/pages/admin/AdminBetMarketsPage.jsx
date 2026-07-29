import { useEffect, useMemo, useState } from "react";
import {
  BadgePercent,
  CalendarClock,
  ChevronDown,
  CircleDollarSign,
  Flag,
  RefreshCw,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import Field from "@/components/ui/Field";
import { MoneyInput, Select, TextArea } from "@/components/ui/Input";
import { adminBettingService } from "@/services/adminBettingService";
import { tournamentService } from "@/services/tournamentService";
import { fmtVND } from "@/utils/formatCurrency";
import { formatDisplayDateTime } from "@/utils/dateFormat";
import { getApiErrorMessage } from "@/utils/apiError";

function toNumber(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function marketTone(status) {
  if (status === "OPEN")
    return "border-emerald-400/30 bg-emerald-500/10 text-emerald-200";
  if (status === "DRAFT")
    return "border-amber-400/30 bg-amber-500/10 text-amber-200";
  if (status === "CLOSED")
    return "border-sky-400/30 bg-sky-500/10 text-sky-200";
  if (status === "SETTLED")
    return "border-purple-400/30 bg-purple-500/10 text-purple-200";
  return "border-white/10 bg-white/[0.05] text-white/55";
}

function marketStatusLabel(status) {
  if (status === "OPEN") return "Đang mở";
  if (status === "DRAFT") return "Bản nháp";
  if (status === "CLOSED") return "Đã đóng";
  if (status === "SETTLED") return "Đã chốt";
  return status || "Chưa mở cược";
}

function raceStatusLabel(status) {
  if (status === "DRAFT") return "Bản nháp";
  if (status === "PUBLISHED") return "Đã công bố";
  if (status === "SCHEDULED") return "Đã lên lịch";
  if (status === "ONGOING") return "Đang diễn ra";
  if (status === "RESULT_CONFIRMED") return "Đã có kết quả";
  if (status === "COMPLETED" || status === "FINISHED") return "Đã kết thúc";
  if (status === "CANCELLED") return "Đã hủy";
  return status || "Chưa cập nhật";
}

function betStatusLabel(status) {
  if (status === "PENDING") return "Đang chờ";
  if (status === "WON") return "Thắng cược";
  if (status === "LOST") return "Thua cược";
  if (status === "CANCELLED") return "Đã hủy";
  if (status === "REFUNDED") return "Đã hoàn tiền";
  if (status === "SETTLED") return "Đã chốt";
  return status || "Chưa cập nhật";
}

const STARTED_RACE_STATUSES = new Set([
  "ONGOING",
  "RESULT_CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "FINISHED",
]);

function getRaceStartTime(race) {
  const value = race?.scheduledStartAt || race?.raw?.scheduledStartAt;
  if (!value) return null;

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function isRaceBeforeStart(race) {
  const status = String(
    race?.statusCode || race?.raw?.status || "",
  ).toUpperCase();
  if (STARTED_RACE_STATUSES.has(status)) return false;

  const startTime = getRaceStartTime(race);
  return startTime != null && startTime > Date.now();
}

function keepBettableUpcomingRaces(tournament) {
  if (!tournament) return null;

  const races = (
    Array.isArray(tournament.races) ? tournament.races : []
  ).filter(isRaceBeforeStart);
  return { ...tournament, races };
}

export default function AdminBetMarketsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState("");
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [markets, setMarkets] = useState([]);
  const [marketBets, setMarketBets] = useState([]);
  const [form, setForm] = useState({ minStake: "", maxStake: "", note: "" });
  const [loading, setLoading] = useState(true);
  const [loadingTournament, setLoadingTournament] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedRace = useMemo(
    () =>
      selectedTournament?.races?.find(
        (race) => String(race.id) === String(selectedRaceId),
      ) || null,
    [selectedRaceId, selectedTournament],
  );

  const marketByRaceId = useMemo(
    () =>
      markets.reduce((result, market) => {
        if (market?.raceId != null) result[String(market.raceId)] = market;
        return result;
      }, {}),
    [markets],
  );

  const selectedRaceMarket = selectedRace
    ? marketByRaceId[String(selectedRace.id)]
    : null;

  const loadBaseData = async () => {
    setLoading(true);
    try {
      const [tournamentResponse, marketList] = await Promise.all([
        tournamentService.getAdminTournaments(),
        adminBettingService.getMarkets(),
      ]);
      const nextTournaments = tournamentResponse.data || [];

      setTournaments(nextTournaments);
      setMarkets(marketList);

      if (!selectedTournamentId && nextTournaments[0]?.id) {
        setSelectedTournamentId(String(nextTournaments[0].id));
      }
      if (!nextTournaments.length) {
        setSelectedTournamentId("");
        setSelectedTournament(null);
        setSelectedRaceId("");
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadTournamentDetail = async (tournamentId) => {
    if (!tournamentId) {
      setSelectedTournament(null);
      setSelectedRaceId("");
      return;
    }

    setLoadingTournament(true);
    try {
      const response = await tournamentService.getAdminTournament(tournamentId);
      const nextTournament = keepBettableUpcomingRaces(response.data);
      setSelectedTournament(nextTournament);
      const firstRaceId = nextTournament?.races?.[0]?.id;
      setSelectedRaceId(firstRaceId ? String(firstRaceId) : "");
    } catch (error) {
      setSelectedTournament(null);
      setSelectedRaceId("");
      toast.error(getApiErrorMessage(error));
    } finally {
      setLoadingTournament(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBaseData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTournamentDetail(selectedTournamentId);
  }, [selectedTournamentId]);

  useEffect(() => {
    if (selectedRaceMarket) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        minStake: String(selectedRaceMarket.minStake || ""),
        maxStake: String(selectedRaceMarket.maxStake || ""),
        note: selectedRaceMarket.note || "",
      });
      return;
    }
    setForm({ minStake: "", maxStake: "", note: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRaceMarket?.id]);

  const refreshMarkets = async () => {
    try {
      const nextMarkets = await adminBettingService.getMarkets();
      setMarkets(nextMarkets);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const createMarket = async () => {
    if (!selectedRace) {
      toast.error("Vui lòng chọn cuộc đua");
      return;
    }

    const minStake = toNumber(form.minStake);
    const maxStake = toNumber(form.maxStake);
    if (minStake <= 0 || maxStake <= 0) {
      toast.error("Số tiền tối thiểu/Số tiền tối đa phải lớn hơn 0");
      return;
    }
    if (minStake > maxStake) {
      toast.error("Số tiền tối thiểu không được lớn hơn số tiền tối đa");
      return;
    }

    setSaving(true);
    try {
      await adminBettingService.createMarket(selectedRace.id, {
        minStake,
        maxStake,
        note: form.note.trim(),
      });
      toast.success("Đã tạo cấu hình cược cho cuộc đua");
      await refreshMarkets();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const openMarket = async (marketId) => {
    setSaving(true);
    try {
      await adminBettingService.openMarket(marketId);
      toast.success("Đã mở kèo cược");
      await refreshMarkets();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const closeMarket = async (marketId) => {
    setSaving(true);
    try {
      await adminBettingService.closeMarket(marketId);
      toast.success("Đã đóng kèo cược");
      await refreshMarkets();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const settleMarket = async (marketId) => {
    setSaving(true);
    try {
      await adminBettingService.settleMarket(marketId);
      toast.success("Đã chốt kết quả cược và thanh toán cho người thắng");
      await refreshMarkets();
      await loadMarketBets(marketId);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const loadMarketBets = async (marketId) => {
    if (!marketId) {
      setMarketBets([]);
      return;
    }
    try {
      setMarketBets(await adminBettingService.getMarketBets(marketId));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <AdminLayout
      heading="Cấu hình"
      highlight="Cược theo cuộc đua"
      subtitle="Tạo và mở đặt cược cho từng cuộc đua trong giải đấu"
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-white">
                Chọn giải đấu và cuộc đua
              </h2>
              <p className="text-sm text-white/50">
                Chỉ hiển thị cuộc đua chưa đến giờ bắt đầu để cấu hình cược.
              </p>
            </div>
            <button
              type="button"
              onClick={loadBaseData}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/65 hover:text-white"
              title="Tải lại"
              aria-label="Tải lại dữ liệu"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-white/50">
              Đang tải dữ liệu...
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Giải đấu">
                <div className="relative">
                  <Select
                    value={selectedTournamentId}
                    onChange={(event) =>
                      setSelectedTournamentId(event.target.value)
                    }
                  >
                    <option value="">Chọn giải đấu</option>
                    {tournaments.map((tournament) => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name}
                      </option>
                    ))}
                  </Select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                </div>
              </Field>

              <div className="space-y-3">
                {loadingTournament ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/45">
                    Đang tải cuộc đua...
                  </div>
                ) : selectedTournament?.races?.length ? (
                  selectedTournament.races.map((race) => {
                    const market = marketByRaceId[String(race.id)];
                    const active = String(selectedRaceId) === String(race.id);
                    return (
                      <button
                        key={race.id}
                        type="button"
                        onClick={() => setSelectedRaceId(String(race.id))}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-[#D4A017]/45 bg-[#D4A017]/12"
                            : "border-white/10 bg-white/[0.03] hover:border-white/25"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-bold text-white">
                              {race.name}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/45">
                              <span className="inline-flex items-center gap-1">
                                <CalendarClock className="h-3.5 w-3.5" />
                                {formatDisplayDateTime(
                                  race.scheduledStartAt ||
                                    race.raw?.scheduledStartAt,
                                )}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Flag className="h-3.5 w-3.5" />
                                {raceStatusLabel(
                                  race.statusCode ||
                                    race.raw?.status ||
                                    race.status,
                                )}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${marketTone(market?.status)}`}
                          >
                            {marketStatusLabel(market?.status)}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-white/45">
                    Giải đấu này không còn cuộc đua sắp diễn ra để cấu hình cược.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D4A017]/15 text-[#D4A017]">
                <BadgePercent className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">Cấu hình cược</h2>
                <p className="text-sm text-white/50">
                  {selectedRace
                    ? selectedRace.name
                    : "Chọn cuộc đua để cấu hình cược"}
                </p>
              </div>
            </div>

            {selectedRaceMarket ? (
              <MarketSummary
                market={selectedRaceMarket}
                saving={saving}
                onOpen={() => openMarket(selectedRaceMarket.id)}
                onClose={() => closeMarket(selectedRaceMarket.id)}
                onSettle={() => settleMarket(selectedRaceMarket.id)}
                onViewBets={() => loadMarketBets(selectedRaceMarket.id)}
              />
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Số tiền tối thiểu">
                    <MoneyInput
                      value={form.minStake}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, minStake: value }))
                      }
                      placeholder="100000"
                    />
                  </Field>
                  <Field label="Số tiền tối đa">
                    <MoneyInput
                      value={form.maxStake}
                      onValueChange={(value) =>
                        setForm((current) => ({ ...current, maxStake: value }))
                      }
                      placeholder="5000000"
                    />
                  </Field>
                </div>
                <Field label="Ghi chú">
                  <TextArea
                    value={form.note}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    placeholder="Thông tin nội bộ cho kèo cược này"
                  />
                </Field>
                <button
                  type="button"
                  disabled={saving || !selectedRace}
                  onClick={createMarket}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#D4A017] px-5 text-sm font-bold text-white transition hover:bg-[#B8941F] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                >
                  <Save className="h-4 w-4" />
                  Tạo cấu hình cược cho cuộc đua
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <div className="mb-4 flex items-center gap-3">
              <CircleDollarSign className="h-5 w-5 text-[#D4A017]" />
              <h2 className="text-xl font-bold text-white">
                Các lượt cược trong kèo cược này
              </h2>
            </div>
            {marketBets.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center text-white/45">
                Chọn "Xem lượt cược" ở kèo cược để tải danh sách, hoặc kèo cược này chưa có lượt cược nào.
              </div>
            ) : (
              <div className="space-y-3">
                {marketBets.map((bet) => (
                  <div
                    key={bet.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-white">
                          {bet.username || `Người dùng #${bet.userId || "-"}`}
                        </div>
                        <div className="text-sm text-white/45">
                          {bet.horseName} · {betStatusLabel(bet.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-[#D4A017]">
                          {fmtVND(bet.stakeAmount)}
                        </div>
                        <div className="text-xs text-white/40">
                          {formatDisplayDateTime(bet.placedAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function MarketSummary({ market, saving, onOpen, onClose, onSettle, onViewBets }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span
              className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${marketTone(market.status)}`}
            >
              {marketStatusLabel(market.status)}
            </span>
            <h3 className="mt-3 text-lg font-bold text-white">
              {market.raceName}
            </h3>
            <p className="text-sm text-white/50">{market.tournamentName}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/45">Khoảng tiền cược</div>
            <div className="font-black text-[#D4A017]">
              {fmtVND(market.minStake)} - {fmtVND(market.maxStake)}
            </div>
          </div>
        </div>
        {market.note && (
          <p className="mt-4 rounded-xl bg-white/[0.04] p-3 text-sm leading-6 text-white/55">
            {market.note}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {(market.status === "DRAFT" || market.status === "CLOSED") && (
          <button
            type="button"
            disabled={saving}
            onClick={onOpen}
            className="h-11 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
          >
            Mở kèo cược
          </button>
        )}
        {market.status === "OPEN" && (
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="h-11 rounded-xl bg-rose-500 px-4 text-sm font-bold text-white transition hover:bg-rose-600 disabled:opacity-50"
          >
            Đóng kèo cược
          </button>
        )}
        {market.status === "CLOSED" && (
          <button
            type="button"
            disabled={saving}
            onClick={onSettle}
            className="h-11 rounded-xl bg-purple-500 px-4 text-sm font-bold text-white transition hover:bg-purple-600 disabled:opacity-50"
          >
            Chốt kết quả cược
          </button>
        )}
        <button
          type="button"
          onClick={onViewBets}
          className="h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        >
          Xem lượt cược
        </button>
      </div>
    </div>
  );
}
