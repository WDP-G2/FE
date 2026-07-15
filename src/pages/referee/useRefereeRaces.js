import { useCallback, useEffect, useRef, useState } from 'react'
import { refereeService } from '@/services/refereeService'
import { TOURNAMENT_STATUS_UPDATED_EVENT } from '@/services/tournamentService'
import {
  loadAssignedRacesFromApi,
  filterRacesForRefereeOperation,
  REFEREE_INVITATIONS_UPDATED_EVENT,
} from '@/services/refereeInvitationService'
import { useAuthStore } from '@/store/authStore'
import {
  buildTournamentNameMap,
  buildTournamentStatusMap,
  summarizeParticipantCheckIn,
  mapRaceFromApi,
} from '@/utils/refereeRaceUtils'
import { getApiErrorMessage } from '@/utils/apiError'

function mapAssignedRaces(data, { nameById = new Map(), statusById = new Map() } = {}) {
  return data.map((raw, index) => mapRaceFromApi({
    ...raw,
    tournamentName: raw.tournamentName || nameById.get(String(raw.tournamentId)),
    tournamentStatus: statusById.get(String(raw.tournamentId)) ?? raw.tournamentStatus ?? '',
  }, index))
}

async function enrichRacesWithCheckInProgress(races) {
  if (!Array.isArray(races) || !races.length) return races

  const enriched = await Promise.all(
    races.map(async (race) => {
      if (!race?.id) return race

      try {
        const participants = await refereeService.getRaceParticipants(race.id)
        const stats = summarizeParticipantCheckIn(participants)
        const participantCount = stats.total || Number(race.participantCount ?? 0)

        return {
          ...race,
          participantCount,
          totalHorses: participantCount,
          checkedInCount: stats.presentCount,
          checkedInDisplay: stats.presentCount,
          pendingCheckInCount: stats.pendingCount,
          absentCount: stats.absentCount,
        }
      } catch {
        return race
      }
    }),
  )

  return enriched
}

export function useRefereeRaces({ operationOnly = true } = {}) {
  const userId = useAuthStore((state) => state.user?.id ?? state.user?.userId)
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const hasLoadedRef = useRef(false)
  const reloadingRef = useRef(false)

  const reload = useCallback(async ({ silent = false } = {}) => {
    if (reloadingRef.current) return
    reloadingRef.current = true

    const isInitialLoad = !hasLoadedRef.current
    if (isInitialLoad && !silent) {
      setLoading(true)
    } else if (!silent) {
      setRefreshing(true)
    }
    setError('')

    try {
      const data = await loadAssignedRacesFromApi()
      const allowed = operationOnly ? filterRacesForRefereeOperation(data) : data
      const tournamentIds = allowed.map((race) => race.tournamentId)

      let nameById = new Map()
      let statusById = new Map()
      try {
        ;[nameById, statusById] = await Promise.all([
          buildTournamentNameMap(tournamentIds),
          buildTournamentStatusMap(tournamentIds),
        ])
      } catch {
        // dùng dữ liệu race gốc nếu không tải được meta giải
      }

      const mapped = mapAssignedRaces(allowed, { nameById, statusById })
      const withCheckIn = await enrichRacesWithCheckInProgress(mapped)
      setRaces(withCheckIn)
      hasLoadedRef.current = true
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Không tải được danh sách cuộc đua')
      if (!hasLoadedRef.current) {
        setRaces([])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      reloadingRef.current = false
    }
  }, [userId, operationOnly])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const handleInvitationsUpdated = () => reload({ silent: true })
    const handleTournamentStatusUpdated = () => reload({ silent: true })

    window.addEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, handleInvitationsUpdated)
    window.addEventListener(TOURNAMENT_STATUS_UPDATED_EVENT, handleTournamentStatusUpdated)

    const onVisible = () => {
      if (document.visibilityState === 'visible') reload({ silent: true })
    }
    window.addEventListener('focus', handleTournamentStatusUpdated)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.removeEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, handleInvitationsUpdated)
      window.removeEventListener(TOURNAMENT_STATUS_UPDATED_EVENT, handleTournamentStatusUpdated)
      window.removeEventListener('focus', handleTournamentStatusUpdated)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [reload])

  return { races, loading, refreshing, error, reload }
}
