import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { invalidateWalletCache } from '@/services/walletService'
import { idempotencyConfig } from '@/utils/idempotency'

function toNumber(value) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

function toNullableNumber(value) {
  if (value == null || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function mapBetOption(option) {
  return {
    participantId: option?.participantId,
    horseId: option?.horseId,
    horseName: option?.horseName || 'Chưa cập nhật',
    jockeyId: option?.jockeyId,
    jockeyUsername: option?.jockeyUsername || 'Chưa cập nhật',
    gateNumber: option?.gateNumber,
    status: option?.status,
    raw: option,
  }
}

export function mapBetMarket(market) {
  if (!market) return null

  return {
    id: market.id,
    raceId: market.raceId,
    raceName: market.raceName || 'Cuộc đua',
    tournamentId: market.tournamentId,
    tournamentName: market.tournamentName || 'Giải đấu',
    status: market.status,
    minStake: toNumber(market.minStake),
    maxStake: toNumber(market.maxStake),
    winningTaxPercent: toNullableNumber(market.winningTaxPercent),
    payoutMultiplier: toNumber(market.payoutMultiplier) || 2,
    note: market.note || '',
    openedAt: market.openedAt,
    closedAt: market.closedAt,
    settledAt: market.settledAt,
    options: Array.isArray(market.options) ? market.options.map(mapBetOption) : [],
    raw: market,
  }
}

export function mapBet(bet) {
  return {
    id: bet?.id,
    marketId: bet?.marketId,
    raceId: bet?.raceId,
    raceName: bet?.raceName || 'Cuộc đua',
    userId: bet?.userId,
    username: bet?.username ?? '',
    participantId: bet?.participantId,
    horseId: bet?.horseId,
    horseName: bet?.horseName || 'Chưa cập nhật',
    stakeAmount: toNumber(bet?.stakeAmount),
    potentialPayoutAmount: toNumber(bet?.potentialPayoutAmount),
    appliedWinningTaxPercent: toNullableNumber(bet?.appliedWinningTaxPercent),
    estimatedGrossProfitAmount: toNullableNumber(bet?.estimatedGrossProfitAmount),
    estimatedWinningTaxAmount: toNullableNumber(bet?.estimatedWinningTaxAmount),
    estimatedNetPayoutAmount: toNullableNumber(bet?.estimatedNetPayoutAmount),
    actualPayoutAmount: toNullableNumber(bet?.actualPayoutAmount),
    winningTaxAmount: toNumber(bet?.winningTaxAmount),
    grossProfitAmount: toNumber(bet?.grossProfitAmount),
    netProfitAmount: toNumber(bet?.netProfitAmount),
    status: bet?.status,
    placedAt: bet?.placedAt,
    lockedAt: bet?.lockedAt,
    settledAt: bet?.settledAt,
    raw: bet,
  }
}

export const bettingService = {
  async getPublicMarket(raceId) {
    const data = await axiosClient.get(ENDPOINTS.betting.publicMarket(raceId)).then(unwrapResponse)
    return mapBetMarket(data)
  },

  async getBettableRaces() {
    const data = await axiosClient.get(ENDPOINTS.betting.bettableRaces).then(unwrapResponse)
    return (Array.isArray(data) ? data : []).map(mapBetMarket).filter(Boolean)
  },

  async placeBet(raceId, payload, idempotencyKey) {
    const data = await axiosClient.post(ENDPOINTS.betting.placeBet(raceId), payload, idempotencyConfig(idempotencyKey)).then(unwrapResponse)
    invalidateWalletCache('user')
    return mapBet(data)
  },

  async getMyBets() {
    const data = await axiosClient.get(ENDPOINTS.betting.myBets).then(unwrapResponse)
    return (Array.isArray(data) ? data : []).map(mapBet)
  },

  async getMyBet(id) {
    const data = await axiosClient.get(ENDPOINTS.betting.myBet(id)).then(unwrapResponse)
    return mapBet(data)
  },
}
