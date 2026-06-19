import { useCallback, useEffect, useState } from 'react'
import { refereeService } from '@/services/refereeService'
import { buildTournamentNameMap, mapRaceFromApi } from '@/utils/refereeRaceUtils'
import { getApiErrorMessage } from '@/utils/apiError'

export function useRefereeRaces() {
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await refereeService.getAssignedRaces()
      const nameById = await buildTournamentNameMap(data.map((race) => race.tournamentId))
      setRaces(
        data.map((raw, index) => mapRaceFromApi({
          ...raw,
          tournamentName: raw.tournamentName || nameById.get(String(raw.tournamentId)),
        }, index)),
      )
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Không tải được danh sách cuộc đua')
      setRaces([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  return { races, loading, error, reload }
}
