import { toast } from 'sonner'
import { getStoredToken, removeStoredToken } from '@/utils/tokenStorage'
import { isTokenExpired } from '@/utils/jwtDecode'
import { ENDPOINTS } from '@/api/endpoints'

let redirecting = false

const AUTH_PATHS = [
  ENDPOINTS.auth.login,
  ENDPOINTS.auth.register,
  ENDPOINTS.auth.forgotPassword,
  ENDPOINTS.auth.resetPassword,
  ENDPOINTS.auth.google,
  ENDPOINTS.auth.facebook,
]

function isAuthEndpoint(url = '') {
  return AUTH_PATHS.some((path) => url.includes(path))
}

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

export function setupInterceptors(client) {
  client.interceptors.request.use((config) => {
    const token = getStoredToken()
    if (token && !isTokenExpired(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error?.response?.status
      const url = error?.config?.url ?? ''

      if (status === 401 && !isAuthEndpoint(url)) {
        handleSessionExpired()
      }

      return Promise.reject(error)
    },
  )
}
