import { useCallback, useEffect, useState } from 'react'
import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { formatMillisAsRaceTime } from '@/utils/refereeRaceUtils'

export function mapRaceResultFromApi(raw) {
  const rank = raw?.rank == null ? null : Number(raw.rank)
  const prizeAmount = Number(raw?.prizeAmount ?? 0)
  return {
    id: raw?.id,
    participantId: raw?.participantId,
    horse: raw?.horseName ?? '—',
    owner: raw?.ownerUsername ?? '—',
    jockey: raw?.jockeyUsername ?? '—',
    position: rank,
    rank,
    time:
      raw?.finishTimeMillis != null && Number(raw.finishTimeMillis) > 0
        ? formatMillisAsRaceTime(raw.finishTimeMillis)
        : '—',
    status: raw?.status,
    note: raw?.note ?? '',
    prizeAmount,
    source: raw?.source || 'MANUAL',
    simulationRunId: raw?.simulationRunId || null,
  }
}

/** Chỉ ngựa hoàn thành có hạng — loại trừ DISQUALIFIED, ABSENT, DNF */
export function buildRankedResultRows(results = []) {
  return (Array.isArray(results) ? results : [])
    .filter(
      (item) =>
        item?.status === 'FINISHED'
        && item?.rank != null
        && Number(item.rank) > 0,
    )
    .sort((a, b) => Number(a.rank) - Number(b.rank))
    .map(mapRaceResultFromApi)
}

export function buildDisqualifiedResultRows(results = []) {
  return (Array.isArray(results) ? results : [])
    .filter((item) => item?.status === 'DISQUALIFIED')
    .map(mapRaceResultFromApi)
}

export async function fetchRaceResults(raceId) {
  if (!raceId) return []
  const data = await axiosClient.get(ENDPOINTS.races.results(raceId)).then(unwrapResponse)
  return Array.isArray(data) ? data : []
}

export function useRaceResults(raceId) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(Boolean(raceId))
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    if (!raceId) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await fetchRaceResults(raceId)
      setResults(data)
    } catch (err) {
      setError(err?.message || 'Không tải được kết quả cuộc đua')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [raceId])

  useEffect(() => {
    reload()
  }, [reload])

  return {
    results,
    rankedRows: buildRankedResultRows(results),
    disqualifiedRows: buildDisqualifiedResultRows(results),
    loading,
    error,
    reload,
  }
}
