function isLoginRequest(error) {
  const url = String(error?.config?.url ?? '')
  return url.includes('/auth/login')
}

/** Thông báo lỗi từ BE — options.scene: 'login' | 'register' */
export function getApiErrorMessage(error, options = {}) {
  const status = error?.response?.status
  const data = error?.response?.data
  const message = String(data?.message ?? error?.message ?? '')
  const loginFlow = options.scene === 'login' || isLoginRequest(error)

  if (!error?.response) {
    if (loginFlow) return 'Không kết nối được máy chủ. Kiểm tra backend đang chạy (port 8080).'
    return 'Không kết nối được máy chủ'
  }

  if (loginFlow) {
    if (status === 401) return 'Email hoặc mật khẩu không đúng'
    if (status === 403 || status === 500) {
      return 'Tài khoản đã bị khóa. Liên hệ quản trị viên để được mở khóa.'
    }
    if (status >= 500) return 'Máy chủ đang gặp sự cố. Thử lại sau.'
  }

  if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    const fields = Object.values(data.data).filter(Boolean)
    if (fields.length) return fields.join(', ')
  }

  return message || 'Đã có lỗi xảy ra'
}
