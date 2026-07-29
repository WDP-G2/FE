import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

function normalizeFinanceSettings(settings = {}) {
  return {
    bettingEnabled: Boolean(settings.bettingEnabled),
    betWinningTaxPercent:
      settings.betWinningTaxPercent == null ? '' : String(settings.betWinningTaxPercent),
    createdAt: settings.createdAt ?? null,
    updatedAt: settings.updatedAt ?? null,
  }
}

function normalizeShare(share = {}) {
  return {
    rank: Number(share.rank ?? 0),
    jockeyPercent: share.jockeyPercent == null ? '' : String(share.jockeyPercent),
    ownerPercent: share.ownerPercent == null ? '' : String(share.ownerPercent),
  }
}

function normalizeSharesResponse(response) {
  return {
    data: {
      shares: Array.isArray(response?.data?.shares) ? response.data.shares.map(normalizeShare) : [],
    },
  }
}

export const financeSettingsService = {
  async getAdminSettings() {
    const settings = await axiosClient.get(ENDPOINTS.financeSettings.admin).then(unwrapResponse)
    return {
      data: normalizeFinanceSettings(settings),
    }
  },

  async updateAdminSettings(payload) {
    const settings = await axiosClient.put(ENDPOINTS.financeSettings.admin, payload).then(unwrapResponse)
    return {
      data: normalizeFinanceSettings(settings),
    }
  },

  async getRacePrizeShareSettings() {
    const response = await axiosClient.get(ENDPOINTS.financeSettings.racePrizeShares).then(unwrapResponse)
    return normalizeSharesResponse(response)
  },

  async updateRacePrizeShareSettings(payload) {
    const response = await axiosClient
      .put(ENDPOINTS.financeSettings.racePrizeShares, payload)
      .then(unwrapResponse)
    return normalizeSharesResponse(response)
  },
}