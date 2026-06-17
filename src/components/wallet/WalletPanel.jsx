import { useCallback, useEffect, useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Smartphone, Wallet } from 'lucide-react'
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
  ACTIVE: 'Đang hoạt động',
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
  if (status === 'SUCCESS' || status === 'ACTIVE' || status === 'PAID') return 'bg-emerald-50 text-emerald-700'
  if (status === 'PENDING') return 'bg-amber-50 text-amber-700'
  if (status === 'FAILED' || status === 'REVERSED' || status === 'SUSPENDED') return 'bg-red-50 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-[#1E3A5F] mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
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

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-8 shadow-xl relative overflow-hidden ${bgPanelClass}`}>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className={`w-7 h-7 ${accentClass}`} />
            <h2 className="text-xl font-semibold opacity-90">{title}</h2>
          </div>
          <p className="text-sm opacity-70 mb-5">{description}</p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm opacity-70 mb-1">Số dư khả dụng</div>
              <div className={`text-4xl md:text-5xl font-bold ${accentClass}`}>
                {loadingData ? '...' : fmtVND(availableBalance)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Đang giữ: {fmtVND(holdBalance)}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Tổng: {fmtVND(totalBalance)}
                </span>
                {wallet?.currency && (
                  <span className="rounded-full bg-white/10 px-3 py-1">{wallet.currency}</span>
                )}
                {wallet?.status && (
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    {WALLET_STATUS_LABELS[wallet.status] || wallet.status}
                  </span>
                )}
              </div>
            </div>
            {quickActions?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {quickActions.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={action.onClick}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl flex items-center gap-2 backdrop-blur transition-all"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span className="text-sm font-semibold">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow">
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('deposit')
              setDepositOrder(null)
            }}
            className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'deposit'
                ? 'bg-[#D4A017] text-white shadow-lg'
                : 'bg-gray-100 text-[#1E3A5F] hover:bg-gray-200'
            }`}
          >
            <ArrowDownLeft className="w-5 h-5" />
            Nạp tiền
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('withdraw')
              setDepositOrder(null)
            }}
            className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              mode === 'withdraw'
                ? 'bg-[#1E3A5F] text-white shadow-lg'
                : 'bg-gray-100 text-[#1E3A5F] hover:bg-gray-200'
            }`}
          >
            <ArrowUpRight className="w-5 h-5" />
            Rút tiền
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">Chọn số tiền</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setSelectedAmount(p)
                  setCustomAmount('')
                }}
                className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  selectedAmount === p
                    ? 'bg-[#D4A017] text-white border border-[#D4A017]'
                    : 'bg-[#FAFAFA] border border-gray-200 text-[#1E3A5F] hover:border-[#D4A017]'
                }`}
              >
                {fmtVND(p)}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="0"
            placeholder="Hoặc nhập số tiền tùy chọn"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              setSelectedAmount(0)
            }}
            className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20"
          />
        </div>

        {mode === 'deposit' && (
          <div className="mb-5">
            <div className="text-sm font-semibold text-[#1E3A5F] mb-2">Phương thức nạp</div>
            <div className="p-3 rounded-xl border-2 border-[#D4A017] bg-[#D4A017]/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-[#D4A017]" />
              </div>
              <div>
                <div className="font-semibold text-[#1E3A5F]">ZaloPay</div>
                <div className="text-xs text-[#1E3A5F]/60">Thanh toán qua ZaloPay</div>
              </div>
            </div>
          </div>
        )}

        {mode === 'withdraw' && (
          <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tên ngân hàng" required>
              <input
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl"
                placeholder="VD: Vietcombank"
              />
            </Field>
            <Field label="Số tài khoản" required>
              <input
                value={bankForm.bankAccountNumber}
                onChange={(e) =>
                  setBankForm({ ...bankForm, bankAccountNumber: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl"
              />
            </Field>
            <Field label="Chủ tài khoản" required>
              <input
                value={bankForm.bankAccountName}
                onChange={(e) => setBankForm({ ...bankForm, bankAccountName: e.target.value })}
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl"
              />
            </Field>
            <Field label={isAdminWallet ? 'Lý do rút ví hệ thống' : 'Lý do'} required={isAdminWallet}>
              <input
                value={bankForm.reason}
                onChange={(e) => setBankForm({ ...bankForm, reason: e.target.value })}
                className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl"
                placeholder={isAdminWallet ? 'Bắt buộc nhập lý do' : 'Không bắt buộc'}
              />
            </Field>
          </div>
        )}

        <button
          type="button"
          onClick={handleAction}
          disabled={submitting || amount <= 0}
          className="w-full py-3.5 bg-[#D4A017] text-white rounded-xl font-bold hover:bg-[#B8941F] disabled:opacity-50 shadow-lg transition-all"
        >
          {submitting
            ? 'Đang xử lý...'
            : `${mode === 'deposit' ? 'Tạo lệnh nạp' : 'Gửi yêu cầu rút'} ${
                amount > 0 ? fmtVND(amount) : ''
              }`}
        </button>

        {depositOrder && mode === 'deposit' && (
          <div className="mt-5 rounded-xl border border-[#D4A017]/30 bg-[#FFF8F0] p-4">
            <div className="font-bold text-[#1E3A5F] mb-2">Lệnh nạp đã tạo</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#1E3A5F]/80">
              {depositOrder.referenceCode && <div>Mã lệnh: {depositOrder.referenceCode}</div>}
              {depositOrder.status && <div>Trạng thái: {depositOrder.status}</div>}
              {depositOrder.expiredAt && (
                <div>Hết hạn: {formatTxTime(depositOrder.expiredAt)}</div>
              )}
              {depositOrder.transferContent && (
                <div>Nội dung: {depositOrder.transferContent}</div>
              )}
            </div>
            {depositOrder.checkoutUrl && (
              <a
                href={depositOrder.checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#D4A017] px-4 py-2 text-sm font-semibold text-white hover:bg-[#B8941F]"
              >
                Mở thanh toán ZaloPay
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow">
        <h3 className="text-lg font-bold text-[#1E3A5F] mb-4">Lịch sử giao dịch</h3>
        {loadingData ? (
          <p className="text-center py-10 text-[#1E3A5F]/60">Đang tải...</p>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 text-[#1E3A5F]/60">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Chưa có giao dịch nào</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => {
              const cfg = TX_LABELS[tx.type] || {
                label: tx.type,
                color: 'text-[#1E3A5F]',
                bg: 'bg-gray-50',
              }
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 border border-gray-100 gap-4"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}
                    >
                      {tx.isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[#1E3A5F] truncate">
                        {transactionDescription(tx)}
                      </div>
                      <div className="text-xs text-[#1E3A5F]/60">
                        {cfg.label} · {DIRECTION_LABELS[tx.direction] || tx.direction} · {tx.time}
                      </div>
                      {(tx.referenceType || tx.referenceId) && (
                        <div className="text-[11px] text-[#1E3A5F]/45 truncate">
                          {tx.referenceType}
                          {tx.referenceId ? ` #${tx.referenceId}` : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-bold ${tx.isCredit ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {tx.isCredit ? '+' : '-'}
                      {fmtVND(Math.abs(tx.signedAmount))}
                    </div>
                    {tx.status && (
                      <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${statusTone(tx.status)}`}>
                        {STATUS_LABELS[tx.status] || tx.status}
                      </div>
                    )}
                    {tx.availableAfter != null && (
                      <div className="mt-1 text-xs text-[#1E3A5F]/60">
                        SD: {fmtVND(tx.availableAfter)}
                      </div>
                    )}
                    {tx.holdAfter != null && toNumber(tx.holdAfter) > 0 && (
                      <div className="text-xs text-[#1E3A5F]/60">
                        Giữ: {fmtVND(tx.holdAfter)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
