import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { deriveUsername } from '@/utils/validation'

export const authService = {
  register: (payload) =>
    axiosClient
      .post(ENDPOINTS.auth.register, {
        username: deriveUsername(payload.email),
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
      })
      .then(unwrapResponse),

  login: (payload) =>
    axiosClient
      .post(ENDPOINTS.auth.login, {
        email: payload.email?.trim?.() ?? payload.email,
        password: payload.password,
      })
      .then(unwrapResponse),

  loginGoogle: (idToken) =>
    axiosClient.post(ENDPOINTS.auth.google, { idToken }).then(unwrapResponse),

  loginFacebook: (accessToken) =>
    axiosClient.post(ENDPOINTS.auth.facebook, { accessToken }).then(unwrapResponse),

  logout: () => axiosClient.post(ENDPOINTS.auth.logout).then(unwrapResponse),

  getMe: () => axiosClient.get(ENDPOINTS.auth.me).then(unwrapResponse),

  forgotPassword: (email) =>
    axiosClient.post(ENDPOINTS.auth.forgotPassword, { email }).then(unwrapResponse),

  resetPassword: (payload) =>
    axiosClient.post(ENDPOINTS.auth.resetPassword, payload).then(unwrapResponse),
}
