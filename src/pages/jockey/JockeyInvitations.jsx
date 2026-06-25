import { JockeyLayout } from "./JockeyLayout";
import { GlassCard } from "../admin/AdminLayout";
import { useJockeyInvitations } from "./hooks/useJockeyInvitations";
import { InvitationFilterBar } from "./components/invitations/InvitationFilterBar";
import { InvitationList } from "./components/invitations/InvitationList";
import { InvitationAcceptModal } from "./components/invitations/InvitationAcceptModal";

export function JockeyInvitations() {
  const {
    invitations,
    filter,
    setFilter,
    loading,
    savingId,
    acceptTarget,
    setAcceptTarget,
    pendingCount,
    conflictMap,
    pendingGroups,
    otherInvitations,
    reject,
    confirmAccept,
  } = useJockeyInvitations();

  return (
    <JockeyLayout
      title="Jockey · Lời mời thi đấu"
      subtitle={`${pendingCount} lời mời đang chờ phản hồi`}
    >
      <InvitationFilterBar filter={filter} onChange={setFilter} />

      {loading ? (
        <GlassCard className="p-10 text-center text-sm text-white/60">
          Đang tải lời mời thi đấu...
        </GlassCard>
      ) : (
        <InvitationList
          filter={filter}
          invitations={invitations}
          pendingGroups={pendingGroups}
          otherInvitations={otherInvitations}
          conflictMap={conflictMap}
          onAccept={setAcceptTarget}
          onReject={reject}
          savingId={savingId}
        />
      )}

      <InvitationAcceptModal
        acceptTarget={acceptTarget}
        conflictMap={conflictMap}
        savingId={savingId}
        onClose={() => setAcceptTarget(null)}
        onConfirm={confirmAccept}
      />
    </JockeyLayout>
  );
}
