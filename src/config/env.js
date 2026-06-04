/** Biến từ `.env` (VITE_*) — chỉ key / value, không logic */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  GOOGLE_CLIENT_ID:
    import.meta.env.VITE_GOOGLE_CLIENT_ID ??
    '798255039135-0o8kh6bhfq33qkjehg87d8q7uav28tf7.apps.googleusercontent.com',
  FACEBOOK_APP_ID: import.meta.env.VITE_FACEBOOK_APP_ID ?? '26103012215974574',
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? 'dehtgp5iq',
  CLOUDINARY_UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? '',
  CLOUDINARY_NEWS_FOLDER: import.meta.env.VITE_CLOUDINARY_NEWS_FOLDER ?? 'hoser/news/images',
}
