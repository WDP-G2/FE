export function getApiErrorMessage(error) {
  const data = error?.response?.data
  if (data?.data && typeof data.data === 'object') {
    return Object.values(data.data).join(', ')
  }
  return data?.message || error?.message || 'Đã có lỗi xảy ra'
}
