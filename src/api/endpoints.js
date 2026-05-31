export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    google: '/auth/google',
    facebook: '/auth/facebook',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    byId: (id) => `/users/${id}`,
    profile: '/users/me/profile',
  },
  admin: {
    users: '/admin/users',
    userById: (id) => `/admin/users/${id}`,
    activeUsers: '/admin/users/active',
    deactivatedUsers: '/admin/users/deactivated',
  },
  tournaments: {
    adminList: '/admin/tournaments',
    adminById: (id) => `/admin/tournaments/${id}`,
    adminBanners: '/admin/tournament-banners',
    adminStatus: (id) => `/admin/tournaments/${id}/status`,
    publicList: '/tournaments',
    publicById: (id) => `/tournaments/${id}`,
  },
  /** Ví dụ domain service — thay path khi có module blood-donation thật */
  blood: {
    list: '/blood-records',
    byId: (id) => `/blood-records/${id}`,
  },
  news: {
    all: '/news/all',
    featured: '/news/featured',
    byId: (id) => `/news/${id}`,
    related: (id) => `/news/${id}/related`,
  },
}
