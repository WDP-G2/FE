import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  MapPin,
  PawPrint,
  User,
  X,
} from "lucide-react";
import { GlassCard } from "../../../admin/AdminLayout";
import { JockeyInfoRow } from "../JockeyInfoRow";
import {
  formatGroupTimeRange,
  formatInvitationDateTime,
  formatRaceWindow,
} from "../../utils/jockeyInvitationUtils";

export function InvitationComparisonGroup({
  group,
  conflictMap,
  onAccept,
  onReject,
  savingId,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const highestRemuneration = Math.max(...group.map((inv) => inv.remunerationAmount || 0));

  const first = group[0];
  const allSameRace = group.every(
    (inv) => inv.raceId && String(inv.raceId) === String(first.raceId),
  );
  const allSameTournament = group.every(
    (inv) => inv.tournamentId && String(inv.tournamentId) === String(first.tournamentId),
  );

  const timeRangeText = useMemo(() => formatGroupTimeRange(group), [group]);

  return (
    <GlassCard className="col-span-full border-amber-500/30 bg-gradient-to-b from-[#14233C]/95 to-[#0B1526]/95 overflow-hidden ring-1 ring-amber-500/20 shadow-2xl">
      <div className="border-b border-white/10 bg-amber-500/[0.04] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="h-4.5 w-4.5" />
              </span>
              <h3 className="text-lg font-bold text-white truncate">
                So Sánh Lời Mời Trùng Lịch ({group.length} lời mời)
              </h3>
            </div>

            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-white/70">
                📅 Lịch: <strong className="text-white font-semibold">{timeRangeText}</strong>
              </span>
              {allSameRace && first.raceName && (
                <span className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-white/70">
                  🏁 Cuộc đua: <strong className="text-white font-semibold">{first.raceName}</strong>
                </span>
              )}
              {allSameTournament && first.tournamentName && (
                <span className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-white/70">
                  🏆 Giải: <strong className="text-white font-semibold">{first.tournamentName}</strong>
                </span>
              )}
              {!allSameRace && (
                <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300 font-semibold">
                  ⚠️ Nhiều cuộc đua trùng giờ
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70 transition-all hover:bg-white/10 hover:text-white"
          >
            {isExpanded ? (
              <>
                <span>Thu gọn</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Mở rộng</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        {isExpanded && (
          <p className="mt-3 text-xs text-white/50 border-t border-white/5 pt-3 leading-relaxed">
            Các lời mời này bị trùng lịch hoặc cùng cuộc đua. Bạn chỉ có thể chấp nhận tối đa 1 lời
            mời; các lời mời còn lại trong nhóm sẽ tự động hủy.
          </p>
        )}
      </div>

      {isExpanded && (
        <div className="p-5 bg-black/10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {group.map((invitation) => {
              const isHighest =
                invitation.remunerationAmount === highestRemuneration && highestRemuneration > 0;
              const conflicts = conflictMap[invitation.id] ?? { pending: [], accepted: [] };
              const hasAcceptedConflicts = conflicts.accepted.length > 0;

              return (
                <div
                  key={invitation.id}
                  className={[
                    "flex flex-col justify-between rounded-xl border p-4 transition-all duration-300 hover:bg-white/[0.04] relative",
                    isHighest
                      ? "border-emerald-500/35 bg-emerald-500/[0.02] shadow-lg shadow-emerald-950/10"
                      : "border-white/10 bg-white/[0.02]",
                    hasAcceptedConflicts ? "opacity-75" : "",
                  ].join(" ")}
                >
                  {isHighest && (
                    <div className="absolute top-0 right-4 -translate-y-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-emerald-500/20">
                        ✨ Thù lao tốt nhất
                      </span>
                    </div>
                  )}

                  <div className="relative">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D4A017]/25 bg-gradient-to-br from-[#D4A017]/15 to-[#0F1E3A]">
                        <PawPrint className="h-4.5 w-4.5 text-[#D4A017]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-bold text-white">
                          {invitation.horseName || "Ngựa chưa cập nhật"}
                        </h4>
                        <p className="truncate text-[11px] text-white/50">
                          Chủ: {invitation.ownerUsername || `Owner #${invitation.ownerId}`}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4 space-y-2 border-t border-white/5 pt-3 text-xs text-white/70">
                      <JockeyInfoRow
                        icon={Calendar}
                        text={`Giải đấu: ${invitation.tournamentName || "Chưa cập nhật"}`}
                      />
                      <JockeyInfoRow
                        icon={PawPrint}
                        text={`Cuộc đua: ${invitation.raceName || "Chưa cập nhật"}`}
                      />
                      <JockeyInfoRow icon={Clock} text={`Lịch đua: ${formatRaceWindow(invitation)}`} />
                      {(invitation.venueName || invitation.venueAddress) && (
                        <JockeyInfoRow
                          icon={MapPin}
                          text={`Sân: ${[invitation.venueName, invitation.venueAddress].filter(Boolean).join(" · ")}`}
                        />
                      )}
                      <JockeyInfoRow icon={User} text={`Mã owner: ${invitation.ownerId ?? "N/A"}`} />
                      <JockeyInfoRow
                        icon={Calendar}
                        text={`Gửi lúc: ${formatInvitationDateTime(invitation.createdAt)}`}
                      />
                      <JockeyInfoRow
                        icon={DollarSign}
                        text={`Thù lao: ${invitation.remunerationText}`}
                        highlight
                      />

                      {invitation.message && (
                        <div className="mt-2 rounded-lg border border-white/5 bg-white/5 p-2 text-white/60 italic text-[11px] leading-relaxed">
                          "{invitation.message}"
                        </div>
                      )}

                      {hasAcceptedConflicts && (
                        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-[11px] font-semibold text-red-400">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>Trùng lịch đã nhận</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-white/5 pt-3">
                    <button
                      type="button"
                      onClick={() => onReject(invitation.id)}
                      disabled={savingId === invitation.id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/20 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-60"
                    >
                      <X className="h-3.5 w-3.5" />
                      Từ chối
                    </button>
                    <button
                      type="button"
                      disabled={savingId === invitation.id || hasAcceptedConflicts}
                      onClick={() => onAccept(invitation)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#D4A017] hover:bg-[#B8941F] py-2 text-xs font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Chấp nhận
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </GlassCard>
  );
}
