const TOKEN_KEY = 'accessToken'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}
