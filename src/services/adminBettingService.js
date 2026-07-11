import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { mapBet, mapBetMarket } from '@/services/bettingService'

export const adminBettingService = {
  async getMarkets() {
    const data = await axiosClient.get(ENDPOINTS.betting.adminMarkets).then(unwrapResponse)
    return (Array.isArray(data) ? data : []).map(mapBetMarket).filter(Boolean)
  },

  async createMarket(raceId, payload) {
    const data = await axiosClient
      .post(ENDPOINTS.betting.adminCreateMarket(raceId), payload)
      .then(unwrapResponse)
    return mapBetMarket(data)
  },

  async openMarket(id) {
    const data = await axiosClient.put(ENDPOINTS.betting.adminOpenMarket(id)).then(unwrapResponse)
    return mapBetMarket(data)
  },

  async closeMarket(id) {
    const data = await axiosClient.put(ENDPOINTS.betting.adminCloseMarket(id)).then(unwrapResponse)
    return mapBetMarket(data)
  },

  async settleMarket(id) {
    const data = await axiosClient.put(ENDPOINTS.betting.adminSettleMarket(id)).then(unwrapResponse)
    return mapBetMarket(data)
  },

  async getMarketBets(id) {
    const data = await axiosClient.get(ENDPOINTS.betting.adminMarketBets(id)).then(unwrapResponse)
    return (Array.isArray(data) ? data : []).map(mapBet)
  },
}
