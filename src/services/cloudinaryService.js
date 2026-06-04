import { ENV } from '@/config/env'

function canUploadFromBrowser() {
  return Boolean(ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_UPLOAD_PRESET)
}

function isPdf(file) {
  return file?.type === 'application/pdf' || /\.pdf$/i.test(file?.name ?? '')
}

function uploadEndpoint(resourceType) {
  const cloud = ENV.CLOUDINARY_CLOUD_NAME
  if (resourceType === 'raw') {
    return `https://api.cloudinary.com/v1_1/${cloud}/raw/upload`
  }
  return `https://api.cloudinary.com/v1_1/${cloud}/image/upload`
}

/**
 * Upload file lên Cloudinary (unsigned preset) — ảnh hoặc PDF.
 * @param {File} file
 * @param {{ folder?: string, resourceType?: 'image'|'raw' }} options
 */
export async function uploadCloudinaryAsset(file, options = {}) {
  if (!file) throw new Error('Chưa chọn file')
  if (!canUploadFromBrowser()) {
    throw new Error('Chưa cấu hình VITE_CLOUDINARY_UPLOAD_PRESET trong .env')
  }

  const resourceType = options.resourceType ?? (isPdf(file) ? 'raw' : 'image')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', ENV.CLOUDINARY_UPLOAD_PRESET)
  if (options.folder) formData.append('folder', options.folder)

  const response = await fetch(uploadEndpoint(resourceType), { method: 'POST', body: formData })
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Upload Cloudinary thất bại')
  }

  const secureUrl = payload?.secure_url
  if (!secureUrl) throw new Error('Cloudinary không trả về secure_url')

  return {
    secureUrl,
    publicId: payload.public_id ?? '',
    resourceType,
  }
}

/** Upload ảnh tin tức (giữ tương thích code cũ). */
export async function uploadNewsImage(file) {
  const result = await uploadCloudinaryAsset(file, { folder: ENV.CLOUDINARY_NEWS_FOLDER })
  return {
    secureUrl: result.secureUrl,
    publicId: result.publicId,
  }
}

const ROLE_SUBFOLDERS = {
  OWNER: 'owner',
  JOCKEY: 'jockey',
  REFEREE: 'referee',
}

/** Upload tài liệu / ảnh hồ sơ xin vai trò. */
export async function uploadRoleApplicationFile(file, roleKey, fieldName) {
  const base = ENV.CLOUDINARY_ROLE_FOLDER ?? 'hoser/role-applications'
  const sub = ROLE_SUBFOLDERS[roleKey] ?? 'misc'
  const folder = `${base}/${sub}/${fieldName}`
  const resourceType = isPdf(file) ? 'raw' : 'image'
  const { secureUrl } = await uploadCloudinaryAsset(file, { folder, resourceType })
  return secureUrl
}
