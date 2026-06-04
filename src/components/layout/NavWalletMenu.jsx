import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Wallet } from 'lucide-react'
import { ROLE_LABELS } from '@/constants/roleApplication'
import { walletService } from '@/services/walletService'
import { fmtVND } from '@/utils/formatCurrency'
import { normalizeRole } from '@/utils/roleRedirect'

const ROLE_WALLET_PATH = {
  ADMIN: '/admin',
  OWNER: '/horse-owner',
  JOCKEY: '/jockey',
  REFEREE: '/referee',
}

export default function NavWalletMenu({ userRole }) {
  const [open, setOpen] = useState(false)
  const [balance, setBalance] = useState(null)
  const ref = useRef(null)
  const role = normalizeRole(userRole)
  const hasRoleWallet = role && role !== 'USER' && ROLE_WALLET_PATH[role]

  useEffect(() => {
    walletService
      .getMyWallet()
      .then((w) => setBalance(w?.availableBalance ?? w?.totalBalance ?? 0))
      .catch(() => setBalance(null))
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl text-[#1E3A5F] border border-[#1E3A5F]/20 hover:border-[#D4A017] hover:bg-[#FFF8F0] transition-all flex items-center gap-2"
        title="Ví của tôi"
      >
        <Wallet className="w-5 h-5 text-[#D4A017]" />
        {balance != null && (
          <span className="text-sm font-bold text-[#D4A017] hidden sm:inline">{fmtVND(balance)}</span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 bg-gradient-to-r from-[#D4A017]/10 to-transparent border-b border-gray-200">
            <div className="font-bold text-[#1E3A5F] flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#D4A017]" />
              Ví của tôi
            </div>
            <div className="text-xs text-[#1E3A5F]/60 mt-0.5">Quản lý dòng tiền theo vai trò</div>
          </div>

          {!hasRoleWallet ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <span className="text-sm text-[#1E3A5F]/70">Số dư ví</span>
                <span className="text-[#D4A017] font-bold">{fmtVND(balance ?? 0)}</span>
              </div>
              <p className="text-sm text-[#1E3A5F]/70 mb-3">
                Bạn chưa được cấp quyền vai trò. Hãy xin cấp phép tại hồ sơ để mở ví theo vai trò.
              </p>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block w-full py-2.5 text-center bg-[#D4A017] text-white rounded-lg font-semibold hover:bg-[#B8941F] transition-all"
              >
                Xin cấp phép vai trò
              </Link>
            </div>
          ) : (
            <div className="p-4" onClick={() => setOpen(false)}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-[#1E3A5F]">
                    Ví {ROLE_LABELS[role] || role}
                  </div>
                  <div className="text-xs text-[#1E3A5F]/60">Số dư khả dụng</div>
                </div>
                <div className="text-[#D4A017] font-bold">{fmtVND(balance ?? 0)}</div>
              </div>
              <Link
                to={ROLE_WALLET_PATH[role]}
                className="block w-full py-2 text-center text-sm font-semibold text-[#D4A017] hover:underline"
              >
                Xem chi tiết →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
