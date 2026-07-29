import { LogOut } from 'lucide-react'

export default function AdminSidebarLogout({ onLogout }) {
  return (
    <div className="shrink-0 border-t border-white/10 p-3 pb-4">
      <button
        type="button"
        onClick={onLogout}
        className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-transparent px-3 text-sm font-semibold text-white/60 transition-all hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left">Đăng xuất</span>
      </button>
    </div>
  )
}
