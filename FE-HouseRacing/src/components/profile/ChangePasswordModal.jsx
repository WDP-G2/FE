import { useState } from 'react'
import { Eye, EyeOff, Lock, X } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import { getApiErrorMessage } from '@/utils/apiError'
import { GhostButton, PrimaryButton } from '@/pages/admin/AdminLayout'

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  show,
  onToggle,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-white">{label}</label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-white/10 bg-[#0A1628] py-3 pl-11 pr-11 text-sm text-white placeholder-white/30 outline-none transition focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/40 transition hover:text-white"
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

function isStrongPassword(password) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  )
}

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [visibility, setVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  })
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const resetForm = () => {
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setVisibility({ current: false, next: false, confirm: false })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isStrongPassword(form.newPassword)) {
      toast.error('Mật khẩu mới phải có tối thiểu 8 ký tự, 1 chữ hoa và 1 số')
      return
    }
    if (form.newPassword === form.currentPassword) {
      toast.error('Mật khẩu mới phải khác mật khẩu hiện tại')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    setSaving(true)
    try {
      await authService.updatePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      })
      toast.success('Đổi mật khẩu thành công')
      handleClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0F1E3A] shadow-2xl">
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/10 text-[#D4A017]">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Đổi mật khẩu</h2>
              <p className="text-sm text-white/50">Bảo vệ tài khoản của bạn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <PasswordField
            label="Mật khẩu hiện tại"
            value={form.currentPassword}
            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            show={visibility.current}
            onToggle={() => setVisibility((v) => ({ ...v, current: !v.current }))}
            autoComplete="current-password"
          />

          <PasswordField
            label="Mật khẩu mới"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            placeholder="Tối thiểu 8 ký tự, có chữ hoa và số"
            show={visibility.next}
            onToggle={() => setVisibility((v) => ({ ...v, next: !v.next }))}
            autoComplete="new-password"
          />

          <PasswordField
            label="Xác nhận mật khẩu mới"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            placeholder="Nhập lại mật khẩu mới"
            show={visibility.confirm}
            onToggle={() => setVisibility((v) => ({ ...v, confirm: !v.confirm }))}
            autoComplete="new-password"
          />

          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed text-white/70">
            <span className="font-semibold text-[#D4A017]">Yêu cầu mật khẩu:</span>{' '}
            tối thiểu 8 ký tự, có ít nhất 1 chữ hoa và 1 số, khác mật khẩu hiện tại.
          </div>

          <div className="flex gap-3 border-t border-white/10 pt-5">
            <GhostButton type="button" onClick={handleClose} className="flex-1">
              Hủy
            </GhostButton>
            <PrimaryButton type="submit" disabled={saving} className="flex-1">
              {saving ? 'Đang xử lý...' : 'Xác nhận'}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
