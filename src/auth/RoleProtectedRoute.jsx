import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { normalizeRole } from '@/utils/roleRedirect'

export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const user = useAuthStore((s) => s.user)
  const role = useAuthStore((s) => s.role)
  const isLoading = useAuthStore((s) => s.isLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4A017] border-t-transparent" />
      </div>
    )
  }

  const currentRole = normalizeRole(role || user?.role)
  const normalized = allowedRoles.map((r) => normalizeRole(r))

  if (!currentRole || !normalized.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
