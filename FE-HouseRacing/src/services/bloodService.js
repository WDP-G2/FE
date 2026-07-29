import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

/**
 * Ví dụ service layer cho domain phụ.
 * Cập nhật ENDPOINTS.blood trong api/endpoints.js khi BE có API thật.
 */
export const bloodService = {
  getRecords: (params) =>
    axiosClient.get(ENDPOINTS.blood.list, { params }).then(unwrapResponse),

  getRecordById: (id) => axiosClient.get(ENDPOINTS.blood.byId(id)).then(unwrapResponse),
}
