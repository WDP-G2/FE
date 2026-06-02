import { useState } from 'react'
import { DollarSign, FileText, Mail, Palette, Settings, Shield } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import Field from '@/components/ui/Field'
import { inputClass } from '@/components/ui/styles'

const tabs = [
  { key: 'fees', label: 'Lệ phí mặc định', icon: DollarSign },
  { key: 'rules', label: 'Luật mặc định', icon: FileText },
  { key: 'email', label: 'Mẫu email', icon: Mail },
  { key: 'security', label: 'Bảo mật', icon: Shield },
  { key: 'brand', label: 'Thương hiệu', icon: Palette },
]

export default function AdminSettingsPage() {
  const [tab, setTab] = useState('fees')

  return (
    <AdminLayout
      heading="Cài đặt"
      highlight="Hệ thống"
      subtitle="Cấu hình mặc định dùng chung cho toàn bộ nền tảng admin"
    >
      <section className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-white/[0.045] p-2">
        {tabs.map((item) => {
          const Icon = item.icon
          const active = tab === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.045]">
        <div className="flex items-center gap-4 border-b border-white/10 px-6 py-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dda50e]/15 text-[#dda50e]">
            <Settings className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold">{tabs.find((item) => item.key === tab)?.label}</h2>
            <p className="text-sm text-white/50">Thiết lập nhanh theo module</p>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          {tab === 'fees' && (
            <>
              <Field label="Lệ phí đăng ký mặc định (VNĐ)">
                <input type="number" defaultValue={5000000} className={inputClass} />
              </Field>
              <Field label="Phí trễ hạn (VNĐ)">
                <input type="number" defaultValue={500000} className={inputClass} />
              </Field>
            </>
          )}

          {tab === 'rules' && (
            <Field label="Luật mẫu áp dụng cho giải đấu mới" full>
              <textarea
                rows={10}
                defaultValue={
                  '1. Ngựa phải có giấy chứng nhận sức khỏe hợp lệ.\n2. Jockey phải có chứng chỉ FIA.\n3. Kiểm tra doping bắt buộc.'
                }
                className={`${inputClass} h-auto resize-none py-4`}
              />
            </Field>
          )}

          {tab === 'email' && (
            <>
              <Field label="Mẫu mở đăng ký" full>
                <input
                  defaultValue="[HorseRacing] Mở đăng ký giải đấu {{tournament}}"
                  className={inputClass}
                />
              </Field>
              <Field label="Mẫu nhắc check-in" full>
                <input
                  defaultValue="[HorseRacing] Nhắc check-in cuộc đua {{race}}"
                  className={inputClass}
                />
              </Field>
              <Field label="Mẫu công bố kết quả" full>
                <input
                  defaultValue="[HorseRacing] Kết quả cuộc đua {{race}}"
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {tab === 'security' && (
            <>
              <Field label="Xác thực 2 yếu tố">
                <select defaultValue="admin" className={inputClass}>
                  <option value="admin">Bật cho Admin</option>
                  <option value="all">Bắt buộc tất cả</option>
                  <option value="off">Tắt</option>
                </select>
              </Field>
              <Field label="Thời gian phiên (phút)">
                <input type="number" defaultValue={60} className={inputClass} />
              </Field>
            </>
          )}

          {tab === 'brand' && (
            <>
              <Field label="Tên hệ thống">
                <input defaultValue="Horse Racing Admin" className={inputClass} />
              </Field>
              <Field label="Màu chính">
                <input defaultValue="#D4A017" className={inputClass} />
              </Field>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-white/70 transition hover:bg-white/[0.08]"
          >
            Hủy
          </button>
          <button
            type="button"
            className="rounded-2xl bg-[#dda50e] px-5 py-3 font-semibold text-white shadow-lg shadow-[#d4a017]/20 transition hover:bg-[#c8940f]"
          >
            Lưu cài đặt
          </button>
        </div>
      </section>
    </AdminLayout>
  )
}

