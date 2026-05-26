import { useMemo, useState } from 'react'
import { BadgeCheck, Search, Shield, UserCheck, UserX, Users } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'

const userRows = [
  {
    id: 'U-101',
    name: 'Nguyễn Văn A',
    email: 'vana@hr.vn',
    role: 'Chủ ngựa',
    status: 'Đang hoạt động',
    meta: '3 ngựa · 12 giải đấu',
  },
  {
    id: 'U-102',
    name: 'Trần Minh Tú',
    email: 'tu.tm@hr.vn',
    role: 'Jockey',
    status: 'Đang hoạt động',
    meta: '24 chiến thắng',
  },
  {
    id: 'U-103',
    name: 'Phạm Hoàng',
    email: 'hoang.p@hr.vn',
    role: 'Jockey',
    status: 'Tạm khóa',
    meta: 'Win rate 65%',
  },
  {
    id: 'U-104',
    name: 'Lê Trọng Tài',
    email: 'le.tt@hr.vn',
    role: 'Trọng tài',
    status: 'Đang hoạt động',
    meta: 'FIA Cert · 8 giải',
  },
  {
    id: 'U-105',
    name: 'spectator_01',
    email: 'sp01@gmail.com',
    role: 'Khán giả',
    status: 'Đang hoạt động',
    meta: '28/30 dự đoán đúng',
  },
]

const requestRows = [
  {
    id: 'REQ-2026-014',
    user: 'Đặng Quang Huy',
    from: 'Khán giả',
    to: 'Jockey',
    status: 'Chờ duyệt',
    submittedAt: '2026-05-20 09:14',
  },
  {
    id: 'REQ-2026-013',
    user: 'Vũ Đức Mạnh',
    from: 'Khán giả',
    to: 'Chủ ngựa',
    status: 'Chờ duyệt',
    submittedAt: '2026-05-18 16:42',
  },
  {
    id: 'REQ-2026-012',
    user: 'Hồ Quốc Bảo',
    from: 'Khán giả',
    to: 'Trọng tài',
    status: 'Đã duyệt',
    submittedAt: '2026-05-15 11:08',
  },
]

function pillTone(value) {
  const tones = {
    'Chủ ngựa': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    Jockey: 'bg-[#dda50e]/15 text-[#dda50e] border-[#dda50e]/30',
    'Trọng tài': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    'Khán giả': 'bg-white/10 text-white/65 border-white/10',
    'Đang hoạt động': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'Tạm khóa': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    'Chờ duyệt': 'bg-[#dda50e]/15 text-[#dda50e] border-[#dda50e]/30',
    'Đã duyệt': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  }

  return tones[value] || 'bg-white/10 text-white/65 border-white/10'
}

export default function AdminUsersPage() {
  const [section, setSection] = useState('users')
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('Tất cả')

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi')

    return userRows.filter((item) => {
      if (role !== 'Tất cả' && item.role !== role) return false
      if (!normalized) return true
      return `${item.name} ${item.email}`.toLocaleLowerCase('vi').includes(normalized)
    })
  }, [query, role])

  return (
    <AdminLayout
      heading="Người dùng"
      highlight="Quản lý"
      subtitle="Theo dõi tài khoản và yêu cầu nâng cấp quyền trong hệ thống"
    >
      <section className="mb-8 grid gap-5 md:grid-cols-4">
        {[
          { label: 'Tổng người dùng', value: userRows.length, icon: Users, tone: 'bg-[#dda50e]/15 text-[#dda50e]' },
          { label: 'Đang hoạt động', value: userRows.filter((u) => u.status === 'Đang hoạt động').length, icon: UserCheck, tone: 'bg-emerald-500/15 text-emerald-300' },
          { label: 'Tạm khóa', value: userRows.filter((u) => u.status === 'Tạm khóa').length, icon: UserX, tone: 'bg-rose-500/15 text-rose-300' },
          { label: 'Chờ duyệt quyền', value: requestRows.filter((r) => r.status === 'Chờ duyệt').length, icon: BadgeCheck, tone: 'bg-sky-500/15 text-sky-300' },
        ].map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${item.tone}`}>
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-3xl font-bold">{item.value}</p>
              <p className="mt-2 text-sm text-white/50">{item.label}</p>
            </div>
          )
        })}
      </section>

      <section className="mb-6 flex gap-3">
        <button
          type="button"
          onClick={() => setSection('users')}
          className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            section === 'users'
              ? 'bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/30'
              : 'border border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
          }`}
        >
          Danh sách người dùng
        </button>
        <button
          type="button"
          onClick={() => setSection('requests')}
          className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
            section === 'requests'
              ? 'bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/30'
              : 'border border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
          }`}
        >
          Yêu cầu cấp quyền
        </button>
      </section>

      {section === 'users' ? (
        <>
          <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <div className="flex flex-col gap-4 lg:flex-row">
              <label className="relative flex-1">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm theo tên hoặc email..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-14 pr-4 text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/60"
                />
              </label>

              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-14 rounded-2xl border border-white/10 bg-[#162338] px-5 text-white outline-none focus:border-[#dda50e]/60 lg:w-60"
              >
                <option>Tất cả</option>
                <option>Chủ ngựa</option>
                <option>Jockey</option>
                <option>Trọng tài</option>
                <option>Khán giả</option>
              </select>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px]">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
                    <th className="px-6 py-4">Người dùng</th>
                    <th className="px-6 py-4">Vai trò</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 text-white/70 last:border-0">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-white">{item.name}</p>
                        <p className="mt-1 text-sm text-white/45">{item.email}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${pillTone(item.role)}`}>
                          {item.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${pillTone(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/50">{item.meta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px]">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
                  <th className="px-6 py-4">Mã yêu cầu</th>
                  <th className="px-6 py-4">Người dùng</th>
                  <th className="px-6 py-4">Chuyển quyền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Gửi lúc</th>
                </tr>
              </thead>
              <tbody>
                {requestRows.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 text-white/70 last:border-0">
                    <td className="px-6 py-5 font-semibold text-white">{item.id}</td>
                    <td className="px-6 py-5">{item.user}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${pillTone(item.from)}`}>
                          {item.from}
                        </span>
                        <Shield className="h-4 w-4 text-white/35" />
                        <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${pillTone(item.to)}`}>
                          {item.to}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${pillTone(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-white/50">{item.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AdminLayout>
  )
}
