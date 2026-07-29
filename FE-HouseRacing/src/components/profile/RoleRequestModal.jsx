import { useEffect, useMemo, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { ROLE_LABELS } from '@/constants/roleApplication'
import {
  getFileHint,
  sanitizeNumberInput,
  sanitizePhoneInput,
  validateFileField,
  validateNumberField,
  validateRoleApplication,
} from '@/utils/roleApplicationValidation'

const ROLE_FIELDS = {
  SPECTATOR: [
    { name: 'displayName', label: 'Họ và tên hiển thị', required: true, placeholder: 'Nguyễn Văn A' },
    { name: 'phone', label: 'Số điện thoại', type: 'tel', placeholder: '+84 901234567' },
    { name: 'location', label: 'Địa chỉ / Khu vực', placeholder: 'TP. Hồ Chí Minh' },
    { name: 'favoriteHorseBreed', label: 'Giống ngựa yêu thích', placeholder: 'Arabian, Thoroughbred...' },
    { name: 'bio', label: 'Giới thiệu ngắn', type: 'textarea', placeholder: 'Lý do bạn muốn trở thành khán giả chính thức' },
  ],
  OWNER: [
    { name: 'stableName', label: 'Tên trang trại / Chuồng ngựa', required: true, placeholder: 'Trang trại Phú Mỹ' },
    { name: 'address', label: 'Địa chỉ trang trại', required: true, placeholder: 'Số nhà, đường, quận, tỉnh' },
    { name: 'experienceYears', label: 'Số năm kinh nghiệm', type: 'number', placeholder: '3', min: 0, max: 80 },
    { name: 'bio', label: 'Giới thiệu thêm', type: 'textarea' },
    {
      name: 'verificationDocument',
      label: 'Giấy chứng nhận / Xác minh sở hữu',
      type: 'file',
      required: true,
    },
  ],
  JOCKEY: [
    { name: 'licenseNumber', label: 'Số giấy phép Jockey', required: true, placeholder: 'JK-XXXX' },
    { name: 'experienceYears', label: 'Số năm kinh nghiệm', type: 'number', placeholder: '5', min: 0, max: 80 },
    { name: 'heightCm', label: 'Chiều cao (cm)', type: 'number', placeholder: '165', min: 100, max: 250 },
    { name: 'weightKg', label: 'Cân nặng (kg)', type: 'number', placeholder: '55', min: 30, max: 200 },
    { name: 'bio', label: 'Giới thiệu', type: 'textarea' },
    { name: 'awards', label: 'Thành tích / Giải thưởng', type: 'textarea' },
    { name: 'specialties', label: 'Chuyên môn', type: 'textarea' },
    { name: 'licenseDocument', label: 'Bản scan giấy phép', type: 'file', required: true },
    { name: 'avatar', label: 'Ảnh đại diện', type: 'file' },
    { name: 'achievements', label: 'Ảnh thành tích', type: 'file' },
  ],
  REFEREE: [
    { name: 'licenseNumber', label: 'Số giấy chứng nhận trọng tài', required: true, placeholder: 'RF-XXXX' },
    { name: 'experienceYears', label: 'Số năm kinh nghiệm', type: 'number', placeholder: '8', min: 0, max: 80 },
    { name: 'specialty', label: 'Chuyên môn', required: true, placeholder: 'Đua ngựa tốc độ, vượt rào...' },
    { name: 'bio', label: 'Giới thiệu', type: 'textarea' },
    {
      name: 'certificationDocument',
      label: 'Chứng chỉ đào tạo trọng tài',
      type: 'file',
      required: true,
    },
  ],
}

function buildInitialValues(role, fullName) {
  const fields = ROLE_FIELDS[role] || []
  const values = {}
  fields.forEach((f) => {
    if (f.type !== 'file') values[f.name] = ''
  })
  if (role === 'SPECTATOR' && fullName) values.displayName = fullName
  return values
}

function FilePreview({ file }) {
  const previewUrl = useMemo(
    () => (file && file.type !== 'application/pdf' ? URL.createObjectURL(file) : null),
    [file],
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  if (!file) return null
  if (file.type === 'application/pdf') {
    return <p className="mt-2 text-xs text-[#1E3A5F]/60">PDF: {file.name}</p>
  }
  if (!previewUrl) return null
  return (
    <img
      src={previewUrl}
      alt=""
      className="mt-2 h-28 w-full rounded-lg border border-gray-200 object-cover"
    />
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs font-medium text-red-600">{message}</p>
}

export default function RoleRequestModal({ role, fullName, onClose, onSubmit }) {
  const fields = useMemo(() => ROLE_FIELDS[role] || [], [role])
  const [values, setValues] = useState(() => buildInitialValues(role, fullName))
  const [files, setFiles] = useState({})
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fileFieldNames = useMemo(
    () => new Set(fields.filter((f) => f.type === 'file').map((f) => f.name)),
    [fields],
  )

  const setFieldError = (name, message) => {
    setErrors((prev) => {
      const next = { ...prev }
      if (message) next[name] = message
      else delete next[name]
      return next
    })
  }

  const update = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }))
    setFieldError(name, '')
  }

  const handleTextChange = (field, rawValue) => {
    if (field.name === 'phone') {
      update(field.name, sanitizePhoneInput(rawValue))
      return
    }
    update(field.name, rawValue)
  }

  const handleNumberChange = (field, rawValue) => {
    const sanitized = sanitizeNumberInput(rawValue)
    if (sanitized === null) return
    update(field.name, sanitized)
    if (sanitized !== '') {
      setFieldError(field.name, validateNumberField(field.name, sanitized))
    }
  }

  const handleFileChange = (field, file) => {
    if (!file) return
    const fileError = validateFileField(field.name, file)
    if (fileError) {
      setFieldError(field.name, fileError)
      return
    }
    setFiles((prev) => ({ ...prev, [field.name]: file }))
    setFieldError(field.name, '')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = validateRoleApplication(role, values, files, fields)
    setErrors(result.errors)
    if (!result.valid) {
      toast.error('Vui lòng kiểm tra lại các trường được đánh dấu đỏ')
      return
    }

    setSubmitting(true)
    setUploading(true)
    try {
      await onSubmit({ values, files, fileFieldNames })
      onClose()
    } finally {
      setUploading(false)
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const inputClass = (name) =>
    `w-full px-4 py-3 bg-[#FAFAFA] border rounded-xl text-[#1E3A5F] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20 ${
      errors[name]
        ? 'border-red-400 focus:border-red-400'
        : 'border-gray-200 focus:border-[#D4A017]'
    }`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#D4A017]/10 to-transparent rounded-t-2xl">
          <div className="flex items-center gap-3">
            <FileText className="w-7 h-7 text-[#D4A017]" />
            <div>
              <h2 className="text-2xl font-bold text-[#1E3A5F]">
                Hồ sơ xin cấp quyền: {ROLE_LABELS[role]}
              </h2>
              <p className="text-sm text-[#1E3A5F]/60">
                {fullName ? (
                  <>
                    Người đăng ký: <span className="font-semibold text-[#1E3A5F]">{fullName}</span> — điền
                    đầy đủ thông tin (*)
                  </>
                ) : (
                  'Vui lòng điền đầy đủ các thông tin bắt buộc (*)'
                )}
              </p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-[#1E3A5F]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5" noValidate>
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  placeholder={f.placeholder}
                  rows={3}
                  maxLength={f.name === 'awards' ? 2000 : 1000}
                  value={values[f.name] || ''}
                  onChange={(e) => handleTextChange(f, e.target.value)}
                  className={`${inputClass(f.name)} resize-none`}
                />
              ) : f.type === 'file' ? (
                <>
                  <label
                    className={`flex items-center gap-3 px-4 py-3 bg-[#FAFAFA] border border-dashed rounded-xl cursor-pointer hover:border-[#D4A017] hover:bg-[#FFF8F0] transition-all ${
                      errors[f.name] ? 'border-red-400' : 'border-gray-300'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-[#D4A017]" />
                    <span className="text-[#1E3A5F]/70 text-sm flex-1 truncate">
                      {files[f.name]?.name || 'Chọn file để tải lên...'}
                    </span>
                    <input
                      type="file"
                      accept={f.name === 'avatar' || f.name === 'achievements' ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,application/pdf'}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        handleFileChange(f, file)
                        e.target.value = ''
                      }}
                    />
                  </label>
                  <FilePreview file={files[f.name]} />
                  <p className="mt-1 text-xs text-[#1E3A5F]/50">
                    File sẽ được server tải lên khi gửi hồ sơ. {getFileHint(f.name)}
                  </p>
                </>
              ) : f.type === 'number' ? (
                <input
                  type="number"
                  inputMode="numeric"
                  min={f.min ?? 0}
                  max={f.max}
                  step={f.name === 'weightKg' || f.name === 'heightCm' ? '0.1' : '1'}
                  placeholder={f.placeholder}
                  value={values[f.name] || ''}
                  onChange={(e) => handleNumberChange(f, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                  }}
                  className={inputClass(f.name)}
                />
              ) : f.type === 'tel' ? (
                <input
                  type="tel"
                  inputMode="tel"
                  placeholder={f.placeholder}
                  maxLength={30}
                  value={values[f.name] || ''}
                  onChange={(e) => handleTextChange(f, e.target.value)}
                  className={inputClass(f.name)}
                />
              ) : (
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={values[f.name] || ''}
                  onChange={(e) => handleTextChange(f, e.target.value)}
                  className={inputClass(f.name)}
                />
              )}
              {f.hint && <p className="mt-1 text-xs text-[#1E3A5F]/60">{f.hint}</p>}
              <FieldError message={errors[f.name]} />
            </div>
          ))}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 bg-[#FAFAFA] text-[#1E3A5F] border border-gray-200 rounded-xl hover:border-gray-400 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#D4A017] text-white rounded-xl hover:bg-[#B8941F] font-semibold shadow-lg shadow-[#D4A017]/20 disabled:opacity-50"
            >
              {uploading ? 'Đang tải lên server...' : submitting ? 'Đang gửi...' : 'Gửi hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
