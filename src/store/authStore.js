import { create } from 'zustand'
import { authApi } from '@/api/authApi'
import { getStoredToken, setStoredToken, removeStoredToken } from '@/utils/tokenStorage'
import { isTokenExpired, getRoleFromToken } from '@/utils/jwtDecode'
import { applyAuthToState } from '@/utils/mapAuthResponse'
import { normalizeRole } from '@/utils/roleRedirect'

function persistLogin(auth) {
  const { token, user, role, isAuthenticated } = applyAuthToState(auth)
  if (!token) throw new Error('Không nhận được token từ server')
  setStoredToken(token)
  return { token, user, role, isAuthenticated }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (token, user) => {
    setStoredToken(token)
    const role = normalizeRole(user?.role) || normalizeRole(getRoleFromToken(token))
    set({
      token,
      user,
      role,
      isAuthenticated: !!token && !!user,
    })
  },

  clearSession: () => {
    removeStoredToken()
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  fetchProfile: async () => {
    const user = await authApi.getMe()
    const role = normalizeRole(user?.role)
    set({ user, role, isAuthenticated: true })
    return user
  },

  login: async ({ email, password }) => {
    const auth = await authApi.login({ email, password })
    const session = persistLogin(auth)
    set({ ...session, isLoading: false })

    if (!session.user?.email) {
      const user = await get().fetchProfile()
      return { auth, user }
    }
    return { auth, user: session.user }
  },

  loginWithGoogle: async (idToken) => {
    const auth = await authApi.loginGoogle(idToken)
    const session = persistLogin(auth)
    set({ ...session, isLoading: false })
    return { auth, user: session.user }
  },

  loginWithFacebook: async (accessToken) => {
    const auth = await authApi.loginFacebook(accessToken)
    const session = persistLogin(auth)
    set({ ...session, isLoading: false })
    return { auth, user: session.user }
  },

  register: (payload) => authApi.register(payload),

  logout: async () => {
    try {
      if (getStoredToken()) await authApi.logout()
    } finally {
      get().clearSession()
    }
  },

  initAuth: async () => {
    const stored = getStoredToken()

    if (!stored) {
      set({ isLoading: false })
      return
    }

    if (isTokenExpired(stored)) {
      get().clearSession()
      return
    }

    set({
      token: stored,
      role: normalizeRole(getRoleFromToken(stored)),
      isLoading: true,
    })

    try {
      await get().fetchProfile()
    } catch {
      get().clearSession()
    } finally {
      set({ isLoading: false })
    }
  },
}))
