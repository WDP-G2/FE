export function formatEvidenceSize(bytes) {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return '—'
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

export function formatViolationDisplayId(violation) {
  if (violation?.displayCode) return violation.displayCode
  const createdAt = violation?.createdAt ? new Date(violation.createdAt) : new Date()
  const year = Number.isNaN(createdAt.getTime()) ? new Date().getFullYear() : createdAt.getFullYear()
  const suffix = String(violation?.id ?? '').slice(-3).toUpperCase() || '---'
  return `V-${year}-${suffix}`
}

export function formatViolationTimestamp(violation) {
  const raw = String(violation?.timestamp ?? violation?.occurredAt ?? '').trim()
  if (raw) return raw
  if (violation?.createdAt) {
    const date = new Date(violation.createdAt)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('vi-VN', { hour12: false }).replace(',', '')
    }
  }
  return '—'
}

export function buildViolationTimestamp(timeOfDay, date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `${datePart} ${timeOfDay}`
}

export function mapActiveViolationTypeLabels(types = []) {
  return (Array.isArray(types) ? types : [])
    .filter((item) => item?.active !== false)
    .map((item) => String(item?.label ?? '').trim())
    .filter(Boolean)
}

export function mapViolationFromApi(raw) {
  const evidence = (Array.isArray(raw?.evidence) ? raw.evidence : []).map((item) => ({
    name: item?.name || '',
    size: typeof item?.size === 'number' ? formatEvidenceSize(item.size) : String(item?.size || '—'),
    mimeType: item?.mimeType || '',
    url: item?.url || '',
  }))

  const mapped = {
    id: String(raw?.id ?? ''),
    displayCode: raw?.displayCode || '',
    raceId: String(raw?.raceId ?? ''),
    tournamentId: String(raw?.tournamentId ?? ''),
    raceName: raw?.raceName || '',
    horseNo: raw?.horseNo ?? null,
    horse: raw?.horse || raw?.horseName || '',
    jockey: raw?.jockey || raw?.jockeyName || '',
    type: raw?.type || '',
    severity: raw?.severity || '',
    description: raw?.description || '',
    penalty: raw?.penalty || '',
    timestamp: raw?.timestamp || raw?.occurredAt || '',
    evidence,
    reporter: raw?.reporter || raw?.refereeName || '',
    createdAt: raw?.createdAt || null,
    updatedAt: raw?.updatedAt || null,
  }

  mapped.displayCode = formatViolationDisplayId(mapped)
  return mapped
}

export function getEvidenceMediaUrl(file) {
  return file?.url || file?.previewUrl || ''
}

export function isEvidenceImage(file) {
  if (!file) return false
  if (file.mimeType?.startsWith('image/')) return true
  if (/\.(jpe?g|png|webp|gif)$/i.test(file?.name || '')) return true
  const url = getEvidenceMediaUrl(file)
  if (!url) return false
  return /^data:image\//i.test(url) || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url) || /res\.cloudinary\.com/i.test(url)
}

export function isEvidenceVideo(file) {
  if (!file) return false
  if (file.mimeType?.startsWith('video/')) return true
  if (/\.(mp4|mov|webm)$/i.test(file?.name || '')) return true
  const url = getEvidenceMediaUrl(file)
  if (!url) return false
  return /^data:video\//i.test(url) || /\.(mp4|mov|webm)(\?|$)/i.test(url)
}
