import { useCallback, useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
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
  AlertCircle,
  Copy,
  Check
} from 'lucide-react'
import { toast } from 'sonner'
import { invalidateWalletCache, walletService } from '@/services/walletService'
import { fmtVND } from '@/utils/formatCurrency'
import { getApiErrorMessage } from '@/utils/apiError'
import HorseRacingThreeBackground from './HorseRacingThreeBackground'
import { createIdempotencyKey, stableIdempotencyKey } from '@/utils/idempotency'

const PRESETS = [100_000, 500_000, 1_000_000, 5_000_000, 10_000_000]
const PROVIDER = 'ZALOPAY'

const DEPOSIT_METHODS = [
  {
    id: 'QR',
    title: 'Quét QR ZaloPay',
    description: 'Thanh toán bằng ví ZaloPay Sandbox',
    badge: 'Nhanh gọn',
    accent: 'from-sky-500 via-blue-500 to-blue-600',
  },
  {
    id: 'VISA',
    title: 'Thẻ Visa / Mastercard',
    description: 'Nhập thẻ test ngay trên web, tiền tự vào ví',
    badge: 'Sandbox',
    accent: 'from-violet-500 via-purple-500 to-indigo-600',
  },
]

const VISA_TEST_CARD = {
  number: '4111111111111111',
  name: 'NGUYEN VAN A',
  expiry: '01/25',
  cvv: '123',
}

const TX_LABELS = {
  DEPOSIT: { label: 'Nạp tiền', color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
  WITHDRAW: { label: 'Rút tiền', color: 'text-rose-300', bg: 'bg-rose-500/15' },
  ADMIN_WITHDRAW: { label: 'Rút quỹ', color: 'text-rose-300', bg: 'bg-rose-500/15' },
  ENTRY_FEE: { label: 'Phí đăng ký', color: 'text-amber-300', bg: 'bg-amber-500/15' },
  LATE_CHECK_IN_FEE: { label: 'Phí check-in muộn', color: 'text-amber-300', bg: 'bg-amber-500/15' },
  JOCKEY_HIRE: { label: 'Thuê jockey', color: 'text-amber-300', bg: 'bg-amber-500/15' },
  JOCKEY_PAYOUT: { label: 'Thanh toán jockey', color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
  JOCKEY_HIRE_TAX: { label: 'Thuế thuê jockey', color: 'text-amber-300', bg: 'bg-amber-500/15' },
  BET_STAKE: { label: 'Tiền cược', color: 'text-amber-300', bg: 'bg-amber-500/15' },
  BET_PAYOUT: { label: 'Thưởng cược', color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
  PRIZE_PAYOUT: { label: 'Tiền thưởng', color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
  ITEM_PURCHASE: { label: 'Mua vật phẩm', color: 'text-amber-300', bg: 'bg-amber-500/15' },
  ITEM_SALE: { label: 'Bán vật phẩm', color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
  REFUND: { label: 'Hoàn tiền', color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
  ADJUSTMENT: { label: 'Điều chỉnh', color: 'text-sky-300', bg: 'bg-sky-500/15' },
  REFEREE_PAYOUT: { label: 'Lương trọng tài', color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
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
  REFEREE_PAYOUT: Coins,
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
  PAID: 'Đã thanh toán',
  SUCCESS: 'Thành công',
  FAILED: 'Thất bại',
  EXPIRED: 'Hết hạn',
  CANCELLED: 'Đã hủy',
  REVERSED: 'Đã đảo',
}

const TERMINAL_DEPOSIT_STATUSES = new Set(['PAID', 'FAILED', 'CANCELLED', 'EXPIRED'])

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
    operationId: tx.operationId,
    operationType: tx.operationType,
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
    availableDelta: toNumber(tx.availableDelta),
    holdDelta: toNumber(tx.holdDelta),
    time: formatTxTime(tx.createdAt),
  }
}

function transactionDescription(tx) {
  return tx.note || tx.metadata || tx.referenceType || tx.type || 'Giao dịch'
}

function statusTone(status) {
  if (status === 'SUCCESS' || status === 'ACTIVE' || status === 'PAID') return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
  if (status === 'PENDING') return 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
  if (status === 'FAILED' || status === 'REVERSED' || status === 'SUSPENDED') return 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
  if (status === 'EXPIRED' || status === 'CANCELLED') return 'bg-white/10 text-white/60 border border-white/15'
  return 'bg-white/10 text-white/60 border border-white/15'
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

const WALLET_UI = {
  root: 'space-y-6 w-full',
  card: 'rounded-3xl border border-white/10 bg-white/[0.045]',
  cardPad: 'p-6 md:p-8',
  cardPadSm: 'p-6',
  segmentTrack: 'relative flex p-1 bg-white/[0.045] border border-white/10 rounded-2xl',
  segmentThumb:
    'absolute top-1 bottom-1 left-1 rounded-xl bg-[#dda50e] ring-1 ring-[#f0c14b]/35 shadow-lg shadow-[#dda50e]/20 transition-all duration-300 ease-out',
  tabActive: 'text-white',
  tabInactive: 'text-white/60 hover:bg-white/5 hover:text-white',
  tabIconDepositActive: 'text-white scale-110',
  tabIconDepositInactive: 'text-white/40 group-hover:text-white/70',
  tabIconWithdrawActive: 'text-white scale-110',
  tabIconWithdrawInactive: 'text-white/40 group-hover:text-white/70',
  label: 'block text-sm font-bold text-white/80',
  presetActive: 'bg-[#D4A017]/15 border-2 border-[#D4A017] text-[#D4A017]',
  presetInactive: 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20',
  currencyPrefix: 'text-white/40 font-bold text-lg',
  amountInput:
    'w-full pl-9.5 pr-16 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:bg-white/[0.08] focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 transition-all font-bold text-lg text-white placeholder:text-white/30 placeholder:font-normal',
  currencySuffix: 'text-white/40 text-xs font-bold',
  wordsBox: 'rounded-xl bg-white/5 px-4 py-2.5 border border-white/10',
  wordsText: 'text-xs text-white/55 leading-relaxed',
  wordsHighlight: 'font-semibold text-[#D4A017]',
  sectionTitle: 'text-sm font-bold text-white/80',
  bankPanel: 'bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4',
  bankTitle: 'text-sm font-bold text-white/80 flex items-center gap-2 border-b border-white/10 pb-3',
  bankTitleIcon: 'w-4.5 h-4.5 text-white/45',
  fieldLabel: 'text-sm font-semibold text-white/70 mb-1.5',
  input:
    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 transition-all text-white placeholder:text-white/30 placeholder:font-normal text-sm font-semibold',
  inputUpper:
    'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10 transition-all text-white uppercase placeholder:text-white/30 placeholder:font-normal text-sm font-bold',
  btnDisabled: 'bg-white/5 text-white/30 cursor-not-allowed shadow-none border border-white/10',
  ticket: 'mt-6 rounded-3xl border border-[#008fe5]/30 bg-gradient-to-br from-slate-900/90 to-[#0A1628]/95 p-6 relative overflow-hidden shadow-2xl shadow-sky-500/5 backdrop-blur-md',
  ticketPunchL: 'w-3 h-6 rounded-r-full bg-[#0A1628] border-y border-r border-[#008fe5]/30 shrink-0',
  ticketPunchR: 'w-3 h-6 rounded-l-full bg-[#0A1628] border-y border-l border-[#008fe5]/30 shrink-0',
  ticketHeader: 'flex items-center gap-2 text-white font-extrabold text-sm mb-4 pb-4 border-b border-white/10',
  ticketLabel: 'text-white/45 text-[11px] font-medium tracking-wide uppercase',
  ticketValue: 'font-bold text-white text-xs truncate max-w-[150px] sm:max-w-none',
  ticketMono: 'font-mono font-bold text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px] select-all truncate max-w-[120px] sm:max-w-none w-fit',
  historyHeading: 'text-base font-extrabold text-white flex items-center gap-2',
  historyIcon: 'w-5 h-5 text-white/45',
  historySub: 'text-xs text-white/55',
  filterActive: 'bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/30',
  filterInactive: 'bg-white/5 text-white/55 border border-white/10 hover:bg-white/10 hover:text-white/80',
  loadingWrap: 'flex flex-col items-center justify-center py-20 text-white/45 space-y-2',
  emptyWrap: 'flex flex-col items-center justify-center py-20 text-white/45 text-center space-y-3',
  emptyIconWrap: 'p-4 rounded-full bg-white/5 border border-white/10',
  emptyIcon: 'w-8 h-8 opacity-40 text-white/50',
  emptyTitle: 'text-xs font-bold text-white/70',
  emptyDesc: 'text-[11px] text-white/45 max-w-[180px] mx-auto',
  txRow:
    'p-3.5 rounded-2xl hover:bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2',
  txIconBorder: 'border border-white/10',
  txTitle: 'text-xs font-bold text-white truncate',
  txMeta: 'text-[10px] text-white/50 font-semibold mt-0.5',
  txFooter:
    'pt-2 border-t border-white/10 flex items-center justify-between text-[9px] text-white/40 font-semibold',
  txRef: 'text-[9px] text-white/45 bg-white/5 px-2 py-1 rounded-md w-fit flex items-center gap-1.5 font-mono leading-none',
  txRefId: 'font-bold text-white/55',
  methodName: 'font-bold text-white text-sm',
  methodDesc: 'text-xs text-white/55',
  methodBadge: 'px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black tracking-wide uppercase shrink-0',
  amountCredit: 'text-emerald-400',
  amountDebit: 'text-rose-400',
  holdText: 'text-amber-300',
  spinner: 'border-white/20 border-t-[#D4A017]',
}

function Field({ label, required, children, labelClassName = 'text-sm font-semibold text-slate-700 mb-1.5' }) {
  return (
    <label className="block">
      <span className={`block ${labelClassName}`}>
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
  const ui = WALLET_UI
  const depositPollRef = useRef(null)
  const withdrawalIdempotencyKeyRef = useRef(null)
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [adminWithdrawals, setAdminWithdrawals] = useState([])
  const [reconciliation, setReconciliation] = useState(null)
  const [processingWithdrawalId, setProcessingWithdrawalId] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [mode, setMode] = useState('deposit')
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [depositMethod, setDepositMethod] = useState('QR')
  const [depositOrder, setDepositOrder] = useState(null)
  const [cardForm, setCardForm] = useState({
    cardNumber: VISA_TEST_CARD.number,
    cardName: VISA_TEST_CARD.name,
    expiry: VISA_TEST_CARD.expiry,
    cvv: VISA_TEST_CARD.cvv,
  })
  const [bankForm, setBankForm] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    reason: '',
  })

  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedContent, setCopiedContent] = useState(false)

  const handleCopy = (text, type) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    if (type === 'code') {
      toast.success('Đã sao chép mã lệnh nạp')
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } else {
      toast.success('Đã sao chép nội dung chuyển khoản')
      setCopiedContent(true)
      setTimeout(() => setCopiedContent(false), 2000)
    }
  }

  const validateCardForm = () => {
    if (!cardForm.cardNumber.trim() || !cardForm.cardName.trim() || !cardForm.expiry.trim() || !cardForm.cvv.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin thẻ')
      return false
    }
    return true
  }

  const payDepositWithCard = async (orderId) => {
    if (!validateCardForm()) return null
    const payWithCard = isAdminWallet
      ? walletService.payAdminDepositOrderWithCard
      : walletService.payMyDepositOrderWithCard

    return payWithCard(orderId, {
      cardNumber: cardForm.cardNumber.replace(/\s+/g, ''),
      cardName: cardForm.cardName.trim(),
      expiry: cardForm.expiry.trim(),
      cvv: cardForm.cvv.trim(),
    })
  }


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
    } catch {
      // localStorage can be unavailable in private/browser-restricted contexts.
    }
  }, [showBalance])

  const amount = selectedAmount || toNumber(customAmount)
  const activeDepositChannel = depositOrder?.paymentChannel || depositMethod
  const isVisaDeposit = activeDepositChannel === 'VISA'
  const paymentGatewayUrl =
    depositOrder?.cashierOrderUrl || depositOrder?.checkoutUrl || depositOrder?.orderUrl || ''
  const depositQrValue = !isVisaDeposit ? depositOrder?.qrCode || depositOrder?.checkoutUrl : ''
  const isProviderQr = Boolean(depositOrder?.qrCode)
  const availableBalance = toNumber(wallet?.availableBalance)
  const holdBalance = toNumber(wallet?.holdBalance)
  const totalBalance = toNumber(wallet?.totalBalance)

  const loadWalletData = useCallback(async ({ showLoading = false } = {}) => {
    if (showLoading) setLoadingData(true)
    try {
      const loadWallet = isAdminWallet ? walletService.getAdminWallet : walletService.getMyWallet
      const loadTx = isAdminWallet ? walletService.getAdminTransactions : walletService.getMyTransactions
      const [walletData, txs] = await Promise.all([loadWallet({ force: true }), loadTx()])
      setWallet(walletData)
      setTransactions(Array.isArray(txs) ? txs.map(mapTransaction) : [])
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không tải được ví')
    } finally {
      setLoadingData(false)
    }
  }, [isAdminWallet])

  const loadAdminFinance = useCallback(async () => {
    if (!isAdminWallet) return
    try {
      const [withdrawals, report] = await Promise.all([
        walletService.getAdminWithdrawals(),
        walletService.getReconciliation(),
      ])
      setAdminWithdrawals(Array.isArray(withdrawals) ? withdrawals : [])
      setReconciliation(report || null)
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không tải được dữ liệu đối soát')
    }
  }, [isAdminWallet])

  useEffect(() => {
    if (!isAdminWallet) return undefined
    let cancelled = false
    Promise.all([walletService.getAdminWithdrawals(), walletService.getReconciliation()])
      .then(([withdrawals, report]) => {
        if (cancelled) return
        setAdminWithdrawals(Array.isArray(withdrawals) ? withdrawals : [])
        setReconciliation(report || null)
      })
      .catch((err) => {
        if (!cancelled) toast.error(getApiErrorMessage(err) || 'Không tải được dữ liệu đối soát')
      })
    return () => { cancelled = true }
  }, [isAdminWallet])

  const transitionWithdrawal = async (row, action) => {
    const scope = `withdrawal:${row.id}:${action}`
    setProcessingWithdrawalId(String(row.id))
    try {
      if (action === 'approve') {
        await walletService.approveWithdrawal(row.id, stableIdempotencyKey(scope))
      } else if (action === 'reject') {
        const note = window.prompt('Lý do từ chối yêu cầu rút tiền', 'Thông tin không hợp lệ')
        if (note === null) return
        await walletService.rejectWithdrawal(row.id, note, stableIdempotencyKey(scope))
      } else {
        await walletService.markWithdrawalPaid(row.id, stableIdempotencyKey(scope))
      }
      toast.success('Đã cập nhật yêu cầu rút tiền')
      invalidateWalletCache('all')
      await Promise.all([loadAdminFinance(), loadWalletData({ showLoading: false })])
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setProcessingWithdrawalId('')
    }
  }

  const stopDepositPolling = useCallback(() => {
    if (depositPollRef.current) {
      clearInterval(depositPollRef.current)
      depositPollRef.current = null
    }
  }, [])

  const startDepositPolling = useCallback((orderId) => {
    stopDepositPolling()
    const fetchOrder = isAdminWallet
      ? walletService.getAdminDepositOrder
      : walletService.getMyDepositOrder

    depositPollRef.current = setInterval(async () => {
      try {
        const latest = await fetchOrder(orderId)
        setDepositOrder(latest)
        if (TERMINAL_DEPOSIT_STATUSES.has(latest?.status)) {
          stopDepositPolling()
          invalidateWalletCache(isAdminWallet ? 'admin' : 'user')
          await loadWalletData({ showLoading: false })
          if (latest.status === 'PAID') {
            toast.success('Nạp tiền thành công!')
            setDepositOrder(null)
          } else if (latest.status === 'FAILED') {
            toast.error('Thanh toán thất bại')
          } else if (latest.status === 'EXPIRED') {
            toast.error('Lệnh nạp đã hết hạn')
          } else if (latest.status === 'CANCELLED') {
            toast.info('Lệnh nạp đã bị hủy')
          }
        }
      } catch {
        // Bỏ qua lỗi tạm thời khi poll
      }
    }, 3000)
  }, [isAdminWallet, loadWalletData, stopDepositPolling])

  useEffect(() => () => stopDepositPolling(), [stopDepositPolling])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const depositStatus = params.get('depositStatus')
    if (!depositStatus) return

    if (depositStatus === 'success') {
      toast.success('Nạp tiền thành công!')
    } else if (depositStatus === 'failed') {
      toast.error('Thanh toán chưa hoàn tất')
    } else {
      toast.info('Đang xác nhận thanh toán...')
    }

    const orderId = params.get('orderId')
    Promise.resolve().then(() => loadWalletData({ showLoading: true }))
    window.history.replaceState({}, '', window.location.pathname)

    if (orderId) {
      startDepositPolling(Number(orderId))
    }
  }, [loadWalletData, startDepositPolling])

  useEffect(() => {
    let ignore = false
    const loadWallet = isAdminWallet ? walletService.getAdminWallet : walletService.getMyWallet
    const loadTx = isAdminWallet ? walletService.getAdminTransactions : walletService.getMyTransactions

    Promise.all([loadWallet({ force: true }), loadTx()])
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
          paymentChannel: depositMethod,
        })

        if (depositMethod === 'VISA') {
          stopDepositPolling()
          const paid = await payDepositWithCard(order.id)
          setDepositOrder(paid)
          invalidateWalletCache(isAdminWallet ? 'admin' : 'user')
          await loadWalletData({ showLoading: false })
          toast.success(`Nạp tiền thành công ${fmtVND(amount)}`)
          setDepositOrder(null)
        } else {
          setDepositOrder(order)
          if (order?.id) {
            startDepositPolling(order.id)
          }
          toast.success(`Đã tạo lệnh nạp ${fmtVND(amount)}`)
        }
      } else {
        if (!validateWithdrawal()) return
        const createWithdrawal = isAdminWallet
          ? walletService.createAdminWithdrawal
          : walletService.createWithdrawal
        if (!withdrawalIdempotencyKeyRef.current) withdrawalIdempotencyKeyRef.current = createIdempotencyKey()
        await createWithdrawal({
          amount,
          bankName: bankForm.bankName,
          bankAccountNumber: bankForm.bankAccountNumber,
          bankAccountName: bankForm.bankAccountName,
          reason: bankForm.reason || undefined,
        }, withdrawalIdempotencyKeyRef.current)
        withdrawalIdempotencyKeyRef.current = null
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
    <div className={ui.root}>
      {/* Wallet Card Section */}
      <div className={`rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden group hover:shadow-[#D4A017]/10 hover:shadow-2xl transition-all duration-300 ${bgPanelClass}`}>
        {/* Background Gradients & Effects */}
        <div className="absolute -right-16 -top-16 w-52 h-52 bg-[#D4A017]/15 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none"></div>

        <div className="relative flex flex-col justify-between h-full min-h-[200px]">
          {/* Header */}
          <div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15">
                  <Wallet className={`w-6 h-6 ${accentClass}`} />
                </div>
                <h2 className="text-lg font-bold tracking-wide opacity-95">{title}</h2>
              </div>
              <p className="text-xs opacity-75 max-w-md">{description}</p>
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

      {isAdminWallet && (
        <div className={`${ui.card} ${ui.cardPadSm} space-y-4`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-white">Duyệt rút tiền & đối soát</h3>
              <p className="text-xs text-white/55">Treasury và nghĩa vụ user được hiển thị riêng, không cộng thành một tổng.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-lg border border-sky-400/25 bg-sky-500/10 px-3 py-2 text-sky-200">Treasury: {fmtVND(reconciliation?.balances?.treasuryAsset || 0)}</span>
              <span className="rounded-lg border border-violet-400/25 bg-violet-500/10 px-3 py-2 text-violet-200">Nghĩa vụ user: {fmtVND(reconciliation?.balances?.userLiability || 0)}</span>
              {toNumber(reconciliation?.balances?.treasuryAsset) < 0 && <span className="rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-rose-200">Cảnh báo treasury âm</span>}
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {adminWithdrawals.filter((row) => ['PENDING', 'APPROVED'].includes(row.status)).map((row) => (
              <div key={row.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black">{fmtVND(row.amount)}</p>
                    <p className="mt-1 text-xs text-white/55">{row.bankName} · {row.accountName} · {row.bankAccount}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.status === 'PENDING' ? 'bg-amber-500/15 text-amber-200' : 'bg-sky-500/15 text-sky-200'}`}>{row.status}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {row.status === 'PENDING' && <button disabled={processingWithdrawalId === String(row.id)} onClick={() => transitionWithdrawal(row, 'approve')} className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-200 disabled:opacity-40">Duyệt</button>}
                  {row.status === 'PENDING' && <button disabled={processingWithdrawalId === String(row.id)} onClick={() => transitionWithdrawal(row, 'reject')} className="rounded-lg bg-rose-500/20 px-3 py-2 text-xs font-bold text-rose-200 disabled:opacity-40">Từ chối</button>}
                  {row.status === 'APPROVED' && <button disabled={processingWithdrawalId === String(row.id)} onClick={() => transitionWithdrawal(row, 'paid')} className="rounded-lg bg-sky-500/20 px-3 py-2 text-xs font-bold text-sky-200 disabled:opacity-40">Xác nhận đã trả</button>}
                </div>
              </div>
            ))}
            {!adminWithdrawals.some((row) => ['PENDING', 'APPROVED'].includes(row.status)) && <p className="text-xs text-white/50">Không có yêu cầu rút tiền đang mở.</p>}
          </div>
          {reconciliation?.issues && (
            <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-xs text-white/65">
              Hold lệch: {reconciliation.issues.holdMismatches?.count || 0} · Ví trùng: {reconciliation.issues.duplicateWallets || 0} · Race thiếu settlement: {reconciliation.issues.racesMissingFinancialSettlement || 0} · Treasury alerts: {reconciliation.issues.openTreasuryAlerts || 0}
            </div>
          )}
        </div>
      )}

      {/* Main Forms & presets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Deposit/Withdraw - occupies 2 cols on lg screens */}
        <div className={`lg:col-span-2 ${ui.card} ${ui.cardPad} space-y-6`}>

          {/* Sliding Segmented Tab Controller */}
          <div className={ui.segmentTrack}>
            <div
              className={ui.segmentThumb}
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
              className={`group relative z-10 flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors duration-250 cursor-pointer ${mode === 'deposit' ? ui.tabActive : ui.tabInactive
                }`}
            >
              <ArrowDownLeft className={`w-4 h-4 transition-colors duration-300 ${mode === 'deposit' ? ui.tabIconDepositActive : ui.tabIconDepositInactive}`} />
              Nạp tiền
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('withdraw')
                setDepositOrder(null)
              }}
              className={`group relative z-10 flex-1 py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors duration-250 cursor-pointer ${mode === 'withdraw' ? ui.tabActive : ui.tabInactive
                }`}
            >
              <ArrowUpRight className={`w-4 h-4 transition-colors duration-300 ${mode === 'withdraw' ? ui.tabIconWithdrawActive : ui.tabIconWithdrawInactive}`} />
              Rút tiền
            </button>
          </div>

          {/* Amount Form Section */}
          <div className="space-y-4">
            <label className={ui.label}>Chọn số tiền giao dịch</label>

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
                    ? ui.presetActive
                    : ui.presetInactive
                    }`}
                >
                  {fmtVND(p).replace(/\s?₫/, '')}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
                <span className={ui.currencyPrefix}>₫</span>
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
                className={ui.amountInput}
              />
              <div className="absolute inset-y-0 right-0 pr-4.5 flex items-center pointer-events-none">
                <span className={ui.currencySuffix}>VND</span>
              </div>
            </div>

            {/* Vietnamese number to text spelling */}
            {amount > 0 && (
              <div className={ui.wordsBox}>
                <p className={ui.wordsText}>
                  Bằng chữ: <span className={ui.wordsHighlight}>{numberToWords(amount)}</span>
                </p>
              </div>
            )}
          </div>

          {/* Deposit Mode Form Detail */}
          {mode === 'deposit' && (
            <div className="space-y-3 pt-2">
              <div className={ui.sectionTitle}>Phương thức nạp</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEPOSIT_METHODS.map((method) => {
                  const active = depositMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setDepositMethod(method.id)
                        setDepositOrder(null)
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-[#D4A017] bg-[#D4A017]/10 shadow-lg shadow-[#D4A017]/10'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${method.accent} flex items-center justify-center text-white font-black text-xs shadow-md shrink-0`}
                          >
                            {method.id === 'VISA' ? 'VISA' : 'Zalo'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{method.title}</div>
                            <div className="text-[11px] text-white/55 mt-0.5 leading-relaxed">
                              {method.description}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 bg-sky-500/10 border border-sky-500/20 rounded-full px-2 py-0.5 shrink-0">
                          {method.badge}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {depositMethod === 'VISA' && (
                <div className="rounded-2xl border border-violet-500/25 bg-violet-500/5 p-4 space-y-3">
                  <p className="text-sm font-bold text-white">Nhập thẻ Visa test (tiền ảo)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Số thẻ" required labelClassName={ui.fieldLabel}>
                      <input
                        value={cardForm.cardNumber}
                        onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value.replace(/\D/g, '') })}
                        className={ui.input}
                        placeholder="4111111111111111"
                      />
                    </Field>
                    <Field label="Tên chủ thẻ" required labelClassName={ui.fieldLabel}>
                      <input
                        value={cardForm.cardName}
                        onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                        className={ui.inputUpper}
                        placeholder="NGUYEN VAN A"
                      />
                    </Field>
                    <Field label="Hết hạn (MM/YY)" required labelClassName={ui.fieldLabel}>
                      <input
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                        className={ui.input}
                        placeholder="01/25"
                      />
                    </Field>
                    <Field label="CVV" required labelClassName={ui.fieldLabel}>
                      <input
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        className={ui.input}
                        placeholder="123"
                      />
                    </Field>
                  </div>
                  <p className="text-[11px] text-white/50">
                    Nhập thẻ test rồi bấm「Tạo lệnh nạp」— tiền sẽ tự cộng vào ví hệ thống ngay.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Withdraw Mode Form Detail */}
          {mode === 'withdraw' && (
            <div className="space-y-4 pt-2">
              <div className={ui.bankPanel}>
                <h4 className={ui.bankTitle}>
                  <CreditCard className={ui.bankTitleIcon} />
                  Thông tin ngân hàng thụ hưởng
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Tên ngân hàng" required labelClassName={ui.fieldLabel}>
                    <input
                      value={bankForm.bankName}
                      onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                      className={ui.input}
                      placeholder="VD: Vietcombank, Techcombank..."
                    />
                  </Field>

                  <Field label="Số tài khoản nhận" required labelClassName={ui.fieldLabel}>
                    <input
                      value={bankForm.bankAccountNumber}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, bankAccountNumber: e.target.value })
                      }
                      className={ui.input}
                      placeholder="Nhập số tài khoản ngân hàng"
                    />
                  </Field>

                  <Field label="Chủ tài khoản" required labelClassName={ui.fieldLabel}>
                    <input
                      value={bankForm.bankAccountName}
                      onChange={(e) => setBankForm({ ...bankForm, bankAccountName: e.target.value.toUpperCase() })}
                      className={ui.inputUpper}
                      placeholder="VD: NGUYEN VAN A"
                    />
                  </Field>

                  <Field label={isAdminWallet ? 'Lý do rút ví hệ thống' : 'Nội dung/Lý do'} required={isAdminWallet} labelClassName={ui.fieldLabel}>
                    <input
                      value={bankForm.reason}
                      onChange={(e) => setBankForm({ ...bankForm, reason: e.target.value })}
                      className={ui.input}
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
              ? ui.btnDisabled
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
            <div className={ui.ticket}>
              {/* Branded ZaloPay Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#008fe5] p-2 rounded-xl flex items-center justify-center shadow-lg shadow-[#008fe5]/20 shrink-0">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 100 100" fill="currentColor">
                      <path d="M50,5 C25.1,5 5,25.1 5,50 C5,74.9 25.1,95 50,95 C74.9,95 95,74.9 95,50 C95,25.1 74.9,5 50,5 Z" fill="#008fe5" />
                      <path d="M35,30 H55 C63.3,30 70,36.7 70,45 C70,53.3 63.3,60 55,60 H45 V75 H35 V30 Z M45,40 V50 H55 C57.8,50 60,47.8 60,45 C60,42.2 57.8,40 55,40 H45 Z" fill="white" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white tracking-wide">CỔNG THANH TOÁN ZALOPAY</h3>
                    <p className="text-[10px] text-white/50 font-semibold uppercase tracking-wider">Hệ thống xử lý tự động</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-emerald-500/10 border border-emerald-500/25 rounded-full px-3 py-1 shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                    Đang kết nối
                  </span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Transaction Reference */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/[0.05] transition-all shadow-md shadow-black/5">
                  <span className={ui.ticketLabel}>Mã lệnh nạp</span>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className={ui.ticketValue}>{depositOrder.referenceCode || '—'}</span>
                    {depositOrder.referenceCode && (
                      <button
                        type="button"
                        onClick={() => handleCopy(depositOrder.referenceCode, 'code')}
                        className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10 transition-all shrink-0 cursor-pointer"
                        title="Sao chép mã"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/[0.05] transition-all shadow-md shadow-black/5">
                  <span className={ui.ticketLabel}>Trạng thái</span>
                  <div className="flex items-center mt-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 ${statusTone(depositOrder.status)}`}>
                      {statusIcon(depositOrder.status)}
                      {STATUS_LABELS[depositOrder.status] || depositOrder.status}
                    </span>
                  </div>
                </div>

                {/* Expiry */}
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/[0.05] transition-all shadow-md shadow-black/5">
                  <span className={ui.ticketLabel}>Hết hạn vào</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-rose-400/80 shrink-0" />
                    <span className="font-bold text-white text-xs">{formatTxTime(depositOrder.expiredAt)}</span>
                  </div>
                </div>

                {/* Amount or Transfer Content */}
                {depositOrder.transferContent ? (
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/[0.05] transition-all shadow-md shadow-black/5">
                    <span className={ui.ticketLabel}>Nội dung giao dịch</span>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className={ui.ticketMono}>{depositOrder.transferContent}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(depositOrder.transferContent, 'content')}
                        className="text-white/40 hover:text-white p-1 rounded hover:bg-white/10 transition-all shrink-0 cursor-pointer"
                        title="Sao chép nội dung"
                      >
                        {copiedContent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-white/[0.05] transition-all shadow-md shadow-black/5">
                    <span className={ui.ticketLabel}>Số tiền nạp</span>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="font-black text-sm text-[#00bfa5]">{fmtVND(depositOrder.amount || selectedAmount)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Divider with punch cuts */}
              <div className="relative my-6 -mx-6 h-0 flex items-center justify-between">
                <div className={ui.ticketPunchL}></div>
                <div className="w-full border-t border-dashed border-[#008fe5]/25"></div>
                <div className={ui.ticketPunchR}></div>
              </div>

              {/* Visa: thanh toán trực tiếp trên web, không hiện QR */}
              {!isVisaDeposit && (
                depositQrValue ? (
                <div className="relative mb-5 rounded-2xl border border-[#008fe5]/20 bg-[#0A1628] p-5 shadow-lg shadow-sky-950/10 overflow-hidden">
                  <HorseRacingThreeBackground />
                  <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                    {/* Glowing QR wrapper */}
                    <div className="relative bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl shadow-[#008fe5]/15 border border-white/30 select-none group shrink-0">
                      {/* Scanner Line */}
                      <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#008fe5] to-transparent top-0 animate-scan opacity-80 pointer-events-none"></div>
                      <QRCodeSVG
                        value={depositQrValue}
                        size={220}
                        level="M"
                        includeMargin={false}
                        bgColor="transparent"
                        fgColor="#000000"
                        className="h-auto w-full max-w-[200px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-white tracking-wide">
                        {isProviderQr ? 'QUÉT MÃ QR ĐỂ THANH TOÁN' : 'QUÉT MÃ QR ĐỂ MỞ LIÊN KẾT'}
                      </p>
                      <p className="mx-auto max-w-sm text-[11px] font-medium leading-relaxed text-white/55">
                        {isProviderQr
                          ? 'Dùng ứng dụng ZaloPay hoặc ứng dụng ngân hàng của bạn, quét mã QR trên và đợi hệ thống tự động hoàn tất.'
                          : 'Hệ thống đang mở liên kết thanh toán. Quét mã QR trên bằng điện thoại để tiếp tục giao dịch ZaloPay.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-5 rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3.5 text-xs font-semibold leading-relaxed text-amber-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  ZaloPay chưa trả về mã QR hoặc trang thanh toán cho lệnh này. Vui lòng thử tạo lệnh nạp mới.
                </div>
              ))}

              {/* Action Link Button */}
              {paymentGatewayUrl && !isVisaDeposit && (
                <a
                  href={paymentGatewayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-sm font-bold text-white transition-all active:scale-[0.99] shadow-lg ${depositQrValue
                    ? 'border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#008fe5]/40'
                    : 'bg-gradient-to-r from-[#008fe5] to-[#00bfa5] hover:from-[#007cd6] hover:to-[#00b098] shadow-sky-500/15 hover:shadow-xl'
                    }`}
                >
                  <span>{depositQrValue ? 'Mở trang thanh toán dự phòng' : 'Mở trang thanh toán ZaloPay'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

            </div>
          )}
        </div>

        {/* Right Panel: Transaction History - occupies 1 col on lg screens */}
        <div className={`${ui.card} ${ui.cardPadSm} flex flex-col h-full min-h-[500px]`}>
          <div className="space-y-1 mb-4">
            <h3 className={ui.historyHeading}>
              <Clock className={ui.historyIcon} />
              Lịch sử giao dịch
            </h3>
            <p className={ui.historySub}>
              {isAdminWallet ? 'Danh sách các biến động ví quỹ hệ thống' : 'Danh sách các biến động ví của bạn'}
            </p>
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
                  ? ui.filterActive
                  : ui.filterInactive
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto space-y-3 scrollbar-thin pr-1 max-h-[550px]">
            {loadingData ? (
              <div className={ui.loadingWrap}>
                <div className="w-8 h-8 border-3 border-white/20 border-t-[#D4A017] rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Đang tải lịch sử...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className={ui.emptyWrap}>
                <div className={ui.emptyIconWrap}>
                  <Wallet className={ui.emptyIcon} />
                </div>
                <div className="space-y-1">
                  <p className={ui.emptyTitle}>Chưa có giao dịch nào</p>
                  <p className={ui.emptyDesc}>Các biến động số dư của bộ lọc này sẽ hiển thị ở đây</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTransactions.map((tx) => {
                  const cfg = TX_LABELS[tx.type] || {
                    label: tx.type,
                    color: 'text-white/70',
                    bg: 'bg-white/10',
                  }

                  // Dynamically resolve custom lucide icon
                  const CustomIcon = TX_ICONS[tx.type] || HelpCircle

                  return (
                    <div
                      key={tx.id}
                      className={ui.txRow}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Colored Icon Container */}
                          <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 ${ui.txIconBorder}`}>
                            <CustomIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className={ui.txTitle} title={transactionDescription(tx)}>
                              {transactionDescription(tx)}
                            </h4>
                            <p className={ui.txMeta}>
                              {cfg.label} · {DIRECTION_LABELS[tx.direction] || tx.direction}
                            </p>
                          </div>
                        </div>

                        {/* Amount & Status info */}
                        <div className="text-right shrink-0">
                          <div className={`text-xs font-black tracking-tight ${tx.isCredit ? ui.amountCredit : ui.amountDebit}`}>
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
                      <div className={ui.txFooter}>
                        <span>{tx.time}</span>
                          <div className="flex gap-2">
                          {tx.availableDelta !== 0 && (
                            <span className={tx.availableDelta > 0 ? ui.amountCredit : ui.amountDebit}>Available {tx.availableDelta > 0 ? '+' : ''}{fmtVND(tx.availableDelta).replace(/\s?₫/, '')}</span>
                          )}
                          {tx.holdDelta !== 0 && (
                            <span className={ui.holdText}>Hold {tx.holdDelta > 0 ? '+' : ''}{fmtVND(tx.holdDelta).replace(/\s?₫/, '')}</span>
                          )}
                          {tx.availableAfter != null && (
                            <span>Khả dụng: {fmtVND(tx.availableAfter).replace(/\s?₫/, '')}</span>
                          )}
                          {tx.holdAfter != null && toNumber(tx.holdAfter) > 0 && (
                            <span className={ui.holdText}>Tạm giữ: {fmtVND(tx.holdAfter).replace(/\s?₫/, '')}</span>
                          )}
                        </div>
                      </div>

                      {/* References details if any */}
                      {(tx.referenceType || tx.referenceId) && (
                        <div className={ui.txRef}>
                          <span className="opacity-75">{tx.referenceType}:</span>
                          <span className={ui.txRefId}>#{tx.referenceId || '—'}</span>
                        </div>
                      )}
                      {tx.operationId && (
                        <div className={ui.txRef}>
                          <span className="opacity-75">Operation:</span>
                          <span className={ui.txRefId}>#{tx.operationId}</span>
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
