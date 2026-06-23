import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, CalendarClock, CircleDollarSign, Wallet } from 'lucide-react'
import { spectatorService } from '@/services/spectatorService'
import { fmtVND } from '@/utils/formatCurrency'
import { formatDisplayDateTime } from '@/utils/dateFormat'
import { EmptyState, ErrorState, LoadingState, Panel } from './spectatorUi'

const QUICK_LINK_ROUTES = {
  Tournaments: '/spectator/tournaments',
  Races: '/spectator/tournaments',
  Betting: '/spectator/betting',
  Leaderboard: '/spectator/tournaments',
  Wallet: '/spectator/wallet',
  Notifications: '/spectator/notifications',
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A017]/15 text-[#D4A017]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 text-sm font-semibold text-white/50">{label}</div>
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
      setError(err?.message || 'Khong tai duoc dashboard spectator')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard()
  }, [])

  if (loading) return <LoadingState label="Dang tai dashboard..." />
  if (error) return <ErrorState message={error} onRetry={loadDashboard} />

  const summary = dashboard?.businessSummary || {}
  const wallet = dashboard?.wallet || {}

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#D4A017]">Dashboard</p>
          <h2 className="text-3xl font-black text-white">Tong quan khan gia</h2>
        </div>
        <Link
          to="/spectator/wallet"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#D4A017] px-4 py-2 text-sm font-black text-white transition hover:bg-[#B8941F]"
        >
          <Wallet className="h-4 w-4" />
          Mo vi
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Giai dang mo" value={summary.openTournamentCount} icon={CalendarClock} />
        <StatCard label="Keo dang mo" value={summary.openBetMarketCount} icon={CircleDollarSign} />
        <StatCard label="Tong tien cuoc" value={fmtVND(summary.totalBetStake)} icon={Wallet} />
        <StatCard label="Tong payout" value={fmtVND(summary.totalBetPayout)} icon={CircleDollarSign} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Panel title="So du vi">
          <div className="grid gap-3 sm:grid-cols-3">
            <Balance label="Kha dung" value={wallet.availableBalance} />
            <Balance label="Tam giu" value={wallet.holdBalance} />
            <Balance label="Tong" value={wallet.totalBalance} />
          </div>
        </Panel>

        <Panel title="Loi tat">
          <div className="grid gap-2 sm:grid-cols-2">
            {(dashboard?.quickLinks || []).map((link) => {
              const to = QUICK_LINK_ROUTES[link.label] || '#'
              const enabled = link.enabled && to !== '#'
              const className = `rounded-xl border px-3 py-3 text-sm font-bold transition ${
                enabled
                  ? 'border-white/10 bg-white/[0.04] text-white/75 hover:border-[#D4A017]/45 hover:text-[#D4A017]'
                  : 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/30'
              }`

              return enabled ? (
                <Link key={link.label} to={to} className={className}>
                  {link.label}
                </Link>
              ) : (
                <div key={link.label} className={className}>
                  {link.label} · Coming soon
                </div>
              )
            })}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Panel title="Keo sap dien ra">
          <SimpleList items={dashboard?.upcoming} empty="Chua co keo dang mo">
            {(item) => (
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <div className="font-bold text-white">{item.title}</div>
                <div className="mt-1 text-xs text-white/45">
                  {item.status || 'OPEN'} · {formatDisplayDateTime(item.at)}
                </div>
              </div>
            )}
          </SimpleList>
        </Panel>

        <Panel title="Giao dich gan day">
          <SimpleList items={dashboard?.recentTransactions} empty="Chua co giao dich">
            {(tx) => (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <div className="min-w-0">
                  <div className="truncate font-bold text-white">{tx.note || tx.type || 'Giao dich'}</div>
                  <div className="text-xs text-white/45">{formatDisplayDateTime(tx.createdAt)}</div>
                </div>
                <div className="shrink-0 text-sm font-black text-[#D4A017]">{fmtVND(tx.amount)}</div>
              </div>
            )}
          </SimpleList>
        </Panel>

        <Panel title="Thong bao moi">
          <SimpleList items={dashboard?.recentNotifications} empty="Chua co thong bao">
            {(notification) => (
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <div className="flex items-start gap-2">
                  <Bell className="mt-0.5 h-4 w-4 shrink-0 text-[#D4A017]" />
                  <div className="min-w-0">
                    <div className="truncate font-bold text-white">{notification.title}</div>
                    <div className="line-clamp-2 text-xs text-white/45">{notification.message}</div>
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

function Balance({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-white/38">{label}</div>
      <div className="mt-1 text-lg font-black text-white">{fmtVND(value)}</div>
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
