import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { bettingService } from '@/services/bettingService'
import { fmtVND } from '@/utils/formatCurrency'
import { formatDisplayDateTime } from '@/utils/dateFormat'
import { EmptyState, ErrorState, LoadingState, Panel } from './spectatorUi'

function betStatusLabel(status) {
  if (status === 'PENDING') return 'Đang chờ'
  if (status === 'WON') return 'Thắng cược'
  if (status === 'LOST') return 'Thua cược'
  if (status === 'CANCELLED') return 'Đã hủy'
  if (status === 'REFUNDED') return 'Đã hoàn tiền'
  if (status === 'SETTLED') return 'Đã chốt'
  return status || '-'
}

export default function SpectatorBets() {
  const [bets, setBets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadBets = async () => {
    setLoading(true)
    setError('')
    try {
      setBets(await bettingService.getMyBets())
    } catch (err) {
      setError(err?.message || 'Không tải được lịch sử cược')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBets()
  }, [])

  if (loading) return <LoadingState label="Đang tải lịch sử cược..." />
  if (error) return <ErrorState message={error} onRetry={loadBets} />

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wide text-[#D4A017]">Lịch sử cược</p>
        <h2 className="text-3xl font-black text-white">Lịch sử đặt cược</h2>
      </section>

      <Panel>
        {bets.length === 0 ? (
          <EmptyState>Bạn chưa có lệnh đặt cược nào.</EmptyState>
        ) : (
          <div className="space-y-3">
            {bets.map((bet) => (
              <article
                key={bet.id}
                className="rounded-xl border border-white/10 bg-white/[0.035] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-[#D4A017]" />
                      <h3 className="truncate font-black text-white">{bet.raceName}</h3>
                    </div>
                    <p className="mt-1 text-sm text-white/50">{bet.horseName}</p>
                    <p className="mt-1 text-xs text-white/38">{formatDisplayDateTime(bet.placedAt)}</p>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[420px]">
                    <Metric label="Tiền cược" value={fmtVND(bet.stakeAmount)} />
                    <Metric label="Có thể nhận" value={fmtVND(bet.potentialPayoutAmount)} />
                    <Metric label="Trạng thái" value={betStatusLabel(bet.status)} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-3">
      <div className="text-[10px] font-bold uppercase tracking-wide text-white/35">{label}</div>
      <div className="mt-1 font-black text-white">{value}</div>
    </div>
  )
}
