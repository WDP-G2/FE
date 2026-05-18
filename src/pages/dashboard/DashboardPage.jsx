import { useAuthStore } from '@/store/authStore'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Dashboard</h1>
      <p className="text-gray-600">
        Xin chào, <span className="font-semibold">{user?.fullName || user?.email}</span>
      </p>
    </div>
  )
}
