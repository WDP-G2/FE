import { Link, useLocation } from 'react-router-dom'
import { ADMIN_NAV } from '@/constants/adminNav'

export default function AdminSidebarNav({ onNavigate }) {
  const location = useLocation()

  const isActive = (to) =>
    to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to)

  return (
    <nav aria-label="Điều hướng quản trị" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {ADMIN_NAV.map((item) => {
        const Icon = item.icon
        const active = isActive(item.to)

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 text-sm transition-all ${
              active
                ? 'border-[#D4A017]/30 bg-[#D4A017]/15 text-white shadow-md shadow-[#D4A017]/10'
                : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#D4A017]' : ''}`} />
            <span className="min-w-0 flex-1 truncate font-semibold">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
