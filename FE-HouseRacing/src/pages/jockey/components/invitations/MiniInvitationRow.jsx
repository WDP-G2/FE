import { ConflictBadge } from "./ConflictBadge";
import { formatRaceWindow } from "../../utils/jockeyInvitationUtils";

export function MiniInvitationRow({ item }) {
  const invitation = item.invitation;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {invitation.raceName || "Cuộc đua chưa cập nhật"}
          </p>
          <p className="truncate text-xs text-white/45">
            {invitation.horseName || "Ngựa chưa cập nhật"} ·{" "}
            {invitation.ownerUsername || `Owner #${invitation.ownerId}`}
          </p>
        </div>
        <ConflictBadge>{item.reason}</ConflictBadge>
      </div>
      <div className="grid gap-1 text-xs text-white/55 sm:grid-cols-2">
        <span>{formatRaceWindow(invitation)}</span>
        <span>{invitation.remunerationText}</span>
      </div>
    </div>
  );
}
