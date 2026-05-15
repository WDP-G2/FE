import { apiClient } from '@/api'

const BASE = '/example'

export const exampleService = {
  getList(params) {
    return apiClient.get(BASE, { params })
  },

  getById(id) {
    return apiClient.get(`${BASE}/${id}`)
  },

  create(payload) {
    return apiClient.post(BASE, payload)
  },
}
