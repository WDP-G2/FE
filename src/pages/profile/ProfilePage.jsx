import { useAuthStore } from '@/store/authStore'

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#1E3A5F] mb-6">Hồ sơ</h1>
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-3">
        <p>
          <span className="text-gray-500">Họ tên:</span>{' '}
          <span className="font-medium">{user?.fullName || user?.username}</span>
        </p>
        <p>
          <span className="text-gray-500">Email:</span>{' '}
          <span className="font-medium">{user?.email}</span>
        </p>
        <p>
          <span className="text-gray-500">Vai trò:</span>{' '}
          <span className="font-medium">{user?.role}</span>
        </p>
      </div>
    </div>
  )
}
