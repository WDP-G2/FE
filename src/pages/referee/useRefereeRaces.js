import { useCallback, useEffect, useRef, useState } from 'react'
import { refereeService } from '@/services/refereeService'
import {
  buildTournamentNameMap,
  buildTournamentStatusMap,
  countCheckedInParticipants,
  mapRaceFromApi,
} from '@/utils/refereeRaceUtils'
import { getApiErrorMessage } from '@/utils/apiError'

function mapAssignedRaces(data, { nameById = new Map(), statusById = new Map() } = {}) {
  return data.map((raw, index) => mapRaceFromApi({
    ...raw,
    tournamentName: raw.tournamentName || nameById.get(String(raw.tournamentId)),
    tournamentStatus: statusById.get(String(raw.tournamentId)) ?? '',
  }, index))
}

async function enrichRacesWithCheckInProgress(races) {
  if (!Array.isArray(races) || !races.length) return races

  const enriched = await Promise.all(
    races.map(async (race) => {
      if (!race?.id) return race

      try {
        const participants = await refereeService.getRaceParticipants(race.id)
        const participantCount = participants.length || Number(race.participantCount ?? 0)
        const checkedInCount = countCheckedInParticipants(participants)

        return {
          ...race,
          participantCount,
          totalHorses: participantCount,
          checkedInCount,
          checkedInDisplay: checkedInCount,
        }
      } catch {
        return race
      }
    }),
  )

  return enriched
}

export function useRefereeRaces() {
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const hasLoadedRef = useRef(false)

  const reload = useCallback(async ({ silent = false } = {}) => {
    const isInitialLoad = !hasLoadedRef.current
    if (isInitialLoad && !silent) {
      setLoading(true)
    } else if (!silent) {
      setRefreshing(true)
    }
    setError('')

    try {
      const data = await refereeService.getAssignedRaces()
      const tournamentIds = data.map((race) => race.tournamentId)
      const initialMapped = mapAssignedRaces(data)
      setRaces(initialMapped)
      hasLoadedRef.current = true

      if (isInitialLoad) {
        setLoading(false)
      }

      enrichRacesWithCheckInProgress(initialMapped).then(setRaces).catch(() => {})

      Promise.all([
        buildTournamentNameMap(tournamentIds),
        buildTournamentStatusMap(tournamentIds),
      ])
        .then(async ([nameById, statusById]) => {
          const mapped = mapAssignedRaces(data, { nameById, statusById })
          const withCheckIn = await enrichRacesWithCheckInProgress(mapped)
          setRaces(withCheckIn)
        })
        .catch(async () => {
          const withCheckIn = await enrichRacesWithCheckInProgress(mapAssignedRaces(data))
          setRaces(withCheckIn)
        })
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Không tải được danh sách cuộc đua')
      if (!hasLoadedRef.current) {
        setRaces([])
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { races, loading, refreshing, error, reload }
}
