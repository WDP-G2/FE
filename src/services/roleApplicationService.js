import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

function appendFormFields(formData, fields) {
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    formData.append(key, value)
  })
}

export const roleApplicationService = {
  getMyApplication: () => axiosClient.get(ENDPOINTS.roleApplications.me).then(unwrapResponse),

  submitSpectator: (payload) =>
    axiosClient.post(ENDPOINTS.roleApplications.spectator, payload).then(unwrapResponse),

  submitOwner: (fields) => {
    const formData = new FormData()
    appendFormFields(formData, fields)
    return axiosClient
      .post(ENDPOINTS.roleApplications.owner, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)
  },

  submitJockey: (fields) => {
    const formData = new FormData()
    appendFormFields(formData, fields)
    return axiosClient
      .post(ENDPOINTS.roleApplications.jockey, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)
  },

  submitReferee: (fields) => {
    const formData = new FormData()
    appendFormFields(formData, fields)
    return axiosClient
      .post(ENDPOINTS.roleApplications.referee, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)
  },
}
