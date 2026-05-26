import { API_BASE_URL } from '@/config/env'
import { parseResponse } from '@/utils/httpError'

function buildUrl(path, params) {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`
  const url = new URL(path.replace(/^\//, ''), base)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return url.toString()
}

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(method, path, { params, body, headers, ...options } = {}) {
  const response = await fetch(buildUrl(path, params), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options,
  })

  return parseResponse(response)
}

export const apiClient = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
}
