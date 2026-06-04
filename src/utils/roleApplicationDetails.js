import { ROLE_LABELS } from '@/services/adminUserService'

const COMMON_FIELDS = [
  { key: 'email', label: 'Email' },
  { key: 'username', label: 'Username' },
  { key: 'fullName', label: 'Họ và tên' },
  { key: 'displayName', label: 'Tên hiển thị' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'location', label: 'Khu vực / Địa chỉ' },
  { key: 'bio', label: 'Giới thiệu' },
]

const ROLE_FIELDS = {
  OWNER: [
    { key: 'stableName', label: 'Tên trang trại / Chuồng ngựa' },
    { key: 'address', label: 'Địa chỉ trang trại' },
    { key: 'experienceYears', label: 'Số năm kinh nghiệm', format: 'number' },
    { key: 'verificationDocumentUrl', label: 'Giấy xác minh', format: 'url' },
  ],
  SPECTATOR: [
    { key: 'favoriteHorseBreed', label: 'Giống ngựa yêu thích' },
  ],
  JOCKEY: [
    { key: 'licenseNumber', label: 'Số giấy phép Jockey' },
    { key: 'experienceYears', label: 'Số năm kinh nghiệm', format: 'number' },
    { key: 'heightCm', label: 'Chiều cao (cm)', format: 'number' },
    { key: 'weightKg', label: 'Cân nặng (kg)', format: 'number' },
    { key: 'hirePrice', label: 'Giá thuê (VNĐ)', format: 'currency' },
    { key: 'awards', label: 'Thành tích / Giải thưởng' },
    { key: 'specialties', label: 'Chuyên môn' },
    { key: 'avatarUrl', label: 'Ảnh đại diện', format: 'url' },
    { key: 'licenseDocumentUrl', label: 'Giấy phép', format: 'url' },
    { key: 'achievements', label: 'Ảnh thành tích', format: 'url' },
  ],
  REFEREE: [
    { key: 'licenseNumber', label: 'Số chứng nhận trọng tài' },
    { key: 'experienceYears', label: 'Số năm kinh nghiệm', format: 'number' },
    { key: 'specialty', label: 'Chuyên môn' },
    { key: 'certificationDocumentUrl', label: 'Chứng chỉ', format: 'url' },
  ],
}

function formatValue(value, format) {
  if (value === null || value === undefined || value === '') return null
  if (format === 'currency') {
    const num = Number(value)
    if (Number.isNaN(num)) return String(value)
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
  }
  if (format === 'number') return String(value)
  return String(value)
}

function collectFields(application, fieldDefs) {
  const rows = []
  const seen = new Set()

  for (const def of fieldDefs) {
    if (seen.has(def.key)) continue
    const formatted = formatValue(application?.[def.key], def.format)
    if (!formatted) continue
    seen.add(def.key)
    rows.push({
      key: def.key,
      label: def.label,
      value: formatted,
      isUrl: def.format === 'url',
    })
  }
  return rows
}

export function buildRoleApplicationDetailRows(application) {
  const roleCode = application?.role ?? 'USER'
  const roleFields = ROLE_FIELDS[roleCode] ?? []
  return [
    ...collectFields(application, COMMON_FIELDS),
    ...collectFields(application, roleFields),
  ]
}

export function getRoleApplicationMeta(application) {
  const roleCode = application?.role ?? 'USER'
  return {
    roleCode,
    roleLabel: ROLE_LABELS[roleCode] ?? roleCode,
  }
}
