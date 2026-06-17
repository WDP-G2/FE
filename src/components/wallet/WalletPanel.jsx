import { useCallback, useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  Smartphone,
  Wallet,
  Eye,
  EyeOff,
  CreditCard,
  Award,
  Coins,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { walletService } from '@/services/walletService'
import { fmtVND } from '@/utils/formatCurrency'
import { getApiErrorMessage } from '@/utils/apiError'

const PRESETS = [100_000, 500_000, 1_000_000, 5_000_000, 10_000_000]
const PROVIDER = 'ZALOPAY'

const TX_LABELS = {
  DEPOSIT: { label: 'Nạp tiền', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  WITHDRAW: { label: 'Rút tiền', color: 'text-red-600', bg: 'bg-red-50' },
  ADMIN_WITHDRAW: { label: 'Rút quỹ', color: 'text-red-600', bg: 'bg-red-50' },
  ENTRY_FEE: { label: 'Phí đăng ký', color: 'text-orange-600', bg: 'bg-orange-50' },
  LATE_CHECK_IN_FEE: { label: 'Phí check-in muộn', color: 'text-orange-600', bg: 'bg-orange-50' },
  JOCKEY_HIRE: { label: 'Thuê jockey', color: 'text-orange-600', bg: 'bg-orange-50' },
  JOCKEY_PAYOUT: { label: 'Thanh toán jockey', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  JOCKEY_HIRE_TAX: { label: 'Thuế thuê jockey', color: 'text-orange-600', bg: 'bg-orange-50' },
  BET_STAKE: { label: 'Tiền cược', color: 'text-orange-600', bg: 'bg-orange-50' },
  BET_PAYOUT: { label: 'Thưởng cược', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  PRIZE_PAYOUT: { label: 'Tiền thưởng', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ITEM_PURCHASE: { label: 'Mua vật phẩm', color: 'text-orange-600', bg: 'bg-orange-50' },
  ITEM_SALE: { label: 'Bán vật phẩm', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  REFUND: { label: 'Hoàn tiền', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ADJUSTMENT: { label: 'Điều chỉnh', color: 'text-[#1E3A5F]', bg: 'bg-gray-50' },
}

const TX_ICONS = {
  DEPOSIT: Coins,
  WITHDRAW: CreditCard,
  ADMIN_WITHDRAW: CreditCard,
  ENTRY_FEE: Wallet,
  LATE_CHECK_IN_FEE: Wallet,
  JOCKEY_HIRE: Wallet,
  JOCKEY_PAYOUT: Coins,
  JOCKEY_HIRE_TAX: Wallet,
  BET_STAKE: Wallet,
  BET_PAYOUT: Award,
  PRIZE_PAYOUT: Award,
  ITEM_PURCHASE: Wallet,
  ITEM_SALE: Coins,
  REFUND: Coins,
  ADJUSTMENT: HelpCircle,
}

const DIRECTION_LABELS = {
  CREDIT: 'Cộng tiền',
  DEBIT: 'Trừ tiền',
  HOLD: 'Tạm giữ',
  RELEASE: 'Hoàn giữ',
  CAPTURE: 'Tất toán giữ',
}

const STATUS_LABELS = {
  PENDING: 'Đang chờ',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  REVERSED: 'Đã đảo',
}

const WALLET_STATUS_LABELS = {
  ACTIVE: 'Hoạt động',
  SUSPENDED: 'Tạm khóa',
  CLOSED: 'Đã đóng',
}

function formatTxTime(createdAt) {
  if (!createdAt) return '—'
  try {
    return new Date(createdAt).toLocaleString('vi-VN')
  } catch {
    return String(createdAt)
  }
}

function toNumber(value) {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function isPositiveDirection(direction) {
  return direction === 'CREDIT' || direction === 'RELEASE'
}

function mapTransaction(tx) {
  const direction = tx?.direction
  const amount = toNumber(tx?.amount)
  const isCredit = isPositiveDirection(direction)
  return {
    id: tx.id,
    type: tx.type,
    direction,
    amount,
    signedAmount: isCredit ? amount : -amount,
    isCredit,
    status: tx.status,
    referenceType: tx.referenceType,
    referenceId: tx.referenceId,
    note: tx.note,
    metadata: tx.metadata,
    availableAfter: tx.availableAfter,
    holdAfter: tx.holdAfter,
    time: formatTxTime(tx.createdAt),
  }
}

function transactionDescription(tx) {
  return tx.note || tx.metadata || tx.referenceType || tx.type || 'Giao dịch'
}

function statusTone(status) {
  if (status === 'SUCCESS' || status === 'ACTIVE' || status === 'PAID') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (status === 'PENDING') return 'bg-amber-50 text-amber-700 border border-amber-200'
  if (status === 'FAILED' || status === 'REVERSED' || status === 'SUSPENDED') return 'bg-red-50 text-red-700 border border-red-200'
  return 'bg-gray-100 text-gray-700 border border-gray-200'
}

function statusIcon(status) {
  if (status === 'SUCCESS' || status === 'ACTIVE' || status === 'PAID') return <CheckCircle2 className="w-3.5 h-3.5" />
  if (status === 'PENDING') return <Clock className="w-3.5 h-3.5" />
  if (status === 'FAILED' || status === 'REVERSED' || status === 'SUSPENDED') return <XCircle className="w-3.5 h-3.5" />
  return <AlertCircle className="w-3.5 h-3.5" />
}

function numberToWords(number) {
  if (number <= 0) return ''
  const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín']
  const levels = ['', 'nghìn', 'triệu', 'tỷ']

  let words = []
  let numStr = Math.floor(number).toString()

  while (numStr.length % 3 !== 0) {
    numStr = '0' + numStr
  }

  const groups = []
  for (let i = 0; i < numStr.length; i += 3) {
    groups.push(numStr.substring(i, i + 3))
  }

  for (let i = 0; i < groups.length; i++) {
    const g = groups[i]
    const h = parseInt(g[0])
    const t = parseInt(g[1])
    const u = parseInt(g[2])

    if (h === 0 && t === 0 && u === 0) continue

    let groupWords = []
    if (h > 0 || words.length > 0) {
      groupWords.push(units[h] + ' trăm')
    }

    if (t > 0) {
      if (t === 1) {
        groupWords.push('mười')
      } else {
        groupWords.push(units[t] + ' mươi')
      }
    } else if (h > 0 && u > 0) {
      groupWords.push('lẻ')
    }

    if (u > 0) {
      if (u === 1 && t > 1) {
        groupWords.push('mốt')
      } else if (u === 5 && t > 0) {
        groupWords.push('lăm')
      } else {
        groupWords.push(units[u])
      }
    }

    const level = levels[groups.length - 1 - i]
    if (level) {
      groupWords.push(level)
    }
    words.push(groupWords.join(' '))
  }

  let result = words.join(' ').trim()
  result = result.charAt(0).toUpperCase() + result.slice(1) + ' đồng'
  return result.replace(/\s+/g, ' ')
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  )
}

export default function WalletPanel({
  walletMode = 'user',
  title,
  description,
  accentClass = 'text-[#D4A017]',
  bgPanelClass = 'bg-gradient-to-br from-[#1E3A5F] to-[#0F1E3A] text-white',
  quickActions,
}) {
  const isAdminWallet = walletMode === 'admin'
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [mode, setMode] = useState('deposit')
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [depositOrder, setDepositOrder] = useState(null)
  const [bankForm, setBankForm] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    reason: '',
  })

  // State filters & preferences
  const [showBalance, setShowBalance] = useState(() => {
    try {
      const stored = localStorage.getItem('wallet_show_balance')
      return stored !== 'false'
    } catch {
      return true
    }
  })
  const [txFilter, setTxFilter] = useState('ALL')

  useEffect(() => {
    try {
      localStorage.setItem('wallet_show_balance', String(showBalance))
    } catch { }
  }, [showBalance])

  const amount = selectedAmount || toNumber(customAmount)
  const availableBalance = toNumber(wallet?.availableBalance)
  const holdBalance = toNumber(wallet?.holdBalance)
  const totalBalance = toNumber(wallet?.totalBalance)

  const loadWalletData = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoadingData(true)
    try {
      const loadWallet = isAdminWallet ? walletService.getAdminWallet : walletService.getMyWallet
      const loadTx = isAdminWallet ? walletService.getAdminTransactions : walletService.getMyTransactions
      const [walletData, txs] = await Promise.all([loadWallet(), loadTx()])
      setWallet(walletData)
      setTransactions(Array.isArray(txs) ? txs.map(mapTransaction) : [])
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không tải được ví')
    } finally {
      setLoadingData(false)
    }
  }, [isAdminWallet])

  useEffect(() => {
    let ignore = false
    const loadWallet = isAdminWallet ? walletService.getAdminWallet : walletService.getMyWallet
    const loadTx = isAdminWallet ? walletService.getAdminTransactions : walletService.getMyTransactions

    Promise.all([loadWallet(), loadTx()])
      .then(([walletData, txs]) => {
        if (ignore) return
        setWallet(walletData)
        setTransactions(Array.isArray(txs) ? txs.map(mapTransaction) : [])
      })
      .catch((err) => {
        if (!ignore) toast.error(getApiErrorMessage(err) || 'Không tải được ví')
      })
      .finally(() => {
        if (!ignore) setLoadingData(false)
      })

    return () => {
      ignore = true
    }
  }, [isAdminWallet])

  const resetForm = () => {
    setSelectedAmount(0)
    setCustomAmount('')
    setBankForm({
      bankName: '',
      bankAccountNumber: '',
      bankAccountName: '',
      reason: '',
    })
  }

  const validateWithdrawal = () => {
    if (!bankForm.bankName || !bankForm.bankAccountNumber || !bankForm.bankAccountName) {
      toast.error('Vui lòng điền đầy đủ thông tin ngân hàng')
      return false
    }
    if (isAdminWallet && !bankForm.reason.trim()) {
      toast.error('Vui lòng nhập lý do rút ví hệ thống')
      return false
    }
    return true
  }

  const handleAction = async () => {
    if (amount <= 0) {
      toast.error('Số tiền phải lớn hơn 0')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'deposit') {
        const createDeposit = isAdminWallet
          ? walletService.createAdminDepositOrder
          : walletService.createDepositOrder
        const order = await createDeposit({
          amount,
          currency: 'VND',
          provider: PROVIDER,
        })
        setDepositOrder(order)
        toast.success(`Đã tạo lệnh nạp ${fmtVND(amount)}`)
      } else {
        if (!validateWithdrawal()) return
        const createWithdrawal = isAdminWallet
          ? walletService.createAdminWithdrawal
          : walletService.createWithdrawal
        await createWithdrawal({
          amount,
          bankName: bankForm.bankName,
          bankAccountNumber: bankForm.bankAccountNumber,
          bankAccountName: bankForm.bankAccountName,
          reason: bankForm.reason || undefined,
        })
        setDepositOrder(null)
        toast.success(`Đã gửi yêu cầu rút ${fmtVND(amount)}`)
      }
      resetForm()
      await loadWalletData({ showLoading: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (txFilter === 'ALL') return true
    if (txFilter === 'DEPOSIT') {
      return tx.type === 'DEPOSIT' || tx.type === 'REFUND'
    }
    if (txFilter === 'WITHDRAW') {
      return tx.type === 'WITHDRAW' || tx.type === 'ADMIN_WITHDRAW'
    }
    if (txFilter === 'BETS') {
      return ['BET_STAKE', 'ENTRY_FEE', 'LATE_CHECK_IN_FEE', 'JOCKEY_HIRE', 'JOCKEY_HIRE_TAX', 'ITEM_PURCHASE'].includes(tx.type)
    }
    if (txFilter === 'PAYOUTS') {
      return ['BET_PAYOUT', 'PRIZE_PAYOUT', 'JOCKEY_PAYOUT', 'ITEM_SALE'].includes(tx.type)
    }
    return true
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Wallet Card Section */}
      <div className={`rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group hover:shadow-[#D4A017]/10 hover:shadow-2xl transition-all duration-300 ${bgPanelClass}`}>
        {/* Background Gradients & Effects */}
        <div className="absolute -right-16 -top-16 w-52 h-52 bg-[#D4A017]/15 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none"></div>

        <div className="relative flex flex-col justify-between h-full min-h-[200px]">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                  <Wallet className={`w-6 h-6 ${accentClass}`} />
                </div>
                <h2 className="text-lg font-bold tracking-wide opacity-95">{title}</h2>
              </div>
              <p className="text-xs opacity-75 max-w-md">{description}</p>
            </div>

            {/* Premium Smart Chip representation */}
            <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-100 via-amber-200 to-amber-400 opacity-90 flex items-center justify-center relative overflow-hidden border border-amber-300/40 shadow-inner shrink-0">
              <div className="absolute inset-x-3 top-0 bottom-0 border-r border-amber-600/30"></div>
              <div className="absolute inset-y-2.5 left-0 right-0 border-b border-amber-600/30"></div>
              <div className="w-4 h-3 rounded bg-amber-500/25 border border-amber-500/10"></div>
            </div>
          </div>

          {/* Balance */}
          <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider uppercase opacity-75 block">Số dư khả dụng</span>
              <div className="flex items-center gap-3">
                <span className={`text-4xl md:text-5xl font-black tracking-tight ${accentClass}`}>
                  {loadingData
                    ? '...'
                    : showBalance
                      ? fmtVND(availableBalance)
                      : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-colors cursor-pointer"
                  title={showBalance ? "Ẩn số dư" : "Hiện số dư"}
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Actions (if any) */}
            {quickActions?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {quickActions.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={action.onClick}
                      className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer font-medium text-sm"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer Info / Badge Cards */}
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
                <span className="opacity-60 mr-1.5">Đang giữ:</span>
                <span className="font-bold text-amber-200">
                  {showBalance ? fmtVND(holdBalance) : '••••••••'}
                </span>
              </div>
              <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-xs">
                <span className="opacity-60 mr-1.5">Tổng số dư:</span>
                <span className="font-bold">
                  {showBalance ? fmtVND(totalBalance) : '••••••••'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider">
              {wallet?.currency && (
                <span className="rounded-lg bg-[#D4A017]/20 border border-[#D4A017]/30 px-2.5 py-1 text-[#D4A017]">
                  {wallet.currency}
                </span>
              )}
              {wallet?.status && (
                <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-emerald-300">
                  {WALLET_STATUS_LABELS[wallet.status] || wallet.status}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Forms & presets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Deposit/Withdraw - occupies 2 cols on lg screens */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">

          {/* Sliding Segmented Tab Controller */}
          <div className="relative flex p-1 bg-slate-100 rounded-2xl">
            <div
              className="absolute top-1 bottom-1 left-1 rounded-xl bg-white shadow-md transition-all duration-300 ease-out"
              style={{
                width: 'calc(50% - 4px)',
                transform: mode === 'deposit' ? 'translateX(0)' : 'translateX(100%)',
              }}
            />
            <button
              type="button"
              onClick={() => {
                setMode('deposit')
                setDepositOrder(null)
              }}
              className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors duration-250 cursor-pointer ${mode === 'deposit' ? 'text-[#1E3A5F]' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <ArrowDownLeft className={`w-4 h-4 transition-transform duration-300 ${mode === 'deposit' ? 'text-[#D4A017] scale-110' : 'text-slate-400'}`} />
              Nạp tiền
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('withdraw')
                setDepositOrder(null)
              }}
              className={`relative z-10 flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors duration-250 cursor-pointer ${mode === 'withdraw' ? 'text-[#1E3A5F]' : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              <ArrowUpRight className={`w-4 h-4 transition-transform duration-300 ${mode === 'withdraw' ? 'text-[#1E3A5F] scale-110' : 'text-slate-400'}`} />
              Rút tiền
            </button>
          </div>

          {/* Amount Form Section */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Chọn số tiền giao dịch</label>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(p)
                    setCustomAmount('')
                  }}
                  className={`py-3 px-1 rounded-xl text-xs font-bold border transition-all active:scale-95 cursor-pointer ${selectedAmount === p
                      ? 'bg-amber-500/5 border-2 border-[#D4A017] text-[#1E3A5F]'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                >
                  {fmtVND(p).replace(/\s?₫/, '')}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold text-lg">₫</span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Hoặc nhập số tiền tự chọn"
                value={customAmount ? Number(customAmount).toLocaleString('vi-VN') : ''}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '')
                  setCustomAmount(raw)
                  setSelectedAmount(0)
                }}
                className="w-full pl-9.5 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:bg-white focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 transition-all font-bold text-lg text-slate-800 placeholder:text-slate-400 placeholder:font-normal"
              />
              <div className="absolute inset-y-0 right-0 pr-4.5 flex items-center pointer-events-none">
                <span className="text-slate-400 text-xs font-bold">VND</span>
              </div>
            </div>

            {/* Vietnamese number to text spelling */}
            {amount > 0 && (
              <div className="rounded-xl bg-slate-50 px-4 py-2.5 border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Bằng chữ: <span className="font-semibold text-[#1E3A5F]">{numberToWords(amount)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Deposit Mode Form Detail */}
          {mode === 'deposit' && (
            <div className="space-y-3 pt-2">
              <div className="text-sm font-bold text-slate-700">Phương thức nạp</div>
              <div className="p-4.5 rounded-2xl border border-sky-500/20 bg-sky-500/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-500 to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-sky-500/10 shrink-0">
                    Zalo
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">Cổng Ví Điện Tử ZaloPay</div>
                    <div className="text-xs text-slate-500">Thanh toán trực tiếp, giao dịch hoàn thành tức thì</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase shrink-0">
                  Nhanh gọn
                </span>
              </div>
            </div>
          )}

          {/* Withdraw Mode Form Detail */}
          {mode === 'withdraw' && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2 border-b border-slate-200/60 pb-3">
                  <CreditCard className="w-4.5 h-4.5 text-slate-500" />
                  Thông tin ngân hàng thụ hưởng
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Tên ngân hàng" required>
                    <input
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 transition-all text-slate-800 placeholder:text-slate-400 placeholder:font-normal text-sm font-semibold"
                      placeholder="VD: Vietcombank, Techcombank..."
                    />
                  </Field>

                  <Field label="Số tài khoản nhận" required>
                    <input
                      value={bankForm.bankAccountNumber}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, bankAccountNumber: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 transition-all text-slate-800 placeholder:text-slate-400 placeholder:font-normal text-sm font-semibold"
                      placeholder="Nhập số tài khoản ngân hàng"
                    />
                  </Field>

                  <Field label="Chủ tài khoản" required>
                    <input
                      value={bankForm.bankAccountName}
                      onChange={(e) => setBankForm({ ...bankForm, bankAccountName: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 transition-all text-slate-800 uppercase placeholder:text-slate-400 placeholder:font-normal text-sm font-bold"
                      placeholder="VD: NGUYEN VAN A"
                    />
                  </Field>

                  <Field label={isAdminWallet ? 'Lý do rút ví hệ thống' : 'Nội dung/Lý do'} required={isAdminWallet}>
                    <input
                      value={bankForm.reason}
                      onChange={(e) => setBankForm({ ...bankForm, reason: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 transition-all text-slate-800 placeholder:text-slate-400 placeholder:font-normal text-sm font-semibold"
                      placeholder={isAdminWallet ? 'Bắt buộc nhập lý do rút ví hệ thống' : 'Không bắt buộc'}
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={handleAction}
            disabled={submitting || amount <= 0}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer ${submitting || amount <= 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-100'
                : mode === 'deposit'
                  ? 'bg-gradient-to-r from-[#D4A017] to-[#B8941F] hover:from-[#B8941F] hover:to-[#D4A017] shadow-[#D4A017]/10 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-gradient-to-r from-[#1E3A5F] to-[#0F1E3A] hover:from-[#0F1E3A] hover:to-[#1E3A5F] shadow-[#1E3A5F]/10 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]'
              }`}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Đang tiến hành giao dịch...
              </span>
            ) : (
              <>
                {mode === 'deposit' ? 'Tạo lệnh nạp' : 'Gửi yêu cầu rút'}
                {amount > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold leading-normal">
                    {fmtVND(amount)}
                  </span>
                )}
              </>
            )}
          </button>

          {/* ZaloPay invoice ticket rendering */}
          {depositOrder && mode === 'deposit' && (
            <div className="mt-6 rounded-2xl border border-dashed border-[#D4A017]/50 bg-amber-500/5 p-6 relative overflow-hidden">
              {/* Corner punch cuts to look like a ticket */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-white border-r border-[#D4A017]/30 transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border-l border-[#D4A017]/30 transform -translate-y-1/2"></div>

              <div className="flex items-center gap-2 text-[#1E3A5F] font-extrabold text-sm mb-4 pb-4 border-b border-dashed border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                LỆNH NẠP TIỀN ĐANG CHỜ THANH TOÁN
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
                <div className="flex justify-between sm:flex-col sm:justify-start gap-1">
                  <span className="text-slate-500 text-xs font-semibold">Mã lệnh nạp:</span>
                  <span className="font-bold text-slate-800">{depositOrder.referenceCode || '—'}</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:justify-start gap-1">
                  <span className="text-slate-500 text-xs font-semibold">Trạng thái:</span>
                  <span className="inline-flex items-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${statusTone(depositOrder.status)}`}>
                      {statusIcon(depositOrder.status)}
                      {STATUS_LABELS[depositOrder.status] || depositOrder.status}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between sm:flex-col sm:justify-start gap-1">
                  <span className="text-slate-500 text-xs font-semibold">Hết hạn vào:</span>
                  <span className="font-bold text-slate-800">{formatTxTime(depositOrder.expiredAt)}</span>
                </div>
                {depositOrder.transferContent && (
                  <div className="flex justify-between sm:flex-col sm:justify-start gap-1">
                    <span className="text-slate-500 text-xs font-semibold">Nội dung:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs select-all w-fit">
                      {depositOrder.transferContent}
                    </span>
                  </div>
                )}
              </div>

              {depositOrder.checkoutUrl && (
                <a
                  href={depositOrder.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 px-5 py-3.5 text-sm font-bold text-white hover:from-blue-600 hover:to-sky-600 shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all"
                >
                  <span>Mở ví ZaloPay để thanh toán</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Transaction History - occupies 1 col on lg screens */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col h-full min-h-[500px]">
          <div className="space-y-1 mb-4">
            <h3 className="text-base font-extrabold text-[#1E3A5F] flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              Lịch sử giao dịch
            </h3>
            <p className="text-xs text-slate-500">Danh sách các biến động ví của bạn</p>
          </div>

          {/* Filter list */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-thin select-none">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'DEPOSIT', label: 'Nạp & Hoàn' },
              { id: 'WITHDRAW', label: 'Rút tiền' },
              { id: 'BETS', label: 'Đặt cược' },
              { id: 'PAYOUTS', label: 'Nhận thưởng' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTxFilter(tab.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${txFilter === tab.id
                    ? 'bg-[#1E3A5F] text-white'
                    : 'bg-slate-50 text-slate-500 border border-slate-200/60 hover:bg-slate-100 hover:text-slate-800'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1 max-h-[550px]">
            {loadingData ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-2">
                <div className="w-8 h-8 border-3 border-[#1E3A5F] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Đang tải lịch sử...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center space-y-3">
                <div className="p-4 rounded-full bg-slate-50 border border-slate-100">
                  <Wallet className="w-8 h-8 opacity-40 text-slate-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-600">Chưa có giao dịch nào</p>
                  <p className="text-[11px] text-slate-400 max-w-[180px] mx-auto">Các biến động số dư của bộ lọc này sẽ hiển thị ở đây</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTransactions.map((tx) => {
                  const cfg = TX_LABELS[tx.type] || {
                    label: tx.type,
                    color: 'text-slate-600',
                    bg: 'bg-slate-50',
                  }

                  // Dynamically resolve custom lucide icon
                  const CustomIcon = TX_ICONS[tx.type] || HelpCircle

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200/80 transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Colored Icon Container */}
                          <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 border border-slate-100/50`}>
                            <CustomIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate" title={transactionDescription(tx)}>
                              {transactionDescription(tx)}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                              {cfg.label} · {DIRECTION_LABELS[tx.direction] || tx.direction}
                            </p>
                          </div>
                        </div>

                        {/* Amount & Status info */}
                        <div className="text-right shrink-0">
                          <div className={`text-xs font-black tracking-tight ${tx.isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.isCredit ? '+' : '-'}
                            {fmtVND(Math.abs(tx.signedAmount)).replace(/\s?₫/, '')}
                          </div>

                          {tx.status && (
                            <span className={`mt-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${statusTone(tx.status)}`}>
                              {statusIcon(tx.status)}
                              {STATUS_LABELS[tx.status] || tx.status}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expandable Meta details (Timestamp & Balances after tx) */}
                      <div className="pt-2 border-t border-slate-100/60 flex items-center justify-between text-[9px] text-slate-400 font-semibold">
                        <span>{tx.time}</span>
                        <div className="flex gap-2">
                          {tx.availableAfter != null && (
                            <span>Khả dụng: {fmtVND(tx.availableAfter).replace(/\s?₫/, '')}</span>
                          )}
                          {tx.holdAfter != null && toNumber(tx.holdAfter) > 0 && (
                            <span className="text-amber-600">Tạm giữ: {fmtVND(tx.holdAfter).replace(/\s?₫/, '')}</span>
                          )}
                        </div>
                      </div>

                      {/* References details if any */}
                      {(tx.referenceType || tx.referenceId) && (
                        <div className="text-[9px] text-slate-350 bg-slate-50 px-2 py-1 rounded-md w-fit flex items-center gap-1.5 font-mono leading-none">
                          <span className="opacity-75">{tx.referenceType}:</span>
                          <span className="font-bold text-slate-500">#{tx.referenceId || '—'}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
