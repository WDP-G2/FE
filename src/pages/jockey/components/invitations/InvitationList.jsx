import { Mail } from "lucide-react";
import { InvitationCard } from "./InvitationCard";
import { InvitationComparisonGroup } from "./InvitationComparisonGroup";
import { getInvitationStatusMeta } from "../../utils/jockeyInvitationUtils";

export function InvitationList({
  filter,
  invitations,
  pendingGroups,
  otherInvitations,
  conflictMap,
  onAccept,
  onReject,
  savingId,
}) {
  const cardProps = { conflictMap, onAccept, onReject, savingId };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {(filter === "PENDING" || filter === "ALL") &&
        pendingGroups.map((group, idx) =>
          group.length > 1 ? (
            <InvitationComparisonGroup key={`group-${idx}`} group={group} {...cardProps} />
          ) : (
            <InvitationCard key={group[0].id} invitation={group[0]} {...cardProps} />
          ),
        )}

      {filter === "ALL" &&
        otherInvitations.map((invitation) => (
          <InvitationCard key={invitation.id} invitation={invitation} {...cardProps} />
        ))}

      {filter !== "PENDING" &&
        filter !== "ALL" &&
        otherInvitations
          .filter((inv) => inv.statusCode === filter)
          .map((invitation) => (
            <InvitationCard key={invitation.id} invitation={invitation} {...cardProps} />
          ))}

      {filter === "PENDING" && pendingGroups.length === 0 && (
        <EmptyInvitations message="Không có lời mời chờ phản hồi" />
      )}

      {filter === "ALL" && invitations.length === 0 && (
        <EmptyInvitations message="Không có lời mời nào" />
      )}

      {filter !== "PENDING" &&
        filter !== "ALL" &&
        otherInvitations.filter((inv) => inv.statusCode === filter).length === 0 && (
          <EmptyInvitations
            message={`Không có lời mời ${getInvitationStatusMeta(filter).label.toLowerCase()}`}
          />
        )}
    </div>
  );
}

function EmptyInvitations({ message }) {
  return (
    <div className="col-span-full py-16 text-center text-white/40">
      <Mail className="mx-auto mb-3 h-12 w-12 opacity-30" />
      <p>{message}</p>
    </div>
  );
}
