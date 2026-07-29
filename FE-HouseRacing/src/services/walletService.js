import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { idempotencyConfig } from '@/utils/idempotency'

const WALLET_CACHE_TTL_MS = 60_000
const walletCache = {
  user: { data: null, at: 0 },
  admin: { data: null, at: 0 },
}

function readCache(key) {
  const entry = walletCache[key]
  if (!entry?.data || Date.now() - entry.at > WALLET_CACHE_TTL_MS) return null
  return entry.data
}

function writeCache(key, data) {
  walletCache[key] = { data, at: Date.now() }
}

export function invalidateWalletCache(mode = 'all') {
  if (mode === 'all' || mode === 'user') walletCache.user = { data: null, at: 0 }
  if (mode === 'all' || mode === 'admin') walletCache.admin = { data: null, at: 0 }
}

async function fetchWallet(endpoint, cacheKey, { force = false } = {}) {
  if (!force) {
    const cached = readCache(cacheKey)
    if (cached) return cached
  }

  const data = await axiosClient.get(endpoint).then(unwrapResponse)
  writeCache(cacheKey, data)
  return data
}

export function peekWalletBalance(walletMode = 'user') {
  const key = walletMode === 'admin' ? 'admin' : 'user'
  const cached = readCache(key)
  if (!cached) return null
  return cached?.availableBalance ?? cached?.totalBalance ?? 0
}

export const walletService = {
  getMyWallet: (opts) => fetchWallet(ENDPOINTS.wallet.me, 'user', opts),

  getMyTransactions: () => axiosClient.get(ENDPOINTS.wallet.transactions).then(unwrapResponse),

  getMyDepositOrders: () => axiosClient.get(ENDPOINTS.wallet.depositOrders).then(unwrapResponse),

  createDepositOrder: async (payload) => {
    const data = await axiosClient.post(ENDPOINTS.wallet.depositOrders, payload).then(unwrapResponse)
    invalidateWalletCache('user')
    return data
  },

  getMyDepositOrder: (id) =>
    axiosClient.get(ENDPOINTS.wallet.depositOrderById(id)).then(unwrapResponse),

  payMyDepositOrderWithCard: async (id, payload) => {
    const data = await axiosClient
      .post(ENDPOINTS.wallet.payDepositOrderWithCard(id), payload)
      .then(unwrapResponse)
    invalidateWalletCache('user')
    return data
  },

  getMyWithdrawals: () => axiosClient.get(ENDPOINTS.wallet.withdrawals).then(unwrapResponse),

  createWithdrawal: async (payload, idempotencyKey) => {
    const data = await axiosClient.post(ENDPOINTS.wallet.withdrawals, payload, idempotencyConfig(idempotencyKey)).then(unwrapResponse)
    invalidateWalletCache('user')
    return data
  },

  getAdminWallet: (opts) => fetchWallet(ENDPOINTS.wallet.admin, 'admin', opts),

  getAdminTransactions: () =>
    axiosClient.get(ENDPOINTS.wallet.adminTransactions).then(unwrapResponse),

  getAdminDepositOrders: () =>
    axiosClient.get(ENDPOINTS.wallet.adminDepositOrders).then(unwrapResponse),

  createAdminDepositOrder: async (payload) => {
    const data = await axiosClient
      .post(ENDPOINTS.wallet.adminDepositOrders, payload)
      .then(unwrapResponse)
    invalidateWalletCache('admin')
    return data
  },

  getAdminDepositOrder: (id) =>
    axiosClient.get(ENDPOINTS.wallet.adminDepositOrderById(id)).then(unwrapResponse),

  payAdminDepositOrderWithCard: async (id, payload) => {
    const data = await axiosClient
      .post(ENDPOINTS.wallet.adminPayDepositOrderWithCard(id), payload)
      .then(unwrapResponse)
    invalidateWalletCache('admin')
    return data
  },

  getAdminWithdrawals: () =>
    axiosClient.get(ENDPOINTS.wallet.adminWithdrawals).then(unwrapResponse),

  createAdminWithdrawal: async (payload, idempotencyKey) => {
    const data = await axiosClient
      .post(ENDPOINTS.wallet.adminWithdrawals, payload, idempotencyConfig(idempotencyKey))
      .then(unwrapResponse)
    invalidateWalletCache('admin')
    return data
  },

  approveWithdrawal: (id, idempotencyKey) =>
    axiosClient.put(ENDPOINTS.wallet.adminApproveWithdrawal(id), null, idempotencyConfig(idempotencyKey)).then(unwrapResponse),

  rejectWithdrawal: (id, note, idempotencyKey) =>
    axiosClient.put(ENDPOINTS.wallet.adminRejectWithdrawal(id), { note }, idempotencyConfig(idempotencyKey)).then(unwrapResponse),

  markWithdrawalPaid: (id, idempotencyKey) =>
    axiosClient.put(ENDPOINTS.wallet.adminPaidWithdrawal(id), null, idempotencyConfig(idempotencyKey)).then(unwrapResponse),

  getReconciliation: () =>
    axiosClient.get(ENDPOINTS.wallet.adminReconciliation).then(unwrapResponse),
}
