import { create } from 'zustand'
import { authService } from '@/services/authService'
import { getStoredToken, setStoredToken, removeStoredToken } from '@/utils/tokenStorage'
import { isTokenExpired, getRoleFromToken } from '@/utils/jwtDecode'
import { applyAuthToState, mapAuthResponseToUser } from '@/utils/mapAuthResponse'
import { normalizeRole } from '@/utils/roleRedirect'
import { getLoginRetryPlan, isLoginLockError, sleep } from '@/utils/accountUnlockHint'
import { horseOwnerAccount } from '@/pages/horse-owner/data'
import { jockeyAccount } from '@/pages/jockey/data'

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
    const mockEmail = email?.trim().toLowerCase()
    const ownerEmail = horseOwnerAccount.email.toLowerCase()
    if (mockEmail === ownerEmail && password === horseOwnerAccount.password) {
      const mockSession = {
        token: horseOwnerAccount.token,
        user: horseOwnerAccount.user,
        role: normalizeRole(horseOwnerAccount.user.role),
        isAuthenticated: true,
      }
      setStoredToken(mockSession.token)
      set({ ...mockSession, isLoading: false })
      return { auth: mockSession, user: mockSession.user }
    }
    const jockeyEmail = jockeyAccount.email.toLowerCase()
    if (mockEmail === jockeyEmail && password === jockeyAccount.password) {
      const mockSession = {
        token: jockeyAccount.token,
        user: jockeyAccount.user,
        role: normalizeRole(jockeyAccount.user.role),
        isAuthenticated: true,
      }
      setStoredToken(mockSession.token)
      set({ ...mockSession, isLoading: false })
      return { auth: mockSession, user: mockSession.user }
    }

    const trimmedEmail = email?.trim()
    const credentials = { email: trimmedEmail, password }

    const finishLogin = async (auth) => {
      const session = persistLogin(auth)
      set({ ...session, isLoading: false })
      if (!session.user?.email) {
        const user = await get().fetchProfile()
        return { auth, user }
      }
      return { auth, user: session.user }
    }

    try {
      return await finishLogin(await authService.login(credentials))
    } catch (err) {
      const plan = getLoginRetryPlan(trimmedEmail, err)
      if (!plan) throw err

      const { stepMs, maxAttempts } = plan

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        await sleep(stepMs)
        try {
          return await finishLogin(await authService.login(credentials))
        } catch (retryErr) {
          if (!isLoginLockError(retryErr) || attempt === maxAttempts - 1) throw retryErr
        }
      }
      throw err
    }
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
