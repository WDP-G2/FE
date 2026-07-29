import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

export const userService = {
  getUsers: () => axiosClient.get(ENDPOINTS.admin.users).then(unwrapResponse),

  getUserById: (id) => axiosClient.get(ENDPOINTS.admin.userById(id)).then(unwrapResponse),

  getProfile: () => axiosClient.get(ENDPOINTS.users.profile).then(unwrapResponse),

  updateProfile: (payload, avatarFile = null) => {
    if (avatarFile) {
      const formData = new FormData()
      Object.entries(payload ?? {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value)
      })
      formData.append('avatar', avatarFile)

      return axiosClient
        .put(ENDPOINTS.users.profile, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(unwrapResponse)
    }

    return axiosClient.put(ENDPOINTS.users.profile, payload).then(unwrapResponse)
  },

  getPublicUserById: (id) => axiosClient.get(ENDPOINTS.users.byId(id)).then(unwrapResponse),

  getJockeyAccounts: () => axiosClient.get(ENDPOINTS.users.jockeys).then(unwrapResponse),
}
