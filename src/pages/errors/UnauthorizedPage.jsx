import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getRoleHomePath, normalizeRole } from '@/utils/roleRedirect'

export default function UnauthorizedPage() {
  const role = useAuthStore((s) => s.role)
  const user = useAuthStore((s) => s.user)
  const homePath = getRoleHomePath(normalizeRole(role || user?.role))

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <ShieldAlert className="w-16 h-16 text-[#D4A017] mb-4" />
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Không có quyền truy cập</h1>
      <p className="text-gray-600 mb-6 max-w-md">
        Tài khoản của bạn không có quyền xem trang này. Hãy dùng đúng tài khoản (Admin /
        Chủ ngựa / Jockey) đã được cấp trên hệ thống.
      </p>
      <div className="flex gap-3">
        <Link
          to={homePath}
          className="px-6 py-3 bg-[#D4A017] text-white rounded-xl font-semibold hover:bg-[#B8941F]"
        >
          Về trang của tôi
        </Link>
        <Link
          to="/"
          className="px-6 py-3 border border-[#1E3A5F]/20 text-[#1E3A5F] rounded-xl font-semibold hover:bg-[#FFF8F0]"
        >
          Trang chủ
        </Link>
      </div>
    </div>
  )
}
