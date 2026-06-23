import { X } from "lucide-react";
import { GlassCard, GhostButton, Pill } from "../../../admin/AdminLayout";

export function HorseOwnerInvitationDetailModal({
  formatRaceDate,
  invitation,
  onCancelInvite,
  onClose,
  saving,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="font-bold text-white">Chi tiết lời mời</h2>
            <p className="mt-1 text-sm text-white/45">
              {invitation.jockeyName} · {invitation.jockeyLicense}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all hover:bg-white/10"
          >
            <X className="h-5 w-5 text-white/60" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Trạng thái
              </div>
              <div className="mt-2">
                <Pill tone={invitation.statusTone}>{invitation.status}</Pill>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Thù lao
              </div>
              <div className="mt-1 text-lg font-bold text-[#D4A017]">
                {invitation.remunerationText}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Ngựa", invitation.horseName || "Chưa cập nhật"],
              ["Jockey", invitation.jockeyName || invitation.jockeyUsername],
              ["Giải đấu", invitation.tournamentName || "Chưa cập nhật"],
              ["Cuộc đua", invitation.raceName || "Chưa cập nhật"],
              ["Mã lời mời", `#${invitation.rawId ?? invitation.id}`],
              ["Gửi lúc", formatRaceDate(invitation.createdAt)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                  {label}
                </div>
                <div className="mt-1 font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>

          {invitation.message && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Lời nhắn
              </div>
              <p className="mt-2 text-sm leading-6 text-white/70">{invitation.message}</p>
            </div>
          )}

          {invitation.responseNote && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                Phản hồi của jockey
              </div>
              <p className="mt-2 text-sm leading-6 text-white/70">{invitation.responseNote}</p>
            </div>
          )}

          {invitation.invitations?.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
                Tất cả lời mời của jockey này
              </div>
              <div className="space-y-2">
                {invitation.invitations.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-white">
                          {item.raceName || "Race chưa cập nhật"}
                        </div>
                        <div className="mt-1 text-xs text-white/45">
                          {item.horseName || "Ngựa chưa cập nhật"} ·{" "}
                          {formatRaceDate(item.raceScheduledStartAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Pill tone={item.statusTone}>{item.status}</Pill>
                        {item.statusCode === "PENDING" && (
                          <GhostButton
                            icon={X}
                            disabled={saving}
                            onClick={() => onCancelInvite(item)}
                          >
                            Hủy
                          </GhostButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-white/10 pt-4">
            <GhostButton onClick={onClose}>Đóng</GhostButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
