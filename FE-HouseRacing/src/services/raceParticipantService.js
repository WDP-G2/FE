import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { mapParticipantFromApi } from '@/utils/refereeRaceUtils'

export const raceParticipantService = {
  async getAdminRaceParticipants(raceId) {
    const data = await axiosClient
      .get(ENDPOINTS.races.adminParticipants(raceId))
      .then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapParticipantFromApi) : []
  },
}
