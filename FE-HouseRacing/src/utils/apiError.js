const API_MESSAGE_VI = {
  'Current password is incorrect': 'Mật khẩu hiện tại không đúng',
  'New password must be different from current password':
    'Mật khẩu mới phải khác mật khẩu hiện tại',
  'Password login is not enabled for this account':
    'Tài khoản này không hỗ trợ đăng nhập bằng mật khẩu',
  'Current password is required': 'Vui lòng nhập mật khẩu hiện tại',
  'New password is required': 'Vui lòng nhập mật khẩu mới',
  'New password must be at least 6 characters': 'Mật khẩu mới phải có ít nhất 6 ký tự',
  'Password is required': 'Vui lòng nhập mật khẩu',
  'Password must be at least 6 characters': 'Mật khẩu phải có ít nhất 6 ký tự',
  'Invalid email or password': 'Email hoặc mật khẩu không đúng',
  'Validation failed': 'Dữ liệu không hợp lệ',
  'Invalid request body': 'Dữ liệu gửi lên không hợp lệ',
  'Access denied': 'Bạn không có quyền thực hiện thao tác này',
  'Authentication is required': 'Vui lòng đăng nhập để tiếp tục',
  'Internal server error': 'Máy chủ đang gặp sự cố. Thử lại sau.',
  'Database operation failed': 'Lỗi cơ sở dữ liệu. Thử lại sau.',
  'User profile request is required': 'Vui lòng nhập thông tin hồ sơ',
  'Race duration must be at least 45 minutes':
    'Giờ bắt đầu và giờ kết thúc cuộc đua phải cách nhau ít nhất 45 phút',
  'Race venue is already booked for an overlapping race':
    'Địa điểm đua đã có cuộc đua trùng khung giờ',
  'Only scheduled races can be checked in':
    'Chưa thể check-in. Admin cần đóng đăng ký và lên lịch giải để cuộc đua chuyển sang "Sắp diễn ra".',
  'Invalid check-in status': 'Trạng thái check-in không hợp lệ',
  'Check-in status is required': 'Thiếu trạng thái check-in',
  'Gate number is required': 'Thiếu số cổng xuất phát',
  'Gate number must be greater than zero': 'Số cổng xuất phát phải lớn hơn 0',
  'Gate number already exists in this race': 'Số cổng này đã được ngựa khác sử dụng trong cuộc đua',
  'Gate number must be assigned before race starts': 'Phải phân cổng xuất phát trước khi bắt đầu đua',
  'Race has no approved participants': 'Cuộc đua chưa có ngựa được duyệt để bắt đầu',
  'Cannot update gate after race has started, finished, or been cancelled':
    'Không thể đổi cổng sau khi cuộc đua đã bắt đầu, kết thúc hoặc bị hủy',
  'Only scheduled races can be started': 'Chỉ có thể bắt đầu cuộc đua khi cuộc đua ở trạng thái "Sắp diễn ra"',
  'Race does not have enough checked-in participants':
    'Chưa đủ ngựa check-in để bắt đầu cuộc đua. Hãy xác nhận có mặt và phân cổng xuất phát cho tất cả ngựa.',
  'Chỉ có thể bắt đầu cuộc đua khi cuộc đua ở trạng thái Sắp diễn ra. Admin cần lên lịch giải trước.':
    'Cuộc đua chưa lên lịch. Admin cần bấm "Lên lịch giải đấu" trước khi trọng tài bắt đầu.',
  'Only ongoing races can be finalized': 'Chỉ có thể chốt kết quả khi cuộc đua đang diễn ra',
  'Race result has already been finalized':
    'Kết quả đã được khóa. Admin cần bật giải "Đang diễn ra" để trọng tài cập nhật lại.',
  'Race results are required': 'Vui lòng nhập kết quả cuộc đua',
  'Participant does not belong to this race': 'Ngựa không thuộc cuộc đua này',
  'Only checked-in participants can finish a race':
    'Chỉ ngựa đã xác nhận có mặt mới được ghi hoàn thành. Hãy check-in ở tab Xác nhận có mặt.',
  'Referee salary must be reserved before race result is finalized':
    'Chưa giữ lương trọng tài. Trọng tài cần chấp nhận lời mời trước khi chốt kết quả.',
  'Result participant does not belong to this race': 'Ngựa không thuộc cuộc đua này',
  'Race result must include every approved participant':
    'Kết quả phải bao gồm tất cả ngựa tham gia đã được duyệt',
  'Không kết nối được máy chủ API. Vui lòng thử lại sau.':
    'Không kết nối được máy chủ API. Kiểm tra backend đang chạy và thử lại.',
  'Jockey already accepted an invitation for this race or an overlapping race':
    'Jockey đã nhận lời mời cho cuộc đua này hoặc cuộc đua trùng giờ',
  'Jockey already accepted another invitation': 'Jockey đã chấp nhận lời mời khác',
  'Betting feature is disabled': 'Tính năng đặt cược hiện đang bị tắt trên backend',
}

function isLoginRequest(error) {
  const url = String(error?.config?.url ?? '')
  return url.includes('/auth/login')
}

function isAccountLockedMessage(message) {
  const text = String(message ?? '').toLowerCase()
  return /khóa|locked|disabled|bị khóa/.test(text)
}

function translateApiMessage(message) {
  const text = String(message ?? '').trim()
  if (!text) return ''
  if (API_MESSAGE_VI[text]) return API_MESSAGE_VI[text]
  if (/[\u00C0-\u1EF9]/u.test(text)) return text
  return text
}

/** Thông báo lỗi từ BE — options.scene: 'login' | 'register' */
export function getApiErrorMessage(error, options = {}) {
  const status = error?.response?.status
  const data = error?.response?.data
  const message = String(data?.message ?? error?.message ?? '')
  const loginFlow = options.scene === 'login' || isLoginRequest(error)

  if (!error?.response) {
    if (error?.code === 'ECONNABORTED') {
      return 'Máy chủ phản hồi quá chậm. Thử lại sau.'
    }
    if (loginFlow) return 'Không kết nối được máy chủ. Kiểm tra lại kết nối đến API.'
    return 'Không kết nối được máy chủ. Kiểm tra backend API đang chạy (port 8080) hoặc thử lại sau.'
  }

  if (status === 502 || status === 503 || status === 504) {
    return translateApiMessage(message) || 'Máy chủ API tạm thời không phản hồi. Thử lại sau.'
  }

  if (loginFlow) {
    if (status === 401) return 'Email hoặc mật khẩu không đúng'
    if (
      status === 403 ||
      isAccountLockedMessage(message) ||
      (status === 500 && /internal server/i.test(message))
    ) {
      return 'Tài khoản đã bị khóa. Liên hệ quản trị viên để được mở khóa.'
    }
    if (status >= 500) return 'Máy chủ đang gặp sự cố. Thử lại sau.'
  }

  if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    const fields = Object.values(data.data)
      .filter(Boolean)
      .map((item) => translateApiMessage(item))
    if (fields.length) return fields.join(', ')
  }

  return translateApiMessage(message) || 'Đã có lỗi xảy ra'
}
