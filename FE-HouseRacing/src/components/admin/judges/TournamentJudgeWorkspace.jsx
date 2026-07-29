import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import { GhostButton, GlassCard } from '@/pages/admin/AdminLayout'
import { tournamentService } from '@/services/tournamentService'
import { fetchAdminInvitations, REFEREE_INVITATIONS_UPDATED_EVENT } from '@/services/refereeInvitationService'
import { mapTournamentForJudges } from '@/utils/judgeTournamentUtils'
import RaceListPanel from './RaceListPanel'
import JudgeAssigner from './JudgeAssigner'

const POLL_MS = 12_000

export default function TournamentJudgeWorkspace({ tournament, onBack, onTournamentUpdated }) {
  const [activeRaceId, setActiveRaceId] = useState(tournament.races[0]?.id ?? '')
  const [, forceRender] = useState(0)
  const activeRace =
    tournament.races.find((race) => race.id === activeRaceId) ?? tournament.races[0]

  useEffect(() => {
    if (!tournament?.id || !onTournamentUpdated) return undefined

    let cancelled = false

    const refresh = async () => {
      try {
        await fetchAdminInvitations({ notify: false })
        const response = await tournamentService.getAdminTournament(tournament.id)
        if (!cancelled) {
          onTournamentUpdated(mapTournamentForJudges(response.data))
        }
      } catch {
        // giữ dữ liệu hiện tại nếu không tải lại được
      }
    }

    refresh()
    const timer = setInterval(refresh, POLL_MS)
    const onFocus = () => refresh()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    window.addEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, refresh)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, refresh)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [tournament.id, onTournamentUpdated])

  const updateRaceJudges = (nextAssignments) => {
    if (!activeRace) return
    activeRace.judges = nextAssignments
    forceRender((value) => value + 1)
  }

  const handleAssigned = async ({ refereeId }) => {
    if (!activeRace || !refereeId) return

    activeRace.raw = {
      ...(activeRace.raw ?? {}),
      refereeId: Number(refereeId),
    }
    forceRender((value) => value + 1)

    if (!onTournamentUpdated) return

    try {
      const response = await tournamentService.getAdminTournament(tournament.id)
      onTournamentUpdated(mapTournamentForJudges(response.data))
    } catch {
      // Giữ cập nhật cục bộ nếu không tải lại được chi tiết giải.
    }
  }

  return (
    <AdminLayout
      heading="Phân công trọng tài"
      highlight={tournament.name}
      subtitle={`${tournament.location} · ${tournament.races.length} cuộc đua`}
      action={
        <>
          <GhostButton icon={ArrowLeft} onClick={onBack}>
            Danh sách giải
          </GhostButton>
          <Link to={`/admin/tournaments/${tournament.id}`}>
            <GhostButton icon={ArrowRight}>Mở giải đấu</GhostButton>
          </Link>
        </>
      }
    >
      {tournament.races.length === 0 ? (
        <GlassCard className="p-10 text-center text-white/50">
          <Flag className="mx-auto mb-3 h-10 w-10 opacity-40" />
          Giải đấu này chưa có cuộc đua nào. Hãy thêm cuộc đua trước khi phân công trọng tài.
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-4">
            <RaceListPanel
              races={tournament.races}
              activeRaceId={activeRace?.id}
              onSelectRace={setActiveRaceId}
            />
          </div>
          <div className="min-w-0 lg:col-span-8">
            {activeRace ? (
              <JudgeAssigner
                tournament={tournament}
                race={activeRace}
                onChangeJudges={updateRaceJudges}
                onAssigned={handleAssigned}
              />
            ) : null}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
