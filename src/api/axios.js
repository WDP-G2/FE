import axios from 'axios'
import { toast } from 'sonner'
import { API_BASE_URL } from '@/config/env'
import { getStoredToken, removeStoredToken } from '@/utils/tokenStorage'
import { isTokenExpired } from '@/utils/jwtDecode'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let redirecting = false

function handleSessionExpired() {
  removeStoredToken()
  import('@/store/authStore').then(({ useAuthStore }) => {
    useAuthStore.getState().clearSession()
  })

  if (!redirecting && !window.location.pathname.startsWith('/login')) {
    redirecting = true
    toast.error('Phiên đăng nhập đã hết hạn.')
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    const url = error?.config?.url ?? ''

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/forgot-password') ||
      url.includes('/auth/reset-password') ||
      url.includes('/auth/google') ||
      url.includes('/auth/facebook')

    if (status === 401 && !isAuthEndpoint) {
      handleSessionExpired()
    }

    return Promise.reject(error)
  },
)

export default api
