import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit2,
  Mail,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import RoleRequestModal from '@/components/profile/RoleRequestModal'
import {
  ROLE_DESCRIPTIONS,
  ROLE_ICONS,
  ROLE_KEYS,
  ROLE_LABELS,
} from '@/constants/roleApplication'
import { submitRoleApplication } from '@/utils/roleApplicationSubmit'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/utils/apiError'
import {
  canSubmitRoleRequest,
  getRoleCardStatus,
  hasPendingOtherRole,
} from '@/utils/roleApplicationStatus'
import { getRoleHomePath, hasApprovedRole, normalizeRole } from '@/utils/roleRedirect'
import { formatDisplayDate } from '@/utils/dateFormat'

function formatJoinDate(createdAt) {
  return formatDisplayDate(createdAt, formatDisplayDate(new Date()))
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const fetchProfile = useAuthStore((s) => s.fetchProfile)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const welcome = location.state?.welcome || searchParams.get('welcome') === '1'
  const initialTab = searchParams.get('tab') === 'info' ? 'info' : 'roles'
  const [activeTab, setActiveTab] = useState(initialTab)
  const [openRole, setOpenRole] = useState(null)

  useEffect(() => {
    if (isAuthenticated) fetchProfile().catch(() => {})
  }, [isAuthenticated, fetchProfile])

  useEffect(() => {
    if (!isAuthenticated || !user || !location.pathname.startsWith('/profile')) return

    if (hasApprovedRole(user)) {
      navigate(getRoleHomePath(normalizeRole(user.role)), { replace: true })
      return
    }

    if (user.roleApprovalStatus !== 'PENDING') return

    const syncApproval = async () => {
      try {
        const fresh = await fetchProfile()
        if (hasApprovedRole(fresh)) {
          const role = normalizeRole(fresh.role)
          toast.success(`Yêu cầu đã được duyệt! Chào mừng ${ROLE_LABELS[role] || role}.`)
          navigate(getRoleHomePath(role), { replace: true })
        }
      } catch {
        return
      }
    }

    const interval = setInterval(syncApproval, 8000)
    const onFocus = () => syncApproval()
    window.addEventListener('focus', onFocus)
    syncApproval()

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [isAuthenticated, user, fetchProfile, navigate, location.pathname])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/profile' }} />
  }

  const displayName = user?.fullName || user?.username || 'Bạn'
  const avatarLetter = displayName.charAt(0).toUpperCase()
  const approvedRole = normalizeRole(user?.role)
  const isBasicUser = approvedRole === 'USER' || !approvedRole

  const handleRoleSubmit = async (role, payload) => {
    try {
      await submitRoleApplication(role, payload)
      await fetchProfile()
      toast.success(
        `Đã gửi hồ sơ ${ROLE_LABELS[role]}. Hồ sơ đang chờ quản trị viên duyệt.`,
      )
      setOpenRole(null)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
      throw err
    }
  }

  const dismissWelcome = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('welcome')
      return next
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
      <section className="relative pt-12 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4A017]/10 to-[#1E3A5F]/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {welcome && (
            <div className="mb-6 rounded-2xl border border-[#D4A017]/30 bg-white/90 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
              <div>
                <p className="text-lg font-bold text-[#1E3A5F]">Xin chào {displayName}!</p>
                <p className="text-[#1E3A5F]/70 text-sm mt-1">
                  Đăng ký thành công. Chọn vai trò bên dưới và gửi yêu cầu cấp quyền.
                </p>
              </div>
              <button
                type="button"
                onClick={dismissWelcome}
                className="text-sm font-semibold text-[#D4A017] hover:underline shrink-0"
              >
                Đã hiểu
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-[#D4A017] to-[#F5E6C8] rounded-2xl flex items-center justify-center text-white shadow-xl">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span className="text-5xl font-bold">{avatarLetter}</span>
                  )}
                </div>
                <button
                  type="button"
                  title="Chỉnh sửa ảnh đại diện"
                  className="absolute bottom-0 right-0 w-10 h-10 bg-[#D4A017] rounded-full flex items-center justify-center text-white hover:bg-[#B8941F] transition-all shadow-lg"
                  onClick={() => toast.info('Tính năng đổi ảnh đại diện sẽ cập nhật sau')}
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 text-center md:text-left min-w-0">
                <h1 className="text-4xl font-bold text-[#1E3A5F] mb-2 truncate">{displayName}</h1>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {isBasicUser ? (
                    <span className="px-3 py-1 bg-gray-100 text-[#1E3A5F]/70 rounded-full text-sm font-medium">
                      Người dùng (chưa có vai trò)
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-[#D4A017]/15 text-[#B8941F] rounded-full text-sm font-semibold">
                      {ROLE_LABELS[approvedRole] || approvedRole}
                    </span>
                  )}
                  {user?.roleApprovalStatus === 'PENDING' && user?.pendingRole && (
                    <span className="px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
                      Đang chờ duyệt: {ROLE_LABELS[normalizeRole(user.pendingRole)]}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center justify-center md:justify-start gap-3 text-[#1E3A5F]/70">
                    <Mail className="w-5 h-5 text-[#D4A017] shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-3 text-[#1E3A5F]/70">
                    <Calendar className="w-5 h-5 text-[#D4A017] shrink-0" />
                    <span>Tham gia: {formatJoinDate(user?.createdAt)}</span>
                  </div>
                </div>
              </div>

              <Link
                to="/"
                className="shrink-0 px-6 py-3 bg-[#FAFAFA] text-[#1E3A5F] border border-gray-200 rounded-xl hover:border-[#D4A017] transition-all font-semibold"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 mb-8 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'roles'
                  ? 'border-[#D4A017] text-[#D4A017]'
                  : 'border-transparent text-[#1E3A5F]/60 hover:text-[#1E3A5F]'
              }`}
            >
              Xin cấp phép vai trò
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'info'
                  ? 'border-[#D4A017] text-[#D4A017]'
                  : 'border-transparent text-[#1E3A5F]/60 hover:text-[#1E3A5F]'
              }`}
            >
              Thông tin tài khoản
            </button>
          </div>

          {activeTab === 'roles' && (
            <div>
              <div className="bg-gradient-to-r from-[#D4A017]/10 to-transparent border border-[#D4A017]/20 rounded-2xl p-6 mb-8">
                <div className="flex items-start gap-4">
                  <ShieldCheck className="w-8 h-8 text-[#D4A017] flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-1">
                      Yêu cầu cấp quyền vai trò
                    </h3>
                    <p className="text-[#1E3A5F]/70">
                      Tài khoản của bạn đang ở chế độ người dùng cơ bản. Hãy gửi yêu cầu để được
                      quản trị viên cấp quyền sử dụng các chức năng chuyên biệt.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ROLE_KEYS.map((role) => {
                  const status = getRoleCardStatus(role, user)
                  const Icon = ROLE_ICONS[role]
                  const blocked = hasPendingOtherRole(user, role)
                  const canRequest = canSubmitRoleRequest(user) && !blocked

                  return (
                    <div
                      key={role}
                      className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#D4A017] transition-all hover:shadow-lg flex flex-col"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#D4A017] to-[#F5E6C8] rounded-xl flex items-center justify-center text-white shadow">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-bold text-[#1E3A5F]">{ROLE_LABELS[role]}</h4>
                      </div>
                      <p className="text-[#1E3A5F]/70 mb-6 flex-1">{ROLE_DESCRIPTIONS[role]}</p>

                      {status === 'none' && (
                        <button
                          type="button"
                          disabled={!canRequest}
                          onClick={() => setOpenRole(role)}
                          className="w-full py-3 bg-[#D4A017] text-white rounded-xl hover:bg-[#B8941F] transition-all font-semibold shadow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {blocked
                            ? 'Đang chờ duyệt vai trò khác'
                            : !canSubmitRoleRequest(user)
                              ? 'Đã có vai trò được duyệt'
                              : 'Gửi yêu cầu cấp quyền'}
                        </button>
                      )}
                      {status === 'pending' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 py-3 bg-yellow-50 text-yellow-700 rounded-xl font-semibold border border-yellow-200">
                            <Clock className="w-5 h-5" />
                            Đang chờ duyệt
                          </div>
                        </div>
                      )}
                      {status === 'approved' && (
                        <div className="flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 rounded-xl font-semibold border border-green-200">
                          <CheckCircle2 className="w-5 h-5" />
                          Đã được cấp quyền
                        </div>
                      )}
                      {status === 'rejected' && (
                        <div className="space-y-2">
                          {user?.roleReviewReason && (
                            <p className="text-xs text-red-600 text-center px-2">
                              Lý do: {user.roleReviewReason}
                            </p>
                          )}
                          <button
                            type="button"
                            disabled={!canRequest}
                            onClick={() => setOpenRole(role)}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 rounded-xl font-semibold border border-red-200 hover:bg-red-100 disabled:opacity-50"
                          >
                            <XCircle className="w-5 h-5" />
                            Bị từ chối - Gửi lại
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-6">Thông tin tài khoản</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <dt className="text-sm text-[#1E3A5F]/60 mb-1">Họ và tên</dt>
                  <dd className="text-[#1E3A5F] font-semibold">{displayName}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#1E3A5F]/60 mb-1">Email</dt>
                  <dd className="text-[#1E3A5F] font-semibold">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#1E3A5F]/60 mb-1">Ngày tham gia</dt>
                  <dd className="text-[#1E3A5F] font-semibold">{formatJoinDate(user?.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#1E3A5F]/60 mb-1">Vai trò đã được duyệt</dt>
                  <dd className="text-[#1E3A5F] font-semibold">
                    {isBasicUser ? 'Chưa có' : ROLE_LABELS[approvedRole] || approvedRole}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </section>

      {openRole && (
        <RoleRequestModal
          role={openRole}
          fullName={displayName}
          onClose={() => setOpenRole(null)}
          onSubmit={(payload) => handleRoleSubmit(openRole, payload)}
        />
      )}
    </div>
  )
}
