import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { idempotencyConfig, stableIdempotencyKey } from '@/utils/idempotency'

function number(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export function mapRaceSimulation(raw) {
  if (!raw?.runId) return null
  return {
    raceId: String(raw.raceId || ''),
    runId: String(raw.runId),
    status: raw.status || 'GENERATED',
    algorithmVersion: raw.algorithmVersion || 'v1',
    seed: raw.seed || '',
    generatedAt: raw.generatedAt,
    playbackEndsAt: raw.playbackEndsAt,
    playbackDurationMs: number(raw.playbackDurationMs, 28000),
    serverTime: raw.serverTime,
    confirmedAt: raw.confirmedAt || null,
    participants: (Array.isArray(raw.participants) ? raw.participants : []).map((item) => ({
      participantId: String(item.participantId || ''),
      horseId: String(item.horseId || ''),
      horseName: item.horseName || 'Ngựa đua',
      jockeyName: item.jockeyName || 'Chưa có jockey',
      gateNumber: number(item.gateNumber),
      horseStarts: number(item.horseStarts),
      horseWins: number(item.horseWins),
      horseWinRate: number(item.horseWinRate, 0.5),
      jockeyStarts: number(item.jockeyStarts),
      jockeyWins: number(item.jockeyWins),
      jockeyWinRate: number(item.jockeyWinRate, 0.5),
      initialWinProbability: number(item.initialWinProbability),
      rank: number(item.rank),
      finishTimeMillis: number(item.finishTimeMillis),
      checkpoints: (Array.isArray(item.checkpoints) ? item.checkpoints : [])
        .map((point) => ({ at: number(point.at), progress: number(point.progress) }))
        .sort((a, b) => a.at - b.at),
    })),
  }
}

export const raceSimulationService = {
  async get(raceId) {
    const data = await axiosClient.get(ENDPOINTS.races.simulation(raceId)).then(unwrapResponse)
    return mapRaceSimulation(data)
  },
  async generate(raceId) {
    const data = await axiosClient.post(ENDPOINTS.referee.generateSimulation(raceId), {}).then(unwrapResponse)
    return mapRaceSimulation(data)
  },
  async confirm(raceId, runId) {
    return axiosClient
      .post(ENDPOINTS.referee.confirmSimulation(raceId), { runId }, idempotencyConfig(stableIdempotencyKey(`race-simulation-confirm:${raceId}:${runId}`)))
      .then(unwrapResponse)
  },
}
