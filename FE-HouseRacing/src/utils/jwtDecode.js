import { jwtDecode } from 'jwt-decode'

export function decodeJwt(token) {
  if (!token) return null
  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = decodeJwt(token)
  if (!payload?.exp) return true
  return payload.exp * 1000 < Date.now()
}

export function getRoleFromToken(token) {
  const payload = decodeJwt(token)
  if (!payload) return null
  return payload.role || payload.authorities?.[0] || null
}
