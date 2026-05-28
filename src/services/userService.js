import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

export const userService = {
  getUsers: () => axiosClient.get(ENDPOINTS.admin.users).then(unwrapResponse),

  getUserById: (id) => axiosClient.get(ENDPOINTS.admin.userById(id)).then(unwrapResponse),

  getProfile: () => axiosClient.get(ENDPOINTS.users.profile).then(unwrapResponse),

  getPublicUserById: (id) => axiosClient.get(ENDPOINTS.users.byId(id)).then(unwrapResponse),
}
