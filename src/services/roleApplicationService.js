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

  submitOwner: (fields, verificationDocument) => {
    const formData = new FormData()
    appendFormFields(formData, fields)
    if (verificationDocument) formData.append('verificationDocument', verificationDocument)
    return axiosClient
      .post(ENDPOINTS.roleApplications.owner, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)
  },

  submitJockey: (fields, files = {}) => {
    const formData = new FormData()
    appendFormFields(formData, fields)
    if (files.avatar) formData.append('avatar', files.avatar)
    if (files.achievements) formData.append('achievements', files.achievements)
    if (files.licenseDocument) formData.append('licenseDocument', files.licenseDocument)
    return axiosClient
      .post(ENDPOINTS.roleApplications.jockey, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)
  },

  submitReferee: (fields, certificationDocument) => {
    const formData = new FormData()
    appendFormFields(formData, fields)
    if (certificationDocument) formData.append('certificationDocument', certificationDocument)
    return axiosClient
      .post(ENDPOINTS.roleApplications.referee, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)
  },
}
