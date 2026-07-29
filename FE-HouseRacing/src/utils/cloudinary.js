const DELIVERY_HOST = 'res.cloudinary.com'

export const FALLBACK_NEWS_IMAGE =
  'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'

const UPLOAD_SEGMENT = '/image/upload/'

function parseCloudinaryCloudName(url) {
  const match = String(url).match(/res\.cloudinary\.com\/([^/]+)\//i)
  return match?.[1] ?? null
}

function buildTransformSegment(options = {}) {
  const { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = options
  return [
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    crop ? `c_${crop}` : null,
    format ? `f_${format}` : null,
    quality ? `q_${quality}` : null,
  ]
    .filter(Boolean)
    .join(',')
}

function hasDeliveryTransforms(pathAfterUpload) {
  const first = pathAfterUpload.split('/')[0] ?? ''
  return first.includes('_') && !/^v\d+$/.test(first)
}

function buildUrlFromPublicId(publicId, options, cloudName) {
  if (!cloudName) return FALLBACK_NEWS_IMAGE
  const transforms = buildTransformSegment(options)
  const path = transforms ? `${transforms}/${publicId}` : publicId
  return `https://${DELIVERY_HOST}/${cloudName}/image/upload/${path}`
}

/**
 * CDN resize — cloud name lấy từ URL BE trả về, không cần cấu hình FE.
 */
export function getCloudinaryImageUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return FALLBACK_NEWS_IMAGE

  const trimmed = url.trim()
  if (!trimmed) return FALLBACK_NEWS_IMAGE

  const cloudName = parseCloudinaryCloudName(trimmed)

  if (!trimmed.includes(DELIVERY_HOST)) {
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return buildUrlFromPublicId(trimmed.replace(/^\/+/, ''), options, cloudName)
    }
    return trimmed
  }

  const markerIndex = trimmed.indexOf(UPLOAD_SEGMENT)
  if (markerIndex === -1) return trimmed

  const prefix = trimmed.slice(0, markerIndex + UPLOAD_SEGMENT.length)
  const rest = trimmed.slice(markerIndex + UPLOAD_SEGMENT.length)

  if (hasDeliveryTransforms(rest)) return trimmed

  const transforms = buildTransformSegment(options)
  if (!transforms) return trimmed

  return `${prefix}${transforms}/${rest}`
}

export function handleCloudinaryImageError(event) {
  event.currentTarget.onerror = null
  event.currentTarget.src = FALLBACK_NEWS_IMAGE
}

export const NEWS_IMAGE_PRESETS = {
  card: { width: 640, height: 360, crop: 'fill' },
  detail: { width: 1200, height: 675, crop: 'fill' },
  thumb: { width: 160, height: 96, crop: 'fill' },
  related: { width: 224, height: 224, crop: 'fill' },
}
