import { useEffect, useMemo, useState } from 'react'
import { BadgeCheck, RefreshCw, Search, Shield, UserCheck, UserX, Users } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/AdminLayout'
import InviteUserModal from '@/components/InviteUserModal'
import { PrimaryButton } from '@/components/ui/AdminButton'
import { adminUserService, ROLE_VALUES } from '@/services/adminUserService'
import { getApiErrorMessage } from '@/utils/apiError'

function pillTone(value) {
  const tones = {
    'Chủ ngựa': 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    Jockey: 'bg-[#dda50e]/15 text-[#dda50e] border-[#dda50e]/30',
    'Trọng tài': 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    'Khán giả': 'bg-white/10 text-white/65 border-white/10',
    'Người dùng': 'bg-white/10 text-white/65 border-white/10',
    Admin: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    'Đang hoạt động': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'Tạm khóa': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    'Chờ duyệt': 'bg-[#dda50e]/15 text-[#dda50e] border-[#dda50e]/30',
    'Đã duyệt': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    'Từ chối': 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  }

  return tones[value] || 'bg-white/10 text-white/65 border-white/10'
}

export default function AdminUsersPage() {
  const [section, setSection] = useState('users')
  const [query, setQuery] = useState('')
  const [role, setRole] = useState('ALL')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminUserService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Không thể tải danh sách người dùng', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const loadRequests = async () => {
    try {
      setRequestsLoading(true)
      const data = await adminUserService.getRoleApplications()
      setRequests(data)
    } catch (error) {
      console.error('Không thể tải yêu cầu cấp quyền', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể tải yêu cầu cấp quyền')
    } finally {
      setRequestsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    loadRequests()
  }, [])

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi')

    return users.filter((item) => {
      if (role !== 'ALL' && item.roleCode !== role) return false
      if (!normalized) return true
      return `${item.name} ${item.username} ${item.email}`.toLocaleLowerCase('vi').includes(normalized)
    })
  }, [query, role, users])

  const stats = useMemo(
    () => [
      { label: 'Tổng người dùng', value: users.length, icon: Users, tone: 'bg-[#dda50e]/15 text-[#dda50e]' },
      {
        label: 'Đang hoạt động',
        value: users.filter((user) => user.active).length,
        icon: UserCheck,
        tone: 'bg-emerald-500/15 text-emerald-300',
      },
      {
        label: 'Tạm khóa',
        value: users.filter((user) => !user.active).length,
        icon: UserX,
        tone: 'bg-rose-500/15 text-rose-300',
      },
      {
        label: 'Chờ duyệt quyền',
        value: requests.filter((request) => request.statusCode === 'PENDING').length,
        icon: BadgeCheck,
        tone: 'bg-sky-500/15 text-sky-300',
      },
    ],
    [requests, users],
  )

  return (
    <AdminLayout
      heading="Người dùng"
      highlight="Quản lý"
      subtitle="Chủ ngựa, jockey, trọng tài, khán giả và yêu cầu cấp quyền"
      action={
        <PrimaryButton icon={UserCheck} onClick={() => setInviteOpen(true)}>
          Mời người dùng
        </PrimaryButton>
      }
    >
      <InviteUserModal open={inviteOpen} onClose={() => setInviteOpen(false)} />

      <section className="mb-8 grid gap-5 md:grid-cols-4">
        {stats.map((item) => {
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

      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
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
        </div>

        <button
          type="button"
          onClick={() => {
            loadUsers()
            loadRequests()
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/65 transition hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
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
                  placeholder="Tìm theo tên, username hoặc email..."
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-14 pr-4 text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/60"
                />
              </label>

              <select
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="h-14 rounded-2xl border border-white/10 bg-[#162338] px-5 text-white outline-none focus:border-[#dda50e]/60 lg:w-60"
              >
                <option value="ALL">Tất cả</option>
                {ROLE_VALUES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
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
                  {loading ? (
                    <tr>
                      <td className="px-6 py-10 text-center text-white/50" colSpan={4}>
                        Đang tải danh sách người dùng...
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((item) => (
                      <tr key={item.id} className="border-b border-white/5 text-white/70 last:border-0">
                        <td className="px-6 py-5">
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-sm text-white/45">{item.email || item.username}</p>
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
                    ))
                  ) : (
                    <tr>
                      <td className="px-6 py-10 text-center text-white/50" colSpan={4}>
                        Không tìm thấy người dùng nào
                      </td>
                    </tr>
                  )}
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
                {requestsLoading ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-white/50" colSpan={5}>
                      Đang tải yêu cầu cấp quyền...
                    </td>
                  </tr>
                ) : requests.length > 0 ? (
                  requests.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 text-white/70 last:border-0">
                      <td className="px-6 py-5 font-semibold text-white">REQ-{item.id}</td>
                      <td className="px-6 py-5">
                        <p>{item.user}</p>
                        {item.username && <p className="mt-1 text-xs text-white/40">@{item.username}</p>}
                      </td>
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
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-10 text-center text-white/50" colSpan={5}>
                      Chưa có yêu cầu cấp quyền
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </AdminLayout>
  )
}
