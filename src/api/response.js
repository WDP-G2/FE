/** Chuẩn hóa body ApiResponse từ BE: { success, data, message } */
export function unwrapResponse(res) {
  const body = res.data
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) throw new Error(body.message || 'Request failed')
    return body.data
  }
  return body
}
