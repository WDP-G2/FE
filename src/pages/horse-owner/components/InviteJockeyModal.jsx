import { useEffect, useMemo, useState } from "react";
import { X, Send } from "lucide-react";
import { GlassCard, GhostButton, PrimaryButton } from "../../admin/AdminLayout";
import { horseService } from "@/services/horseService";
import { tournamentService } from "@/services/tournamentService";
import { invitationService } from "@/services/invitationService";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";

function formatRaceLabel(race) {
  if (!race) return "";
  const num = race.raceNumber ? `R${race.raceNumber}` : "";
  return [num, race.name].filter(Boolean).join(" · ");
}

export function InviteJockeyModal({ jockey, open, onClose, onSent }) {
  const [horses, setHorses] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [horseId, setHorseId] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [raceId, setRaceId] = useState("");
  const [reward, setReward] = useState("");

  useEffect(() => {
    if (!open) return;
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const [horseList, tournamentList] = await Promise.all([
          horseService.listMine(),
          tournamentService.listOwnerOpen(),
        ]);
        if (!alive) return;
        setHorses(horseList);
        setTournaments(tournamentList);
        setHorseId(horseList[0]?.id || "");
        setTournamentId(tournamentList[0]?.id || "");
        setRaceId("");
        setReward("");
      } catch (err) {
        if (alive) {
          toast.error(
            getApiErrorMessage(err) || "Không tải được dữ liệu mời jockey",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [open]);

  const selectedTournament = useMemo(
    () => tournaments.find((t) => t.id === tournamentId),
    [tournamentId, tournaments],
  );

  const races = selectedTournament?.races || [];

  useEffect(() => {
    if (!races.length) {
      setRaceId("");
      return;
    }
    if (!races.some((r) => r.id === raceId)) {
      setRaceId(races[0].id);
    }
  }, [raceId, races]);

  const selectedRace = races.find((r) => r.id === raceId);

  useEffect(() => {
    if (!selectedRace || reward) return;
    const fee = selectedRace.entryFee || selectedTournament?.config?.entryFee;
    if (fee) setReward(String(fee));
  }, [reward, selectedRace, selectedTournament]);

  if (!open || !jockey) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!horseId || !tournamentId) {
      toast.error("Vui lòng chọn ngựa và giải đấu");
      return;
    }

    setSubmitting(true);
    try {
      await invitationService.create({
        jockeyId: jockey.id,
        horseId,
        tournamentId,
        raceId: raceId || undefined,
        reward: Number(reward) || 0,
      });
      toast.success(
        `Đã gửi lời mời — chờ ${jockey.name} chấp nhận hoặc từ chối`,
      );
      await onSent?.();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Gửi lời mời thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <GlassCard className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="text-lg font-bold text-white">Mời jockey thi đấu</h2>
              <p className="text-sm text-white/45">
                Gửi lời mời đến {jockey.name}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 transition hover:bg-white/10"
            >
              <X className="h-4 w-4 text-white/60" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            {loading ? (
              <p className="text-sm text-white/50">Đang tải dữ liệu...</p>
            ) : (
              <>
                <label className="block text-sm text-white/60">
                  Ngựa thi đấu
                  <select
                    value={horseId}
                    onChange={(e) => setHorseId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#D4A017]/50 focus:outline-none"
                  >
                    {horses.length === 0 ? (
                      <option value="">Chưa có ngựa</option>
                    ) : (
                      horses.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label className="block text-sm text-white/60">
                  Giải đấu
                  <select
                    value={tournamentId}
                    onChange={(e) => {
                      setTournamentId(e.target.value);
                      setRaceId("");
                    }}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#D4A017]/50 focus:outline-none"
                  >
                    {tournaments.length === 0 ? (
                      <option value="">Không có giải đang mở</option>
                    ) : (
                      tournaments.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label className="block text-sm text-white/60">
                  Chặng đua
                  <select
                    value={raceId}
                    onChange={(e) => setRaceId(e.target.value)}
                    disabled={!races.length}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#D4A017]/50 focus:outline-none disabled:opacity-50"
                  >
                    {races.length === 0 ? (
                      <option value="">Chưa có chặng mở đăng ký</option>
                    ) : (
                      races.map((r) => (
                        <option key={r.id} value={r.id}>
                          {formatRaceLabel(r)}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label className="block text-sm text-white/60">
                  Thù lao (VNĐ)
                  <input
                    type="number"
                    min="0"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    placeholder="5000000"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:border-[#D4A017]/50 focus:outline-none"
                  />
                </label>

                {selectedTournament && (
                  <p className="text-xs text-white/40">
                    Địa điểm: {selectedTournament.location || "Chưa cập nhật"}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-white/10 p-5">
            <GhostButton type="button" onClick={onClose}>
              Hủy
            </GhostButton>
            <PrimaryButton
              type="submit"
              icon={Send}
              disabled={
                submitting || loading || !horseId || !tournamentId || !horses.length
              }
            >
              {submitting ? "Đang gửi..." : "Gửi lời mời"}
            </PrimaryButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
