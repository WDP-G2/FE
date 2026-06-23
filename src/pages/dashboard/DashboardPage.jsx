import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { normalizeRole } from '@/utils/roleRedirect'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const role = normalizeRole(user?.role)

  if (role === 'SPECTATOR') {
    return <Navigate to="/spectator/dashboard" replace />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Dashboard</h1>
      <p className="text-gray-600">
        Xin chao, <span className="font-semibold">{user?.fullName || user?.email}</span>
      </p>
    </div>
  )
}
