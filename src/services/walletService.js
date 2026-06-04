import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

export const walletService = {
  getMyWallet: () => axiosClient.get(ENDPOINTS.wallet.me).then(unwrapResponse),
}
