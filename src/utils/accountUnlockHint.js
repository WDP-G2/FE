const STORAGE_KEY = 'hoser_recent_unlocks'
/** Khớp TTL cache user trên BE (mặc định ~120s) */
export const UNLOCK_CACHE_WAIT_MS = 120_000

function readList() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeList(list) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-80)))
}

export function markAccountUnlocked(email) {
  const key = email?.trim?.().toLowerCase()
  if (!key) return
  const now = Date.now()
  const list = readList().filter((item) => item.email !== key)
  list.push({ email: key, at: now })
  writeList(list)
}

export function getRecentUnlock(email) {
  const key = email?.trim?.().toLowerCase()
  if (!key) return null
  const entry = readList().find((item) => item.email === key)
  if (!entry) return null
  const age = Date.now() - entry.at
  if (age > UNLOCK_CACHE_WAIT_MS) return null
  return { ...entry, ageMs: age, remainingMs: UNLOCK_CACHE_WAIT_MS - age }
}

function isLoginRequest(error) {
  return String(error?.config?.url ?? '').includes('/auth/login')
}

/** Lỗi có thể do cache user BE (~120s) sau khi admin mở/khóa — không phải sai mật khẩu. */
export function isLoginLockError(error) {
  if (!isLoginRequest(error)) return false
  const status = error?.response?.status
  if (status === 401) return false
  const message = String(error?.response?.data?.message ?? '').toLowerCase()
  if (status === 403) return true
  if (status === 500 && message.includes('internal server')) return true
  return false
}

export function getLoginRetryPlan(email, error) {
  if (!isLoginLockError(error)) return null
  const recent = getRecentUnlock(email)
  const stepMs = 15_000
  const maxAttempts = recent
    ? Math.min(8, Math.ceil(recent.remainingMs / stepMs) || 1)
    : 8
  return { stepMs, maxAttempts }
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
