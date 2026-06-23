import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { mapTournament, tournamentService } from '@/services/tournamentService'
import { fetchRaceResults } from '@/services/raceResultService'
import { bettingService } from '@/services/bettingService'
import { walletService } from '@/services/walletService'
import { notificationService, mapNotification } from '@/services/notificationService'

function toNumber(value) {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

function mapDashboardItem(item) {
  return {
    type: item?.type,
    id: item?.id,
    title: item?.title || 'Mục theo dõi',
    status: item?.status,
    at: item?.at,
    metadata: item?.metadata || {},
  }
}

function mapQuickLink(link) {
  return {
    label: link?.label || '',
    route: link?.route || '',
    enabled: link?.enabled !== false,
  }
}

export function mapSpectatorDashboard(data) {
  const summary = data?.businessSummary || {}
  return {
    role: data?.role,
    account: data?.account || {},
    wallet: data?.wallet || null,
    businessSummary: {
      openTournamentCount: toNumber(summary.openTournamentCount),
      openBetMarketCount: toNumber(summary.openBetMarketCount),
      totalBetStake: toNumber(summary.totalBetStake),
      totalBetPayout: toNumber(summary.totalBetPayout),
      betsByStatus: summary.betsByStatus || {},
      predictionEnabled: summary.predictionEnabled === true,
      marketplaceEnabled: summary.marketplaceEnabled === true,
    },
    moneyIn: data?.moneyIn || {},
    moneyOut: data?.moneyOut || {},
    hold: data?.hold || {},
    withdrawals: data?.withdrawals || null,
    alerts: Array.isArray(data?.alerts) ? data.alerts.map(mapDashboardItem) : [],
    upcoming: Array.isArray(data?.upcoming) ? data.upcoming.map(mapDashboardItem) : [],
    quickLinks: Array.isArray(data?.quickLinks) ? data.quickLinks.map(mapQuickLink) : [],
    featureFlags: data?.featureFlags || {},
    recentTransactions: Array.isArray(data?.recentTransactions) ? data.recentTransactions : [],
    recentNotifications: Array.isArray(data?.recentNotifications)
      ? data.recentNotifications.map(mapNotification)
      : [],
    raw: data,
  }
}

export const spectatorService = {
  async getDashboard() {
    const data = await axiosClient.get(ENDPOINTS.spectator.dashboard).then(unwrapResponse)
    return mapSpectatorDashboard(data)
  },

  getTournaments: tournamentService.getPublicTournaments,
  getTournament: tournamentService.getPublicTournament,

  async getTournamentRaces(id) {
    const data = await axiosClient.get(ENDPOINTS.tournaments.publicRaces(id)).then(unwrapResponse)
    return (Array.isArray(data) ? data : []).map((race, index) => mapTournament({ id, races: [race] })?.races?.[0] || {
      id: String(race?.id ?? index + 1),
      raw: race,
    })
  },

  async getTournamentLeaderboard(id) {
    return axiosClient.get(ENDPOINTS.tournaments.publicLeaderboard(id)).then(unwrapResponse)
  },

  getRaceResults: fetchRaceResults,

  getBettableRaces: bettingService.getBettableRaces,
  getPublicMarket: bettingService.getPublicMarket,
  placeBet: bettingService.placeBet,
  getMyBets: bettingService.getMyBets,
  getMyBet: bettingService.getMyBet,

  getWallet: walletService.getMyWallet,
  getWalletTransactions: walletService.getMyTransactions,
  getNotifications: notificationService.getMyNotifications,
  getUnreadNotificationCount: notificationService.getUnreadCount,
  markNotificationRead: notificationService.markRead,
  markAllNotificationsRead: notificationService.markAllRead,
}
