import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

export const dashboardService = {
  getAdminSummary() {
    return axiosClient.get(ENDPOINTS.dashboard.summary).then(unwrapResponse)
  },

  getAdminRevenue(months = 6) {
    return axiosClient
      .get(ENDPOINTS.dashboard.revenue, { params: { months } })
      .then(unwrapResponse)
  },
}
