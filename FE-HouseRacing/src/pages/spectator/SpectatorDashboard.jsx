import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  CalendarClock,
  CircleDollarSign,
  Wallet,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react'
import { spectatorService } from '@/services/spectatorService'
import { fmtVND } from '@/utils/formatCurrency'
import { formatDisplayDateTime } from '@/utils/dateFormat'
import { EmptyState, ErrorState, LoadingState, Panel } from './spectatorUi'

const TX_LABELS = {
  DEPOSIT: { label: 'Nạp tiền', isCredit: true },
  WITHDRAW: { label: 'Rút tiền', isCredit: false },
  ADMIN_WITHDRAW: { label: 'Rút quỹ', isCredit: false },
  BET_STAKE: { label: 'Tiền cược', isCredit: false },
  BET_PAYOUT: { label: 'Thưởng cược', isCredit: true },
  PRIZE_PAYOUT: { label: 'Tiền thưởng', isCredit: true },
  REFUND: { label: 'Hoàn tiền', isCredit: true },
  ENTRY_FEE: { label: 'Phí đăng ký', isCredit: false },
}

function getTxDetails(tx) {
  const type = tx?.type || ''
  const direction = tx?.direction || ''

  // Decide credit/debit
  const isCredit = direction === 'CREDIT' || direction === 'RELEASE' || TX_LABELS[type]?.isCredit === true
  const labelData = TX_LABELS[type]
  const typeLabel = tx.note || labelData?.label || type || 'Giao dịch'

  return {
    label: typeLabel,
    isCredit,
    colorClass: isCredit ? 'text-emerald-400' : 'text-rose-400',
    prefix: isCredit ? '+' : '-'
  }
}

function StatCard({ label, value, icon: Icon, tone = 'gold' }) {
  const toneClasses = {
    gold: 'from-[#D4A017]/25 to-[#D4A017]/5 text-[#D4A017] border-[#D4A017]/20 shadow-[#D4A017]/5',
    blue: 'from-sky-500/25 to-sky-500/5 text-sky-300 border-sky-500/20 shadow-sky-500/5',
    green: 'from-emerald-500/25 to-emerald-500/5 text-emerald-300 border-emerald-500/20 shadow-emerald-500/5',
    purple: 'from-purple-500/25 to-purple-500/5 text-purple-300 border-purple-500/20 shadow-purple-500/5',
  }

  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-5 shadow-xl shadow-black/20 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${toneClasses[tone]} border border-white/10 shadow-md`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-2xl font-black text-white tracking-tight">{value}</div>
      <div className="mt-1.5 text-xs font-bold text-white/50 uppercase tracking-wider">{label}</div>
    </div>
  )
}

export default function SpectatorDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      setDashboard(await spectatorService.getDashboard())
    } catch (err) {
      setError(err?.message || 'Không thể tải bảng tổng quan khán giả')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard()
  }, [])

  if (loading) return <LoadingState label="Đang tải bảng tổng quan..." />
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />

  const summary = dashboard?.businessSummary || {}
  const wallet = dashboard?.wallet || {}

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-[#D4A017]">Tổng quan</p>
          <h2 className="text-3xl font-black tracking-tight text-white mt-1">Tổng quan khán giả</h2>
        </div>
        <Link
          to="/spectator/wallet"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#D4A017] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#D4A017]/20 hover:bg-[#B8941F] transition-all hover:shadow-[#D4A017]/30 active:scale-95 shrink-0"
        >
          <Wallet className="h-4 w-4" />
          Mở ví
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Giải đang mở" value={summary.openTournamentCount} icon={CalendarClock} tone="gold" />
        <StatCard label="Kèo đang mở" value={summary.openBetMarketCount} icon={CircleDollarSign} tone="blue" />
        <StatCard label="Tổng tiền cược" value={fmtVND(summary.totalBetStake)} icon={Wallet} tone="green" />
        <StatCard label="Tổng tiền thắng cược" value={fmtVND(summary.totalBetPayout)} icon={CircleDollarSign} tone="purple" />
      </section>

      <Panel title="Số dư ví" icon={Wallet} actions={
        <Link
          to="/spectator/wallet"
          className="text-xs text-[#D4A017] hover:underline font-bold flex items-center gap-1"
        >
          Chi tiết ví <ChevronRight className="h-3 w-3" />
        </Link>
      }>
        <div className="grid gap-3 sm:grid-cols-3">
          <Balance label="Khả dụng" value={wallet.availableBalance} highlight={true} />
          <Balance label="Tạm giữ" value={wallet.holdBalance} />
          <Balance label="Tổng số dư" value={wallet.totalBalance} />
        </div>
      </Panel>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="Kèo sắp diễn ra" icon={CalendarClock}>
          <SimpleList items={dashboard?.upcoming} empty="Chưa có kèo nào đang mở">
            {(item) => (
              <div className="group rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300">
                <div className="font-bold text-white group-hover:text-[#D4A017] transition-colors">{item.title}</div>
                <div className="mt-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-white/40">
                    <Clock className="h-3 w-3" />
                    <span>{formatDisplayDateTime(item.at)}</span>
                  </div>
                  <span className="rounded-md border border-[#D4A017]/30 bg-[#D4A017]/10 px-2 py-0.5 text-[9px] font-black tracking-wide text-[#D4A017] uppercase">
                    {item.status || 'ĐANG MỞ'}
                  </span>
                </div>
              </div>
            )}
          </SimpleList>
        </Panel>

        <Panel title="Giao dịch gần đây" icon={TrendingUp}>
          <SimpleList items={dashboard?.recentTransactions} empty="Chưa có giao dịch nào">
            {(tx) => {
              const details = getTxDetails(tx)
              const Icon = details.isCredit ? ArrowDownLeft : ArrowUpRight
              return (
                <div className="group flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white/5 transition-colors ${details.isCredit ? 'border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/10' : 'border-rose-500/20 text-rose-400 group-hover:bg-rose-500/10'
                      }`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-bold text-white group-hover:text-[#D4A017] transition-colors">
                        {details.label}
                      </div>
                      <div className="text-[10px] text-white/40 mt-0.5">
                        {formatDisplayDateTime(tx.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className={`shrink-0 text-sm font-black tracking-tight ${details.colorClass}`}>
                    {details.prefix}{fmtVND(tx.amount)}
                  </div>
                </div>
              )
            }}
          </SimpleList>
        </Panel>

        <Panel title="Thông báo mới" icon={Bell}>
          <SimpleList items={dashboard?.recentNotifications} empty="Chưa có thông báo nào">
            {(notification) => (
              <div className={`group rounded-xl border p-3.5 transition-all duration-300 hover:bg-white/[0.04] ${!notification.read
                  ? 'border-[#D4A017]/20 bg-[#D4A017]/5 hover:border-[#D4A017]/30'
                  : 'border-white/5 bg-white/[0.02] hover:border-white/15'
                }`}>
                <div className="flex items-start gap-2.5">
                  {!notification.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4A017] animate-pulse" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-bold text-white group-hover:text-[#D4A017] transition-colors">
                        {notification.title}
                      </div>
                      <span className="shrink-0 text-[9px] text-white/30 font-medium">
                        {formatDisplayDateTime(notification.createdAt)}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-xs text-white/50 leading-relaxed">
                      {notification.message}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SimpleList>
        </Panel>
      </section>
    </div>
  )
}

function Balance({ label, value, highlight = false }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${highlight
        ? 'bg-gradient-to-br from-[#D4A017]/15 to-transparent border-[#D4A017]/30 shadow-md shadow-[#D4A017]/5'
        : 'bg-white/[0.03] border-white/5'
      }`}>
      {highlight && (
        <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#D4A017]/10 rounded-full blur-xl pointer-events-none" />
      )}
      <div className={`text-[10px] font-black uppercase tracking-wider ${highlight ? 'text-[#D4A017]' : 'text-white/40'}`}>
        {label}
      </div>
      <div className="mt-1.5 text-lg font-black text-white tracking-tight">
        {fmtVND(value)}
      </div>
    </div>
  )
}

function SimpleList({ items = [], empty, children }) {
  if (!items.length) return <EmptyState>{empty}</EmptyState>
  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item, index) => (
        <div key={`${item.id || item.title || item.type}-${index}`}>{children(item)}</div>
      ))}
    </div>
  )
}
