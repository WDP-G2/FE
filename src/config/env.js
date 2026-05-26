const env = import.meta.env

export const API_BASE_URL = env.VITE_API_BASE_URL ?? '/api/v1'

/** Phải trùng google.client-id trên BE */
export const GOOGLE_CLIENT_ID =
  env.VITE_GOOGLE_CLIENT_ID ??
  '798255039135-0o8kh6bhfq33qkjehg87d8q7uav28tf7.apps.googleusercontent.com'

/** Phải trùng facebook.app-id trên BE */
export const FACEBOOK_APP_ID = env.VITE_FACEBOOK_APP_ID ?? '26103012215974574'
