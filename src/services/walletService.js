import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

export const walletService = {
  getMyWallet: () => axiosClient.get(ENDPOINTS.wallet.me).then(unwrapResponse),

  getMyTransactions: () => axiosClient.get(ENDPOINTS.wallet.transactions).then(unwrapResponse),

  getAdminWallet: () => axiosClient.get(ENDPOINTS.wallet.admin).then(unwrapResponse),

  getAdminTransactions: () =>
    axiosClient.get(ENDPOINTS.wallet.adminTransactions).then(unwrapResponse),

  createDepositOrder: (payload) =>
    axiosClient.post(ENDPOINTS.wallet.depositOrders, payload).then(unwrapResponse),

  createWithdrawal: (payload) =>
    axiosClient.post(ENDPOINTS.wallet.withdrawals, payload).then(unwrapResponse),
}
