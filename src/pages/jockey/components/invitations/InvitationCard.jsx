import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
  PawPrint,
  User,
  X,
} from "lucide-react";
import { GlassCard, Pill, PrimaryButton } from "../../../admin/AdminLayout";
import { JockeyInfoRow } from "../JockeyInfoRow";
import { ConflictBadge } from "./ConflictBadge";
import { MiniInvitationRow } from "./MiniInvitationRow";
import {
  formatInvitationDateTime,
  formatRaceWindow,
  getInvitationStatusMeta,
} from "../../utils/jockeyInvitationUtils";

export function InvitationCard({ invitation, conflictMap, onAccept, onReject, savingId }) {
  const meta = getInvitationStatusMeta(invitation.statusCode);
  const conflicts = conflictMap[invitation.id] ?? { pending: [], accepted: [] };
  const hasPendingConflicts = conflicts.pending.length > 0;
  const hasAcceptedConflicts = conflicts.accepted.length > 0;

  return (
    <GlassCard
      className={[
        "overflow-hidden transition-all duration-300 hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-black/30",
        invitation.statusCode === "PENDING" ? "border-[#D4A017]/30" : "border-white/10",
        hasPendingConflicts ? "ring-1 ring-amber-300/25" : "",
        hasAcceptedConflicts ? "ring-1 ring-red-400/30" : "",
      ].join(" ")}
    >
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#D4A017]/20 bg-gradient-to-br from-[#D4A017]/20 to-[#0F1E3A]">
              <PawPrint className="h-6 w-6 text-[#D4A017]" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-white">
                {invitation.horseName || "Ngựa chưa cập nhật"}
              </h3>
              <p className="text-xs text-white/50">
                Từ chủ ngựa: {invitation.ownerUsername || `Owner #${invitation.ownerId}`}
              </p>
            </div>
          </div>
          <Pill tone={meta.tone}>{meta.label}</Pill>
        </div>

        {(hasPendingConflicts || hasAcceptedConflicts) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {hasPendingConflicts && (
              <ConflictBadge>
                Nhận lời mời này sẽ hủy {conflicts.pending.length} lời mời liên quan
              </ConflictBadge>
            )}
            {hasAcceptedConflicts && (
              <ConflictBadge type="danger">Đang trùng với lịch đã nhận</ConflictBadge>
            )}
          </div>
        )}

        <div className="mb-4 space-y-2.5">
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
          <JockeyInfoRow icon={Calendar} text={`Gửi lúc: ${formatInvitationDateTime(invitation.createdAt)}`} />
          <JockeyInfoRow
            icon={DollarSign}
            text={`Thù lao: ${invitation.remunerationText}`}
            highlight
          />
          {invitation.message && <JockeyInfoRow icon={MessageSquare} text={invitation.message} />}
          {invitation.responseNote && (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white/55">
              Phản hồi: {invitation.responseNote}
            </div>
          )}
        </div>

        {hasPendingConflicts && (
          <div className="mb-4 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-100">
              <AlertTriangle className="h-4 w-4" />
              Lời mời sẽ tự hủy nếu bạn chấp nhận
            </div>
            <div className="space-y-2">
              {conflicts.pending.slice(0, 2).map((item) => (
                <MiniInvitationRow key={item.invitation.id} item={item} />
              ))}
              {conflicts.pending.length > 2 && (
                <p className="text-xs text-white/45">
                  Và {conflicts.pending.length - 2} lời mời liên quan khác.
                </p>
              )}
            </div>
          </div>
        )}

        {invitation.statusCode === "PENDING" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onReject(invitation.id)}
              disabled={savingId === invitation.id}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/10 disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Từ chối
            </button>
            <PrimaryButton
              icon={Check}
              className="flex-1"
              disabled={savingId === invitation.id || hasAcceptedConflicts}
              onClick={() => onAccept(invitation)}
            >
              Chấp nhận
            </PrimaryButton>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
