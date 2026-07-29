export function validatePassword(password) {
  if (password.length < 8) {
    return 'Mật khẩu phải có ít nhất 8 ký tự'
  }
  if (!/[A-Z]/.test(password)) {
    return 'Mật khẩu phải có ít nhất 1 chữ hoa'
  }
  if (!/[0-9]/.test(password)) {
    return 'Mật khẩu phải có ít nhất 1 số'
  }
  return ''
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' }
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  const labels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh']
  return { score, label: labels[score] }
}

export function deriveUsername(email) {
  let name = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
  if (name.length < 3) {
    name = `user_${name}${Date.now().toString().slice(-4)}`
  }
  return name.slice(0, 50)
}
