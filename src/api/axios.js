import axios from 'axios'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/config/env'
import { clearAccessToken, getAccessToken } from '@/api/authToken'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let redirecting = false

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url ?? ''

    if (
      status === 401 &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/register') &&
      !url.includes('/auth/forgot-password') &&
      !url.includes('/auth/reset-password')
    ) {
      clearAccessToken()
      import('@/store/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().clearSession()
      })

      if (!redirecting && !window.location.pathname.startsWith('/login')) {
        redirecting = true
        toast.error('Phiên đăng nhập đã hết hạn.')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  },
)

export default api
