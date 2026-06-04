import { ENV } from '@/config/env'

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`

function canUploadFromBrowser() {
  return Boolean(ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_UPLOAD_PRESET)
}

/** Upload ảnh lên Cloudinary từ trình duyệt (unsigned preset). */
export async function uploadNewsImage(file) {
  if (!file) throw new Error('Chưa chọn file ảnh')

  if (!canUploadFromBrowser()) {
    throw new Error('Chưa cấu hình VITE_CLOUDINARY_UPLOAD_PRESET trong .env')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', ENV.CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', ENV.CLOUDINARY_NEWS_FOLDER)

  const response = await fetch(UPLOAD_URL, { method: 'POST', body: formData })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Upload Cloudinary thất bại')
  }

  const secureUrl = payload?.secure_url
  if (!secureUrl) throw new Error('Cloudinary không trả về secure_url')

  return {
    secureUrl,
    publicId: payload.public_id ?? '',
    width: payload.width,
    height: payload.height,
  }
}
