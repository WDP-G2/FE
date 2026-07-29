import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { tournamentService } from '@/services/tournamentService'
import { horseService } from '@/services/horseService'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'
import AdminTopbar from '@/components/admin/layout/AdminTopbar'
import AdminPageHeader from '@/components/admin/layout/AdminPageHeader'
import AdminMobileOverlay from '@/components/admin/layout/AdminMobileOverlay'

export default function AdminLayout({
  children,
  action,
  heading = 'Tổng quan',
  highlight = 'Bảng điều khiển',
  subtitle = 'Thống kê hệ thống quản lý giải đua ngựa',
  showPageHeader = true,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const displayName = user?.fullName || user?.username || 'Admin'
  const avatarLetter = displayName.charAt(0).toUpperCase()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    tournamentService.getAdminTournaments().catch(() => {})
    horseService.getAllAdminHorses().catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { state: { from: location }, replace: true })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0A1628] font-sans text-white">
      <AdminSidebar open={open} onClose={() => setOpen(false)} onLogout={handleLogout} />
      <AdminMobileOverlay open={open} onClose={() => setOpen(false)} />

      <div className="min-w-0 lg:pl-64">
        <AdminTopbar
          onOpenMenu={() => setOpen(true)}
          displayName={displayName}
          avatarLetter={avatarLetter}
        />

        <main className={`min-w-0 overflow-x-hidden px-4 pb-10 md:px-8 ${showPageHeader ? '' : 'pt-0'}`}>
          {showPageHeader ? (
            <AdminPageHeader
              heading={heading}
              highlight={highlight}
              subtitle={subtitle}
              action={action}
            />
          ) : null}
          {children}
        </main>
      </div>
    </div>
  )
}
