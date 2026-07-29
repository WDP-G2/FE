/** Biến từ `.env` (VITE_*) — chỉ key / value, không logic */
export const LOCAL_API_BASE_URL = '/api/v1'
export const DEPLOY_API_BASE_URL = 'https://be-production-dcb3.up.railway.app/api/v1'

const DEFAULT_API_BASE_URL = import.meta.env.DEV
  ? LOCAL_API_BASE_URL
  : DEPLOY_API_BASE_URL

export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  GOOGLE_CLIENT_ID:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ??
    '798255039135-0o8kh6bhfq33qkjehg87d8q7uav28tf7.apps.googleusercontent.com',
  FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID ?? '26103012215974574',
}
