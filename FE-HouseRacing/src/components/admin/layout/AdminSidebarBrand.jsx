import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'

export default function AdminSidebarBrand({ onNavigate }) {
  return (
    <Link
      to="/admin"
      onClick={onNavigate}
      className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A017] to-[#B8941F] shadow-lg shadow-[#D4A017]/30">
        <Trophy className="h-5 w-5 text-white" />
      </span>
      <span>
        <span className="block text-sm font-bold leading-tight text-white">Horse Racing</span>
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#D4A017]">
          Admin Console
        </span>
      </span>
    </Link>
  )
}
