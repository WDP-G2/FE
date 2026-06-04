import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Flag,
  ClipboardCheck,
  History,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Menu,
  X,
  Mail,
  Gavel,
  Wallet,
} from 'lucide-react'
import RoleWalletBadge from '@/components/wallet/RoleWalletBadge'
import { WALLET_PATHS } from '@/constants/walletPaths'
import { useAuthStore } from '@/store/authStore'

export const REFEREE_NAV = [
  { label: 'Tổng quan', to: '/referee', icon: LayoutDashboard },
  { label: 'Cuộc đua được giao', to: '/referee/races', icon: Flag },
  { label: 'Vi phạm đã ghi', to: '/referee/violations', icon: ClipboardCheck },
  { label: 'Lịch sử', to: '/referee/history', icon: History },
  { label: 'Ví của tôi', to: '/referee/wallet', icon: Wallet },
  { label: 'Thông báo', to: '/referee/notifications', icon: Bell },
]

export function RefereeLayout({ children, title, subtitle, actions }) {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)

  const displayName = user?.fullName || user?.username || 'Trọng tài'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isActive = (to) =>
    to === '/referee' ? location.pathname === '/referee' : location.pathname.startsWith(to)

  const [head, tail] = title.includes('·')
    ? title.split('·').map((s) => s.trim())
    : [title, '']

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0F1E3A]/95 backdrop-blur-xl border-r border-white/10 transition-transform ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <div className="w-9 h-9 bg-gradient-to-br from-[#D4A017] to-[#B8941F] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4A017]/30">
            <Gavel className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight">Horse Racing</div>
            <div className="text-[10px] text-[#D4A017] uppercase tracking-wider font-semibold">
              Referee Console
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>
          {REFEREE_NAV.map((item) => {
            const Icon = item.icon
            const active = isActive(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? 'bg-[#D4A017]/15 text-white border border-[#D4A017]/30 shadow-md shadow-[#D4A017]/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#D4A017]' : ''}`} />
                <span className="font-semibold">{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="font-semibold">Đăng xuất</span>
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-[#0A1628]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Tìm cuộc đua, ngựa, jockey..."
                className="pl-10 pr-4 py-2 w-80 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4A017]/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RoleWalletBadge to={WALLET_PATHS.REFEREE} walletMode="user" theme="dark" />
            <button type="button" className="p-2 hover:bg-white/5 rounded-lg relative">
              <Mail className="w-5 h-5 text-white/60" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#D4A017] rounded-full" />
            </button>
            <Link to="/referee/notifications" className="p-2 hover:bg-white/5 rounded-lg relative">
              <Bell className="w-5 h-5 text-white/60" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full" />
            </Link>
            <div className="flex items-center gap-2 pl-2 ml-2 border-l border-white/10">
              <div className="w-9 h-9 bg-gradient-to-br from-[#D4A017] to-[#B8941F] rounded-xl flex items-center justify-center font-bold shadow-md shadow-[#D4A017]/30">
                {avatarLetter}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold leading-tight">{displayName}</div>
                <div className="text-[10px] text-white/40">Trọng tài</div>
              </div>
              <ChevronDown className="w-4 h-4 text-white/40" />
            </div>
          </div>
        </header>

        <div className="px-4 md:px-8 pt-6 pb-2 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="text-white">{head}</span>
              {tail && (
                <>
                  {' '}
                  <span className="text-white/30">·</span>{' '}
                  <span className="bg-gradient-to-r from-[#D4A017] to-[#E5B82F] bg-clip-text text-transparent">
                    {tail}
                  </span>
                </>
              )}
            </h1>
            {subtitle && <p className="text-sm text-white/50 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>

        <main className="px-4 md:px-8 py-6">{children}</main>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <button type="button" className="absolute top-4 right-4 p-2 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
