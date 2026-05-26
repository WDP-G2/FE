import api from '@/api/axios'
import { deriveUsername } from '@/utils/validation'

function unwrap(res) {
  const body = res.data
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) throw new Error(body.message || 'Request failed')
    return body.data
  }
  return body
}

export const authApi = {
  register: (payload) =>
    api
      .post('/auth/register', {
        username: deriveUsername(payload.email),
        fullName: payload.fullName,
        email: payload.email,
        password: payload.password,
      })
      .then(unwrap),

  login: (payload) => api.post('/auth/login', payload).then(unwrap),

  loginGoogle: (idToken) => api.post('/auth/google', { idToken }).then(unwrap),

  loginFacebook: (accessToken) => api.post('/auth/facebook', { accessToken }).then(unwrap),

  logout: () => api.post('/auth/logout').then(unwrap),

  getMe: () => api.get('/auth/me').then(unwrap),

  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(unwrap),

  resetPassword: (payload) => api.post('/auth/reset-password', payload).then(unwrap),
}
