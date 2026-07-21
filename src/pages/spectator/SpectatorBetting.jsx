import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CircleDollarSign, Coins, Trophy } from "lucide-react";
import { bettingService } from "@/services/bettingService";
import { spectatorService } from "@/services/spectatorService";
import { fmtVND, formatMoneyInput, parseMoneyInput } from "@/utils/formatCurrency";
import { formatDisplayDateTime } from "@/utils/dateFormat";
import { getApiErrorMessage } from "@/utils/apiError";
import { EmptyState, ErrorState, LoadingState, Panel } from "./spectatorUi";
import { createIdempotencyKey } from "@/utils/idempotency";

function marketStatusLabel(status) {
  if (status === "OPEN") return "Đang mở";
  if (status === "DRAFT") return "Bản nháp";
  if (status === "CLOSED") return "Đã đóng";
  if (status === "SETTLED") return "Đã chốt";
  return status || "Chưa cập nhật";
}

export default function SpectatorBetting() {
  const [searchParams] = useSearchParams();
  const raceId = searchParams.get("raceId");
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState("");
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const betIdempotencyKeyRef = useRef(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadMarkets = async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const [dashboard, bettableMarkets] = await Promise.all([
        spectatorService.getDashboard().catch(() => null),
        bettingService.getBettableRaces(),
      ]);
      if (dashboard?.businessSummary?.marketplaceEnabled === false && bettableMarkets.length === 0) {
        setNotice("Tính năng đặt cược hiện đang tạm tắt trên backend.");
        setMarkets([]);
        setSelectedMarketId("");
        return;
      }

      if (raceId) {
        try {
          const publicMarket = await bettingService.getPublicMarket(raceId);
          const nextMarkets = publicMarket ? [publicMarket] : [];
          setMarkets(nextMarkets);
          setSelectedMarketId(
            nextMarkets[0]?.id ? String(nextMarkets[0].id) : "",
          );
          return;
        } catch {
          setNotice(
            "Cuộc đua này chưa có kèo cược đang mở. Đang hiển thị các kèo có thể đặt.",
          );
          if (bettableMarkets.length > 0) {
            setMarkets(bettableMarkets);
            setSelectedMarketId(String(bettableMarkets[0].id));
          } else {
            setMarkets([]);
            setSelectedMarketId("");
          }
          return;
        }
      }

      setMarkets(bettableMarkets);
      setSelectedMarketId(
        bettableMarkets[0]?.id ? String(bettableMarkets[0].id) : "",
      );
    } catch (err) {
      const message = getApiErrorMessage(err);
      if (
        /tính năng đặt cược hiện đang tạm tắt|betting feature is disabled/i.test(
          message,
        )
      ) {
        setNotice(message);
        setMarkets([]);
        setSelectedMarketId("");
      } else {
        setError(message || "Không tải được danh sách kèo cược");
        setMarkets([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceId]);

  const selectedMarket = useMemo(
    () =>
      markets.find(
        (market) => String(market.id) === String(selectedMarketId),
      ) || markets[0],
    [markets, selectedMarketId],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedParticipantId(selectedMarket?.options?.[0]?.participantId || "");
    setStakeAmount(
      selectedMarket?.minStake ? String(selectedMarket.minStake) : "",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMarket?.id]);

  const placeBet = async () => {
    if (!selectedMarket) return;
    const amount = Number(stakeAmount);
    if (!selectedParticipantId) {
      toast.error("Vui lòng chọn ngựa để đặt cược");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Số tiền cược phải lớn hơn 0");
      return;
    }
    if (selectedMarket.minStake && amount < selectedMarket.minStake) {
      toast.error(`Số tiền tối thiểu là ${fmtVND(selectedMarket.minStake)}`);
      return;
    }
    if (selectedMarket.maxStake && amount > selectedMarket.maxStake) {
      toast.error(`Số tiền tối đa là ${fmtVND(selectedMarket.maxStake)}`);
      return;
    }

    setSubmitting(true);
    try {
      if (!betIdempotencyKeyRef.current) betIdempotencyKeyRef.current = createIdempotencyKey();
      await bettingService.placeBet(selectedMarket.raceId, {
        participantId: String(selectedParticipantId),
        stakeAmount: amount,
      }, betIdempotencyKeyRef.current);
      betIdempotencyKeyRef.current = null;
      toast.success("Đặt cược thành công");
      await loadMarkets();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Đặt cược thất bại",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Đang tải kèo cược..." />;
  if (error) return <ErrorState message={error} onRetry={loadMarkets} />;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wide text-[#D4A017]">
          Đặt cược
        </p>
        <h2 className="text-3xl font-black text-white">Kèo đang mở</h2>
        {notice && <p className="mt-2 text-sm text-white/50">{notice}</p>}
      </section>

      {markets.length === 0 ? (
        <EmptyState>Hiện chưa có cuộc đua nào đang mở cược.</EmptyState>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Danh sách kèo cược">
            <div className="space-y-3">
              {markets.map((market) => (
                <button
                  key={market.id}
                  type="button"
                  onClick={() => setSelectedMarketId(String(market.id))}
                  className={`w-full rounded-xl border p-4 text-left transition ${String(selectedMarket?.id) === String(market.id)
                    ? "border-[#D4A017]/60 bg-[#D4A017]/12"
                    : "border-white/10 bg-white/[0.035] hover:border-white/25"
                    }`}
                >
                  <div className="font-black text-white">{market.raceName}</div>
                  <div className="mt-1 text-sm text-white/50">
                    {market.tournamentName}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/45">
                    <span className="rounded-full bg-white/5 px-2 py-1">
                      {marketStatusLabel(market.status)}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-1">
                      {fmtVND(market.minStake)} - {fmtVND(market.maxStake)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Đặt cược">
            {!selectedMarket ? (
              <EmptyState>Chọn một kèo cược để đặt cược.</EmptyState>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-start gap-3">
                    <Trophy className="mt-1 h-5 w-5 text-[#D4A017]" />
                    <div>
                      <h3 className="text-xl font-black text-white">
                        {selectedMarket.raceName}
                      </h3>
                      <p className="text-sm text-white/50">
                        {selectedMarket.tournamentName}
                      </p>
                      <p className="mt-2 text-xs text-white/38">
                        Mở lúc: {formatDisplayDateTime(selectedMarket.openedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-white/70">
                    Chọn ngựa
                  </label>
                  {selectedMarket.options.length === 0 ? (
                    <EmptyState>
                      Kèo này chưa có danh sách ngựa hợp lệ.
                    </EmptyState>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedMarket.options.map((option) => (
                        <button
                          key={option.participantId}
                          type="button"
                          onClick={() =>
                            setSelectedParticipantId(option.participantId)
                          }
                          className={`rounded-xl border p-4 text-left transition ${String(selectedParticipantId) ===
                            String(option.participantId)
                            ? "border-[#D4A017]/60 bg-[#D4A017]/12"
                            : "border-white/10 bg-white/[0.035] hover:border-white/25"
                            }`}
                        >
                          <div className="font-black text-white">
                            {option.horseName}
                          </div>
                          <div className="mt-1 text-xs text-white/45">
                            Ô xuất phát {option.gateNumber || "-"} ·{" "}
                            {option.jockeyUsername}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white/70">
                    Số tiền cược
                  </span>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                    <input
                      value={formatMoneyInput(stakeAmount)}
                      onChange={(event) => setStakeAmount(parseMoneyInput(event.target.value))}
                      type="text"
                      inputMode="numeric"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-10 pr-4 text-sm font-bold text-white outline-none transition placeholder:text-white/30 focus:border-[#D4A017]/50"
                    />
                  </div>
                  <span className="mt-2 block text-xs text-white/40">
                    Tối thiểu {fmtVND(selectedMarket.minStake)} · Tối đa{" "}
                    {fmtVND(selectedMarket.maxStake)}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={placeBet}
                  disabled={
                    submitting ||
                    selectedMarket.status !== "OPEN" ||
                    selectedMarket.options.length === 0
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4A017] px-5 py-3 text-sm font-black text-white transition hover:bg-[#B8941F] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
                >
                  <CircleDollarSign className="h-4 w-4" />
                  {submitting ? "Đang đặt cược..." : "Xác nhận đặt cược"}
                </button>
              </div>
            )}
          </Panel>
        </section>
      )}
    </div>
  );
}
