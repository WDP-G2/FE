import { GlassCard } from "../admin/AdminLayout";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { HorseOwnerInvitationDetailModal } from "./components/jockeys/HorseOwnerInvitationDetailModal";
import { HorseOwnerJockeyDetailModal } from "./components/jockeys/HorseOwnerJockeyDetailModal";
import { HorseOwnerJockeyInviteModal } from "./components/jockeys/HorseOwnerJockeyInviteModal";
import { HorseOwnerJockeyList } from "./components/jockeys/HorseOwnerJockeyList";
import { HorseOwnerJockeyStats } from "./components/jockeys/HorseOwnerJockeyStats";
import { HorseOwnerJockeyToolbar } from "./components/jockeys/HorseOwnerJockeyToolbar";
import { HorseOwnerJockeyTournamentNotice } from "./components/jockeys/HorseOwnerJockeyTournamentNotice";
import { useHorseOwnerJockeys } from "./hooks/useHorseOwnerJockeys";

export function HorseOwnerJockeys() {
  const {
    approvedHorses,
    cancelInvite,
    closeDetail,
    closeInvitationDetail,
    closeInvite,
    detailTarget,
    filterStatus,
    filteredJockeys,
    formatRaceDate,
    getJockeyRaceLockReason,
    handleInviteHorseChange,
    handleInviteRaceChange,
    invitations,
    inviteForm,
    inviteTarget,
    invitationDetailTarget,
    isHorseDisabledForSelectedRace,
    isRaceDisabledForSelectedHorse,
    jockeys,
    loading,
    loadingDetail,
    openDetail,
    openInvitationDetail,
    openInvite,
    pendingJockeyRaceConflicts,
    saving,
    scopedRaceOptions,
    search,
    selectedTournament,
    selectedTournamentId,
    setFilterStatus,
    setInviteForm,
    setSearch,
    statusFilters,
    submitInvite,
  } = useHorseOwnerJockeys();

  return (
    <HorseOwnerLayout
      title="Horse Owner · Jockey"
      subtitle="Tìm kiếm tất cả account jockey, gửi lời mời theo ngựa và theo dõi trạng thái phản hồi"
    >
      <HorseOwnerJockeyToolbar
        filterStatus={filterStatus}
        onChangeFilterStatus={setFilterStatus}
        onChangeSearch={setSearch}
        search={search}
        statusFilters={statusFilters}
      />

      {selectedTournamentId && (
        <HorseOwnerJockeyTournamentNotice tournamentName={selectedTournament?.name} />
      )}

      <HorseOwnerJockeyStats invitations={invitations} jockeyCount={jockeys.length} />

      {loading ? (
        <GlassCard className="p-10 text-center text-sm text-white/60">
          Đang tải danh sách jockey...
        </GlassCard>
      ) : (
        <HorseOwnerJockeyList
          jockeys={filteredJockeys}
          onCancelInvite={cancelInvite}
          onOpenDetail={openDetail}
          onOpenInvitationDetail={openInvitationDetail}
          onOpenInvite={openInvite}
          saving={saving}
        />
      )}

      {detailTarget && (
        <HorseOwnerJockeyDetailModal
          formatRaceDate={formatRaceDate}
          jockey={detailTarget}
          loading={loadingDetail}
          onClose={closeDetail}
        />
      )}

      {invitationDetailTarget && (
        <HorseOwnerInvitationDetailModal
          formatRaceDate={formatRaceDate}
          invitation={invitationDetailTarget}
          onCancelInvite={cancelInvite}
          onClose={closeInvitationDetail}
          saving={saving}
        />
      )}

      {inviteTarget && (
        <HorseOwnerJockeyInviteModal
          approvedHorses={approvedHorses}
          form={inviteForm}
          getJockeyRaceLockReason={getJockeyRaceLockReason}
          inviteTarget={inviteTarget}
          isHorseDisabledForSelectedRace={isHorseDisabledForSelectedRace}
          isRaceDisabledForSelectedHorse={isRaceDisabledForSelectedHorse}
          onChangeForm={setInviteForm}
          onChangeHorse={handleInviteHorseChange}
          onChangeRace={handleInviteRaceChange}
          onClose={closeInvite}
          onSubmit={submitInvite}
          pendingJockeyRaceConflicts={pendingJockeyRaceConflicts}
          raceOptions={scopedRaceOptions}
          saving={saving}
        />
      )}
    </HorseOwnerLayout>
  );
}
