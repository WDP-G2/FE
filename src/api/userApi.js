import api from '@/api/axios'

function unwrap(res) {
  const body = res.data
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) throw new Error(body.message || 'Request failed')
    return body.data
  }
  return body
}

export const userApi = {
  getById: (id) => api.get(`/users/${id}`).then(unwrap),
}
