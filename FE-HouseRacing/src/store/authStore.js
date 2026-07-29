import { create } from 'zustand'
import { authService } from '@/services/authService'
import { invalidateTournamentListCache } from '@/services/tournamentService'
import { useApiCacheStore } from '@/store/apiCacheStore'
import { invalidateWalletCache } from '@/services/walletService'
import { getStoredToken, setStoredToken, removeStoredToken } from '@/utils/tokenStorage'
import { isTokenExpired, getRoleFromToken } from '@/utils/jwtDecode'
import { applyAuthToState, mapAuthResponseToUser } from '@/utils/mapAuthResponse'
import { normalizeRole } from '@/utils/roleRedirect'

function persistLogin(auth) {
  const { token, user, role, isAuthenticated } = applyAuthToState(auth)
  if (!token) throw new Error('Không nhận được token từ server')
  setStoredToken(token)
  invalidateWalletCache('all')
  return { token, user, role, isAuthenticated }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    const role = normalizeRole(user?.role) || get().role
    set({
      user,
      role,
      isAuthenticated: !!get().token && !!user,
    })
  },

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
    useApiCacheStore.getState().clearCache()
    invalidateTournamentListCache()
    invalidateWalletCache('all')
    set({
      token: null,
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  fetchProfile: async () => {
    const raw = await authService.getMe()
    const user = mapAuthResponseToUser(raw)
    const role = normalizeRole(user?.role)
    set({ user, role, isAuthenticated: true })
    return user
  },

  login: async ({ email, password }) => {
    const auth = await authService.login({
      email: email?.trim(),
      password,
    })
    const session = persistLogin(auth)
    set({ ...session, isLoading: false })

    if (!session.user?.email) {
      const user = await get().fetchProfile()
      return { auth, user }
    }
    return { auth, user: session.user }
  },

  loginWithGoogle: async (idToken) => {
    const auth = await authService.loginGoogle(idToken)
    const session = persistLogin(auth)
    set({ ...session, isLoading: false })
    return { auth, user: session.user }
  },

  loginWithFacebook: async (accessToken) => {
    const auth = await authService.loginFacebook(accessToken)
    const session = persistLogin(auth)
    set({ ...session, isLoading: false })
    return { auth, user: session.user }
  },

  register: async (payload) => {
    const auth = await authService.register(payload)
    const session = persistLogin(auth)
    set({ ...session, isLoading: false })
    return { auth, user: session.user }
  },

  logout: async () => {
    try {
      if (getStoredToken()) await authService.logout()
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
      isAuthenticated: true,
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
