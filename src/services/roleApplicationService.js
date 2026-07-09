import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

function appendFormFields(formData, fields) {
  Object.entries(fields).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    formData.append(key, value)
  })
}

const multipartHeaders = { 'Content-Type': 'multipart/form-data' }

export const roleApplicationService = {
  getMyApplication: (options = {}) => {
    const params = {}
    if (options.role) params.role = options.role
    return axiosClient.get(ENDPOINTS.roleApplications.me, { params }).then(unwrapResponse)
  },

  submitSpectator: (payload) =>
    axiosClient.post(ENDPOINTS.roleApplications.spectator, payload).then(unwrapResponse),

  /** BE upload Cloudinary — gửi file multipart, không cần key FE */
  submitOwner: (fields, verificationDocument) => {
    const formData = new FormData()
    appendFormFields(formData, fields)
    if (verificationDocument) formData.append('verificationDocument', verificationDocument)
    return axiosClient
      .post(ENDPOINTS.roleApplications.owner, formData, { headers: multipartHeaders })
      .then(unwrapResponse)
  },

  submitJockey: (fields, files = {}) => {
    const formData = new FormData()
    appendFormFields(formData, fields)
    if (files.avatar) formData.append('avatar', files.avatar)
    if (files.achievements) formData.append('achievements', files.achievements)
    if (files.licenseDocument) formData.append('licenseDocument', files.licenseDocument)
    return axiosClient
      .post(ENDPOINTS.roleApplications.jockey, formData, { headers: multipartHeaders })
      .then(unwrapResponse)
  },

  submitReferee: (fields, certificationDocument) => {
    const formData = new FormData()
    appendFormFields(formData, fields)
    if (certificationDocument) formData.append('certificationDocument', certificationDocument)
    return axiosClient
      .post(ENDPOINTS.roleApplications.referee, formData, { headers: multipartHeaders })
      .then(unwrapResponse)
  },

  verifyCccd: (requestedRole, cccdFront, cccdBack) => {
    const formData = new FormData()
    formData.append('requestedRole', requestedRole)
    formData.append('cccdFront', cccdFront)
    formData.append('cccdBack', cccdBack)
    return axiosClient
      .post(ENDPOINTS.roleApplications.kycOcr, formData, { headers: multipartHeaders })
      .then(unwrapResponse)
  },

  verifyFace: (verificationId, selfie) => {
    const formData = new FormData()
    formData.append('selfie', selfie)
    return axiosClient
      .post(ENDPOINTS.roleApplications.kycFaceMatch(verificationId), formData, {
        headers: multipartHeaders,
      })
      .then(unwrapResponse)
  },
}
