import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.role)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)

  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const initAuth = useAuthStore((s) => s.initAuth)

  return {
    user,
    token,
    role,
    isAuthenticated,
    isLoading,
    setUser,
    logout,
    login,
    register,
    initAuth,
  }
}
