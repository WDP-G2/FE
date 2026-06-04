import { useCallback, useEffect, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Wallet,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { walletService } from '@/services/walletService'
import { fmtVND } from '@/utils/formatCurrency'
import { getApiErrorMessage } from '@/utils/apiError'

const PRESETS = [100_000, 500_000, 1_000_000, 5_000_000, 10_000_000]

const METHODS = [
  { id: 'ZALOPAY', name: 'ZaloPay', icon: Smartphone },
  { id: 'VNPAY', name: 'VNPay', icon: CreditCard },
  { id: 'BANK', name: 'Ngân hàng', icon: Building2 },
]

const TX_LABELS = {
  DEPOSIT: { label: 'Nạp tiền', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  WITHDRAW: { label: 'Rút tiền', color: 'text-red-600', bg: 'bg-red-50' },
  ADMIN_WITHDRAW: { label: 'Rút quỹ', color: 'text-red-600', bg: 'bg-red-50' },
  PAYMENT: { label: 'Thanh toán', color: 'text-orange-600', bg: 'bg-orange-50' },
  REWARD: { label: 'Thưởng', color: 'text-[#D4A017]', bg: 'bg-[#D4A017]/10' },
}

function formatTxTime(createdAt) {
  if (!createdAt) return '—'
  try {
    return new Date(createdAt).toLocaleString('vi-VN')
  } catch {
    return String(createdAt)
  }
}

function mapTransaction(tx) {
  const amount = Number(tx?.amount ?? 0)
  const direction = tx?.direction
  const isCredit = direction === 'CREDIT' || amount >= 0
  const signedAmount = isCredit ? Math.abs(amount) : -Math.abs(amount)
  return {
    id: tx.id,
    type: tx.type,
    signedAmount,
    isCredit,
    desc: tx.note || tx.metadata || tx.referenceType || 'Giao dịch',
    time: formatTxTime(tx.createdAt),
    balanceAfter: tx.availableAfter,
  }
}

export default function WalletPanel({
  walletMode = 'user',
  title,
  description,
  accentClass = 'text-[#D4A017]',
  bgPanelClass = 'bg-gradient-to-br from-[#1E3A5F] to-[#0F1E3A] text-white',
  quickActions,
}) {
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [mode, setMode] = useState('deposit')
  const [selectedAmount, setSelectedAmount] = useState(0)
  const [customAmount, setCustomAmount] = useState('')
  const [method, setMethod] = useState('ZALOPAY')
  const [submitting, setSubmitting] = useState(false)
  const [bankForm, setBankForm] = useState({
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    reason: '',
  })

  const amount = selectedAmount || Number(customAmount) || 0

  const refresh = useCallback(async () => {
    setLoadingData(true)
    try {
      const loadWallet =
        walletMode === 'admin' ? walletService.getAdminWallet : walletService.getMyWallet
      const loadTx =
        walletMode === 'admin'
          ? walletService.getAdminTransactions
          : walletService.getMyTransactions
      const [wallet, txs] = await Promise.all([loadWallet(), loadTx()])
      setBalance(Number(wallet?.availableBalance ?? wallet?.totalBalance ?? 0))
      setTransactions(Array.isArray(txs) ? txs.map(mapTransaction) : [])
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không tải được ví')
    } finally {
      setLoadingData(false)
    }
  }, [walletMode])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleAction = async () => {
    if (amount < 10_000) {
      toast.error('Số tiền tối thiểu 10.000đ')
      return
    }
    if (mode === 'withdraw' && walletMode === 'admin') {
      toast.info('Rút tiền ví hệ thống thực hiện qua kênh quản trị backend')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'deposit') {
        await walletService.createDepositOrder({
          amount,
          currency: 'VND',
          provider: method === 'ZALOPAY' ? 'ZALOPAY' : 'ZALOPAY',
        })
        toast.success(`Đã tạo lệnh nạp ${fmtVND(amount)}`)
      } else {
        if (!bankForm.bankName || !bankForm.bankAccountNumber || !bankForm.bankAccountName) {
          toast.error('Vui lòng điền đầy đủ thông tin ngân hàng')
          setSubmitting(false)
          return
        }
        await walletService.createWithdrawal({
          amount,
          bankName: bankForm.bankName,
          bankAccountNumber: bankForm.bankAccountNumber,
          bankAccountName: bankForm.bankAccountName,
          reason: bankForm.reason || undefined,
        })
        toast.success(`Đã gửi yêu cầu rút ${fmtVND(amount)}`)
      }
      setSelectedAmount(0)
      setCustomAmount('')
      await refresh()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-8 shadow-xl relative overflow-hidden ${bgPanelClass}`}>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#D4A017]/20 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className={`w-7 h-7 ${accentClass}`} />
            <h2 className="text-xl font-semibold opacity-90">{title}</h2>
          </div>
          <p className="text-sm opacity-70 mb-4">{description}</p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm opacity-70 mb-1">Số dư hiện tại</div>
              <div className={`text-4xl md:text-5xl font-bold ${accentClass}`}>
                {loadingData ? '...' : fmtVND(balance)}
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

      {walletMode !== 'admin' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('deposit')}
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
              onClick={() => setMode('withdraw')}
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
              <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                Phương thức nạp
              </label>
              <div className="grid grid-cols-3 gap-3">
                {METHODS.map((m) => {
                  const Icon = m.icon
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        method === m.id
                          ? 'border-[#D4A017] bg-[#D4A017]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-[#D4A017]" />
                      <span className="text-sm font-semibold text-[#1E3A5F]">{m.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {mode === 'withdraw' && (
            <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                  Tên ngân hàng *
                </label>
                <input
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl"
                  placeholder="VD: Vietcombank"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                  Số tài khoản *
                </label>
                <input
                  value={bankForm.bankAccountNumber}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, bankAccountNumber: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#1E3A5F] mb-2">
                  Chủ tài khoản *
                </label>
                <input
                  value={bankForm.bankAccountName}
                  onChange={(e) =>
                    setBankForm({ ...bankForm, bankAccountName: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl"
                />
              </div>
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
              : `${mode === 'deposit' ? 'Nạp' : 'Rút'} ${amount > 0 ? fmtVND(amount) : ''}`}
          </button>
        </div>
      )}

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
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 border border-gray-100"
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
                      <div className="font-semibold text-[#1E3A5F] truncate">{tx.desc}</div>
                      <div className="text-xs text-[#1E3A5F]/60">
                        {cfg.label} · {tx.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-bold ${tx.isCredit ? 'text-emerald-600' : 'text-red-600'}`}
                    >
                      {tx.isCredit ? '+' : ''}
                      {fmtVND(tx.signedAmount)}
                    </div>
                    {tx.balanceAfter != null && (
                      <div className="text-xs text-[#1E3A5F]/60">
                        SD: {fmtVND(tx.balanceAfter)}
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
