import { useState } from 'react'
import { Mail, X } from 'lucide-react'
import { toast } from 'sonner'
import { GhostButton, PrimaryButton } from '@/components/admin/ui/AdminButton'
import { inputClass } from '@/components/admin/ui/styles'

export default function InviteUserModal({ open, onClose }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Khán giả')

  if (!open) return null

  const submit = (event) => {
    event.preventDefault()
    if (!email.trim()) {
      toast.error('Vui lòng nhập email')
      return
    }
    toast.success(`Đã gửi lời mời tới ${email.trim()}`)
    setEmail('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-user-title"
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111f3b] p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dda50e]/15 text-[#dda50e]">
              <Mail className="h-5 w-5" />
            </span>
            <div>
              <h2 id="invite-user-title" className="text-lg font-bold">
                Mời người dùng
              </h2>
              <p className="text-sm text-white/50">Gửi lời mời tham gia hệ thống</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">
              Vai trò mặc định
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={`${inputClass} bg-[#162338]`}
            >
              <option>Khán giả</option>
              <option>Chủ ngựa</option>
              <option>Jockey</option>
              <option>Trọng tài</option>
            </select>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <GhostButton type="button" onClick={onClose}>
              Hủy
            </GhostButton>
            <PrimaryButton type="submit">Gửi lời mời</PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  )
}
