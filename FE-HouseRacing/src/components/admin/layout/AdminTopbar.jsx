import { Menu, Search } from 'lucide-react'
import RoleWalletBadge from '@/components/wallet/RoleWalletBadge'
import { WALLET_PATHS } from '@/constants/walletPaths'

export default function AdminTopbar({ onOpenMenu, displayName, avatarLetter }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#0A1628]/80 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Mở menu"
          className="rounded-lg p-2 hover:bg-white/5 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <label className="relative hidden md:block">
          <span className="sr-only">Tìm kiếm</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            placeholder="Tìm kiếm giải đấu, ngựa, jockey..."
            className="w-80 rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D4A017]/50"
          />
        </label>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <RoleWalletBadge to={WALLET_PATHS.ADMIN} walletMode="admin" theme="dark" />
        <div className="ml-2 flex items-center gap-3 border-l border-white/10 pl-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4A017] to-[#B8941F] text-sm font-bold shadow-md shadow-[#D4A017]/30">
            {avatarLetter}
          </span>
          <span className="hidden text-sm font-semibold leading-tight sm:block">
            Xin chào, {displayName}
          </span>
        </div>
      </div>
    </header>
  )
}
