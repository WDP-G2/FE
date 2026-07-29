/** Giới hạn upload — BE cho phép tối đa 50MB; FE khuyến nghị thấp hơn để upload nhanh */
export const FILE_SIZE_LIMITS = {
  document: 10 * 1024 * 1024, // PDF / giấy tờ: 10MB
  image: 5 * 1024 * 1024, // Ảnh: 5MB
}

export const ALLOWED_MIME = {
  document: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  image: ['image/jpeg', 'image/png', 'image/webp'],
  kycImage: ['image/jpeg', 'image/png'],
}

const FILE_FIELD_KIND = {
  verificationDocument: 'document',
  licenseDocument: 'document',
  certificationDocument: 'document',
  avatar: 'image',
  achievements: 'image',
}

const NUMBER_RULES = {
  experienceYears: { min: 0, max: 80, label: 'Số năm kinh nghiệm' },
  heightCm: { min: 100, max: 250, label: 'Chiều cao (cm)' },
  weightKg: { min: 30, max: 200, label: 'Cân nặng (kg)' },
}

const TEXT_MAX = {
  displayName: 100,
  phone: 30,
  location: 255,
  favoriteHorseBreed: 120,
  bio: 1000,
  stableName: 160,
  address: 255,
  licenseNumber: 100,
  specialty: 160,
  awards: 2000,
  specialties: 1000,
}

export function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))}MB`
  return `${Math.round(bytes / 1024)}KB`
}

export function sanitizePhoneInput(value) {
  return String(value ?? '').replace(/[^\d+\-\s()]/g, '')
}

export function isValidPhone(value) {
  const text = String(value ?? '').trim()
  if (!text) return true
  const digits = text.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15
}

export function sanitizeNumberInput(value) {
  const text = String(value ?? '').trim()
  if (text === '') return ''
  if (!/^\d*\.?\d*$/.test(text)) return null
  return text
}

export function validateNumberField(name, value) {
  const rule = NUMBER_RULES[name]
  if (!rule) return ''
  const text = String(value ?? '').trim()
  if (!text) return ''
  const num = Number(text)
  if (!Number.isFinite(num)) return `${rule.label} không hợp lệ`
  if (num < rule.min) return `${rule.label} không được nhỏ hơn ${rule.min}`
  if (num > rule.max) return `${rule.label} không được lớn hơn ${rule.max}`
  return ''
}

export function validateFileField(name, file) {
  if (!file) return ''
  const kind = FILE_FIELD_KIND[name] || 'document'
  const allowed = ALLOWED_MIME[kind]
  const maxSize = FILE_SIZE_LIMITS[kind]

  if (!allowed.includes(file.type)) {
    return kind === 'image'
      ? 'Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP'
      : 'Chỉ chấp nhận PDF hoặc ảnh JPG, PNG, WEBP'
  }
  if (file.size > maxSize) {
    return `Dung lượng tối đa ${formatFileSize(maxSize)} (file hiện tại: ${formatFileSize(file.size)})`
  }
  return ''
}

export function validateRoleApplication(role, values, files, fields) {
  const errors = {}

  fields.forEach((field) => {
    const value = values[field.name]
    const text = String(value ?? '').trim()

    if (field.required && field.type !== 'file' && !text) {
      errors[field.name] = 'Trường này là bắt buộc'
      return
    }

    if (field.type === 'file') {
      const file = files[field.name]
      if (field.required && !file) {
        errors[field.name] = 'Vui lòng chọn file'
        return
      }
      if (file) {
        const fileError = validateFileField(field.name, file)
        if (fileError) errors[field.name] = fileError
      }
      return
    }

    if (field.name === 'phone' && text) {
      if (!isValidPhone(text)) {
        errors[field.name] = 'Số điện thoại cần 8–15 chữ số, không chứa chữ'
      }
    }

    if (field.type === 'number' || NUMBER_RULES[field.name]) {
      const numError = validateNumberField(field.name, value)
      if (numError) errors[field.name] = numError
    }

    const maxLen = TEXT_MAX[field.name]
    if (maxLen && text.length > maxLen) {
      errors[field.name] = `Tối đa ${maxLen} ký tự`
    }
  })

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function getFileHint(fieldName) {
  const kind = FILE_FIELD_KIND[fieldName] || 'document'
  const max = formatFileSize(FILE_SIZE_LIMITS[kind])
  if (kind === 'image') return `Ảnh JPG, PNG, WEBP — tối đa ${max}`
  return `PDF hoặc ảnh JPG, PNG, WEBP — tối đa ${max}`
}

export function validateKycImage(file) {
  if (!file) return 'Vui lòng chọn ảnh'
  if (!ALLOWED_MIME.kycImage.includes(file.type)) {
    return 'Chỉ chấp nhận ảnh JPEG hoặc PNG'
  }
  if (file.size > FILE_SIZE_LIMITS.image) {
    return `Dung lượng tối đa ${formatFileSize(FILE_SIZE_LIMITS.image)}`
  }
  return ''
}
