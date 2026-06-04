import { useMemo, useState } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { ROLE_LABELS } from '@/constants/roleApplication'

const ROLE_FIELDS = {
  SPECTATOR: [
    { name: 'displayName', label: 'Họ và tên hiển thị', required: true, placeholder: 'Nguyễn Văn A' },
    { name: 'phone', label: 'Số điện thoại', type: 'tel', placeholder: '+84 ...' },
    { name: 'location', label: 'Địa chỉ / Khu vực', placeholder: 'TP. Hồ Chí Minh' },
    { name: 'favoriteHorseBreed', label: 'Giống ngựa yêu thích', placeholder: 'Arabian, Thoroughbred...' },
    { name: 'bio', label: 'Giới thiệu ngắn', type: 'textarea', placeholder: 'Lý do bạn muốn trở thành khán giả chính thức' },
  ],
  OWNER: [
    { name: 'stableName', label: 'Tên trang trại / Chuồng ngựa', required: true, placeholder: 'Trang trại Phú Mỹ' },
    { name: 'address', label: 'Địa chỉ trang trại', required: true, placeholder: 'Số nhà, đường, quận, tỉnh' },
    { name: 'experienceYears', label: 'Số năm kinh nghiệm', type: 'number', placeholder: '3' },
    { name: 'bio', label: 'Giới thiệu thêm', type: 'textarea' },
    {
      name: 'verificationDocument',
      label: 'Giấy chứng nhận / Xác minh sở hữu',
      type: 'file',
      required: true,
      hint: 'PDF hoặc ảnh (JPG, PNG)',
    },
  ],
  JOCKEY: [
    { name: 'licenseNumber', label: 'Số giấy phép Jockey', required: true, placeholder: 'JK-XXXX' },
    { name: 'experienceYears', label: 'Số năm kinh nghiệm', type: 'number', placeholder: '5' },
    { name: 'heightCm', label: 'Chiều cao (cm)', type: 'number', placeholder: '165' },
    { name: 'weightKg', label: 'Cân nặng (kg)', type: 'number', placeholder: '55' },
    { name: 'hirePrice', label: 'Giá thuê (VNĐ)', type: 'number', required: true, placeholder: '1000000' },
    { name: 'bio', label: 'Giới thiệu', type: 'textarea' },
    { name: 'awards', label: 'Thành tích / Giải thưởng', type: 'textarea' },
    { name: 'specialties', label: 'Chuyên môn', type: 'textarea' },
    { name: 'licenseDocument', label: 'Bản scan giấy phép', type: 'file', required: true },
    { name: 'avatar', label: 'Ảnh đại diện', type: 'file' },
    { name: 'achievements', label: 'Ảnh thành tích', type: 'file' },
  ],
  REFEREE: [
    { name: 'licenseNumber', label: 'Số giấy chứng nhận trọng tài', required: true, placeholder: 'RF-XXXX' },
    { name: 'experienceYears', label: 'Số năm kinh nghiệm', type: 'number', placeholder: '8' },
    { name: 'specialty', label: 'Chuyên môn', required: true, placeholder: 'Đua ngựa tốc độ, vượt rào...' },
    { name: 'bio', label: 'Giới thiệu', type: 'textarea' },
    {
      name: 'certificationDocument',
      label: 'Chứng chỉ đào tạo trọng tài',
      type: 'file',
      required: true,
      hint: 'PDF hoặc ảnh',
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

export default function RoleRequestModal({ role, fullName, onClose, onSubmit }) {
  const fields = ROLE_FIELDS[role] || []
  const [values, setValues] = useState(() => buildInitialValues(role, fullName))
  const [files, setFiles] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const fileFieldNames = useMemo(
    () => new Set(fields.filter((f) => f.type === 'file').map((f) => f.name)),
    [fields],
  )

  const update = (name, value) => setValues((v) => ({ ...v, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({ values, files, fileFieldNames })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

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
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-[#1E3A5F]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                {f.label} {f.required && <span className="text-red-500">*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  required={f.required}
                  placeholder={f.placeholder}
                  rows={3}
                  value={values[f.name] || ''}
                  onChange={(e) => update(f.name, e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 resize-none"
                />
              ) : f.type === 'file' ? (
                <label className="flex items-center gap-3 px-4 py-3 bg-[#FAFAFA] border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#D4A017] hover:bg-[#FFF8F0] transition-all">
                  <Upload className="w-5 h-5 text-[#D4A017]" />
                  <span className="text-[#1E3A5F]/70 text-sm flex-1 truncate">
                    {files[f.name]?.name || 'Chọn file để tải lên...'}
                  </span>
                  <input
                    type="file"
                    required={f.required && !files[f.name]}
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setFiles((prev) => ({ ...prev, [f.name]: file }))
                    }}
                  />
                </label>
              ) : (
                <input
                  type={f.type || 'text'}
                  required={f.required}
                  placeholder={f.placeholder}
                  value={values[f.name] || ''}
                  onChange={(e) => update(f.name, e.target.value)}
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20"
                />
              )}
              {f.hint && <p className="mt-1 text-xs text-[#1E3A5F]/60">{f.hint}</p>}
            </div>
          ))}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#FAFAFA] text-[#1E3A5F] border border-gray-200 rounded-xl hover:border-gray-400 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-[#D4A017] text-white rounded-xl hover:bg-[#B8941F] font-semibold shadow-lg shadow-[#D4A017]/20 disabled:opacity-50"
            >
              {submitting ? 'Đang gửi...' : 'Gửi hồ sơ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
