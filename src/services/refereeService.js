import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { mapUser } from '@/services/adminUserService'

function mapReferee(user, profile) {
  const experienceYears = Number(profile?.experienceYears ?? 0)

  return {
    id: String(user.rawId ?? user.id),
    name: user.name,
    license: profile?.licenseNumber?.trim() || 'Chưa có giấy phép',
    experience: Number.isFinite(experienceYears) ? experienceYears : 0,
    specialty: profile?.specialty?.trim() || user.location?.trim() || 'Chưa cập nhật',
    email: user.email,
    phone: user.phone,
    active: user.active,
  }
}

export const refereeService = {
  async getAvailableReferees() {
    try {
      const [usersResponse, applicationsResponse] = await Promise.all([
        axiosClient.get(ENDPOINTS.admin.activeUsers).then(unwrapResponse),
        axiosClient
          .get(ENDPOINTS.admin.roleApplications, {
            params: { role: 'REFEREE', status: 'APPROVED' },
          })
          .then(unwrapResponse)
          .catch(() => []),
      ])

      const profileByUserId = new Map()
      for (const application of Array.isArray(applicationsResponse) ? applicationsResponse : []) {
        if (application?.userId != null) {
          profileByUserId.set(String(application.userId), application)
        }
      }

      return (Array.isArray(usersResponse) ? usersResponse : [])
        .map(mapUser)
        .filter((user) => user.roleCode === 'REFEREE' && user.active)
        .map((user) => mapReferee(user, profileByUserId.get(String(user.rawId ?? user.id))))
        .sort((first, second) => first.name.localeCompare(second.name, 'vi'))
    } catch {
      return []
    }
  },

  async assignRaceReferee(raceId, refereeId) {
    return axiosClient
      .put(ENDPOINTS.races.assignReferee(raceId), {
        refereeId: Number(refereeId),
      })
      .then(unwrapResponse)
  },
}
