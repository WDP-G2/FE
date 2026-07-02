/** BE Node.js + MongoDB Atlas — cổng lắng nghe (khớp vite.config.js & BE PORT) */
export const BE_API_PORT = 8080
export const BE_API_ORIGIN = `http://localhost:${BE_API_PORT}`

/** Dev: Vite proxy /api → BE. Production: gọi thẳng BE local */
export const LOCAL_API_BASE_URL = '/api/v1'

export const ENV = {
  API_BASE_URL: import.meta.env.DEV ? LOCAL_API_BASE_URL : `${BE_API_ORIGIN}/api/v1`,
  GOOGLE_CLIENT_ID:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ??
    '798255039135-0o8kh6bhfq33qkjehg87d8q7uav28tf7.apps.googleusercontent.com',
  FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID ?? '26103012215974574',
}
