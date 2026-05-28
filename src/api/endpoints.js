export const ENDPOINTS = {
  auth: {
    register: "/users/register",
    login: "/users/login",
    logout: "/users/logout",
    me: "/users/me",
    google: "/auth/google",
    facebook: "/auth/facebook",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  users: {
    byId: (id) => `/users/${id}`,
    profile: "/users/me",
  },
  admin: {
    users: "/admin/users",
    userById: (id) => `/admin/users/${id}`,
    activeUsers: "/admin/users/active",
    deactivatedUsers: "/admin/users/deactivated",
  },
  tournaments: {
    list: "/tournaments",
    byId: (id) => `/tournaments/${id}`,
    config: (id) => `/tournaments/${id}/config`,
    races: (id) => `/tournaments/${id}/races`,
    raceById: (id, raceId) => `/tournaments/${id}/races/${raceId}`,
    deleteRace: (id, raceId) => `/tournaments/${id}/races/${raceId}`,
    results: (id, raceId) => `/tournaments/${id}/races/${raceId}/results`,
    registrations: (id) => `/tournaments/${id}/registrations`,
  },
  
  blood: {
    list: "/blood-records",
    byId: (id) => `/blood-records/${id}`,
  },
  news: {
    all: "/news/all",
    featured: "/news/featured",
    byId: (id) => `/news/${id}`,
    related: (id) => `/news/${id}/related`,
  },
};
