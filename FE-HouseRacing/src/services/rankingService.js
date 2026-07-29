import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

export const rankingService = {
  async getRankings(limit = 20) {
    const data = await axiosClient
      .get(ENDPOINTS.rankings.list, { params: { limit } })
      .then(unwrapResponse)

    return {
      generatedAt: data?.generatedAt ?? null,
      metric: data?.metric ?? 'WIN_COUNT',
      horses: Array.isArray(data?.horses) ? data.horses : [],
      jockeys: Array.isArray(data?.jockeys) ? data.jockeys : [],
    }
  },
}
