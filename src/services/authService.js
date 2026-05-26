import { apiClient } from '@/api/client'

function unwrap(response) {
  if (response && typeof response === 'object' && 'success' in response) {
    if (!response.success) {
      throw new Error(response.message || 'Request failed')
    }
    return response.data
  }
  return response
}

function deriveUsername(email) {
  let name = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
  if (name.length < 3) {
    name = `user_${name}${Date.now().toString().slice(-4)}`
  }
  return name.slice(0, 50)
}

export const authService = {
  register: async ({ fullName, email, password }) => {
    const res = await apiClient.post('auth/register', {
      username: deriveUsername(email),
      fullName,
      email,
      password,
    })
    return unwrap(res)
  },

  forgotPassword: async (email) => {
    const res = await apiClient.post('auth/forgot-password', { email })
    return unwrap(res)
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    const res = await apiClient.post('auth/reset-password', { email, otp, newPassword })
    return unwrap(res)
  },
}
