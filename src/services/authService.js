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

export const authService = {
  forgotPassword: async (email) => {
    const res = await apiClient.post('auth/forgot-password', { email })
    return unwrap(res)
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    const res = await apiClient.post('auth/reset-password', { email, otp, newPassword })
    return unwrap(res)
  },
}
