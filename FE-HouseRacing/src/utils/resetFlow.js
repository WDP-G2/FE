const KEY = 'horse_reset_flow'

export function saveResetFlow(email, otp) {
  sessionStorage.setItem(KEY, JSON.stringify({ email, otp }))
}

export function getResetFlow() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearResetFlow() {
  sessionStorage.removeItem(KEY)
}
