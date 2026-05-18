import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { normalizeRole } from '@/utils/roleRedirect'

export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const role = normalizeRole(user?.role)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4A017] border-t-transparent" />
      </div>
    )
  }

  const normalized = allowedRoles.map((r) => normalizeRole(r))
  if (!role || !normalized.includes(role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
