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
    jockeyDirectory: "/users/jockeys/directory",
    byRole: (role) => `/users?role=${encodeURIComponent(role)}`,
  },
  admin: {
    users: "/admin/users",
    userById: (id) => `/admin/users/${id}`,
    activeUsers: "/admin/users/active",
    deactivatedUsers: "/admin/users/deactivated",
  },
  tournaments: {
    list: "/tournaments",
    ownerOpen: "/tournaments/owner/open",
    ownerRegistrations: "/tournaments/owner/registrations",
    byId: (id) => `/tournaments/${id}`,
    config: (id) => `/tournaments/${id}/config`,
    races: (id) => `/tournaments/${id}/races`,
    raceById: (id, raceId) => `/tournaments/${id}/races/${raceId}`,
    ownerRaceOptions: (id, raceId) =>
      `/tournaments/${id}/races/${raceId}/owner-options`,
    ownerRegistrationsByTournament: (id) =>
      `/tournaments/${id}/owner/registrations`,
    deleteRace: (id, raceId) => `/tournaments/${id}/races/${raceId}`,
    results: (id, raceId) => `/tournaments/${id}/races/${raceId}/results`,
    registrations: (id) => `/tournaments/${id}/registrations`,
    ownerRegister: (id) => `/tournaments/${id}/owner/registrations`,
    registrationStatus: (id, registrationId) =>
      `/tournaments/${id}/registrations/${registrationId}`,
  },

  blood: {
    list: "/blood-records",
    byId: (id) => `/blood-records/${id}`,
  },
  horses: {
    list: "/horses",
    byId: (id) => `/horses/${id}`,
  },
  invitations: {
    list: "/invitations",
    me: "/invitations/me",
    sent: "/invitations/sent",
    respond: (id) => `/invitations/${id}/respond`,
  },
  news: {
    all: "/news",
    featured: "/news/featured",
    byId: (id) => `/news/${id}`,
    related: (id) => `/news/${id}/related`,
  },
};
