import { create } from 'zustand'
import { authApi } from '@/api/authApi'
import { clearAccessToken, setAccessToken } from '@/api/authToken'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setSession: (token, user) => {
    setAccessToken(token)
    set({ token, user, isAuthenticated: !!user })
  },

  clearSession: () => {
    clearAccessToken()
    set({ token: null, user: null, isAuthenticated: false, isLoading: false })
  },

  fetchMe: async () => {
    const user = await authApi.getMe()
    set({ user, isAuthenticated: true })
    return user
  },

  login: async ({ email, password }) => {
    const auth = await authApi.login({ email, password })
    setAccessToken(auth.token)
    set({ token: auth.token })
    const user = await get().fetchMe()
    return { auth, user }
  },

  loginWithGoogle: async (idToken) => {
    const auth = await authApi.loginGoogle(idToken)
    setAccessToken(auth.token)
    set({ token: auth.token })
    const user = await get().fetchMe()
    return { auth, user }
  },

  loginWithFacebook: async (accessToken) => {
    const auth = await authApi.loginFacebook(accessToken)
    setAccessToken(auth.token)
    set({ token: auth.token })
    const user = await get().fetchMe()
    return { auth, user }
  },

  register: (payload) => authApi.register(payload),

  logout: async () => {
    try {
      if (get().token) await authApi.logout()
    } finally {
      get().clearSession()
    }
  },

  initAuth: async () => {
    const { token } = get()
    if (!token) {
      set({ isLoading: false })
      return
    }
    set({ isLoading: true })
    try {
      await get().fetchMe()
    } catch {
      get().clearSession()
    } finally {
      set({ isLoading: false })
    }
  },
}))
