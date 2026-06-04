import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { fmtVND } from '@/utils/formatCurrency'
import { walletService } from '@/services/walletService'

/**
 * Badge ví trên header layout (dark theme) — khớp Figma: "ví 250.000.000đ"
 * @param {'admin' | 'user'} walletMode
 */
export default function RoleWalletBadge({ to, walletMode = 'user', theme = 'dark' }) {
  const [balance, setBalance] = useState(null)

  useEffect(() => {
    const load = walletMode === 'admin' ? walletService.getAdminWallet : walletService.getMyWallet
    load()
      .then((w) => setBalance(w?.availableBalance ?? w?.totalBalance ?? 0))
      .catch(() => setBalance(0))
  }, [walletMode])

  const isDark = theme === 'dark'

  return (
    <Link
      to={to}
      title="Mở ví"
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
          : 'bg-[#FFF8F0] hover:bg-[#FFF1DC] border-[#D4A017]/30 text-[#1E3A5F]'
      }`}
    >
      <Wallet className="w-4 h-4 text-[#D4A017] shrink-0" />
      <span className="text-sm font-bold text-[#D4A017] whitespace-nowrap">
        <span className={`font-normal mr-1 ${isDark ? 'text-white/50' : 'text-[#1E3A5F]/50'}`}>
          ví
        </span>
        {fmtVND(balance ?? 0)}
      </span>
    </Link>
  )
}
