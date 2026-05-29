import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

export const jockeyService = {
  listForOwner: () =>
    axiosClient.get(ENDPOINTS.users.jockeyDirectory).then(unwrapResponse),
}
