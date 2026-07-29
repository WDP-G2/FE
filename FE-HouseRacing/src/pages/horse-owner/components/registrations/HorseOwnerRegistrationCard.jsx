import { formatDisplayDateTime } from "@/utils/dateFormat";
import { fmtVND } from "@/utils/formatCurrency";
import { GlassCard, GhostButton, Pill } from "../../../admin/AdminLayout";

export function HorseOwnerRegistrationCard({
  onWithdraw,
  race,
  registration,
  saving,
  tournament,
}) {
  return (
    <GlassCard>
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Pill tone={registration.statusTone}>{registration.status}</Pill>
              {registration.rawId && (
                <span className="text-xs font-semibold text-white/35">#{registration.rawId}</span>
              )}
            </div>
            <h3 className="truncate text-base font-bold text-white">
              {tournament?.name || `Giải đấu #${registration.tournamentId}`}
            </h3>
            <p className="mt-1 text-xs text-white/55">
              {race?.name || registration.raceName || "Cuộc đua"} · {registration.horseName} ·
              Jockey: {registration.jockeyUsername || "Chưa cập nhật"}
            </p>
            <p className="mt-1 text-xs text-white/35">
              {formatDisplayDateTime(race?.scheduledStartAt, "Chưa cập nhật lịch")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-[#D4A017]">
              {fmtVND(registration.entryFeeAmount)}
            </div>
            <div className="mt-1 text-[11px] text-white/35">Lệ phí</div>
          </div>
        </div>

        {(registration.ownerNote || registration.reviewNote || registration.withdrawNote) && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55">
            {registration.ownerNote && <div>Ghi chú: {registration.ownerNote}</div>}
            {registration.reviewNote && (
              <div>Lý do admin từ chối: {registration.reviewNote}</div>
            )}
            {registration.withdrawNote && <div>Lý do rút: {registration.withdrawNote}</div>}
          </div>
        )}

        {registration.statusCode === "PENDING" && (
          <GhostButton disabled={saving} onClick={() => onWithdraw(registration)}>
            Rút đăng ký
          </GhostButton>
        )}
      </div>
    </GlassCard>
  );
}
