import { Link } from 'react-router-dom'
import { ChevronDown, Wallet } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getWalletPath } from '@/constants/walletPaths'
import { fmtVND } from '@/utils/formatCurrency'
import { walletService } from '@/services/walletService'
import { normalizeRole } from '@/utils/roleRedirect'
import { ROLE_LABELS } from '@/constants/roleApplication'

export default function NavWalletMenu({ userRole }) {
  const [open, setOpen] = useState(false)
  const [balance, setBalance] = useState(null)
  const ref = useRef(null)
  const role = normalizeRole(userRole)
  const walletPath = getWalletPath(role)
  const isAdmin = role === 'ADMIN'

  useEffect(() => {
    const load = isAdmin ? walletService.getAdminWallet : walletService.getMyWallet
    load()
      .then((w) => setBalance(w?.availableBalance ?? w?.totalBalance ?? 0))
      .catch(() => setBalance(0))
  }, [isAdmin])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (role === 'USER' || !role) {
    return (
      <Link
        to="/profile"
        className="flex items-center gap-2 p-2.5 rounded-xl text-[#1E3A5F] border border-[#1E3A5F]/20 hover:border-[#D4A017] hover:bg-[#FFF8F0] transition-all"
        title="Xin cấp quyền để mở ví"
      >
        <Wallet className="w-5 h-5 text-[#D4A017]" />
        <span className="text-sm font-bold text-[#D4A017] hidden sm:inline">ví</span>
      </Link>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2.5 rounded-xl text-[#1E3A5F] border border-[#1E3A5F]/20 hover:border-[#D4A017] hover:bg-[#FFF8F0] transition-all"
        title="Ví của tôi"
      >
        <Wallet className="w-5 h-5 text-[#D4A017]" />
        <span className="text-sm font-bold text-[#D4A017] whitespace-nowrap hidden sm:inline">
          <span className="font-normal text-[#1E3A5F]/50 mr-1">ví</span>
          {fmtVND(balance ?? 0)}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 bg-gradient-to-r from-[#D4A017]/10 to-transparent border-b border-gray-200">
            <div className="font-bold text-[#1E3A5F] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#D4A017]" />
              Ví của tôi
            </div>
            <div className="text-xs text-[#1E3A5F]/60 mt-0.5">
              {ROLE_LABELS[role] || role}
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#1E3A5F]/70">Số dư</span>
              <span className="text-[#D4A017] font-bold">{fmtVND(balance ?? 0)}</span>
            </div>
            <Link
              to={walletPath}
              onClick={() => setOpen(false)}
              className="block w-full py-2.5 text-center bg-[#D4A017] text-white rounded-lg font-semibold hover:bg-[#B8941F]"
            >
              Mở trang ví →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
