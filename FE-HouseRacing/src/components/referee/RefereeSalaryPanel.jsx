import { useEffect, useState } from 'react'
import { Banknote, CheckCircle2, Clock, LoaderCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import { refereePaymentService } from '@/services/refereePaymentService'
import { fmtVND } from '@/utils/formatCurrency'
import { formatDisplayDate } from '@/utils/dateFormat'
import { getApiErrorMessage } from '@/utils/apiError'

function statusLabel(status) {
  if (status === 'PAID') return { text: 'Đã nhận', tone: 'text-emerald-300 bg-emerald-500/15' }
  if (status === 'HELD') return { text: 'Đang giữ', tone: 'text-[#D4A017] bg-[#D4A017]/15' }
  if (status === 'RELEASED') return { text: 'Đã hoàn', tone: 'text-white/50 bg-white/10' }
  return { text: '—', tone: 'text-white/50 bg-white/10' }
}

export default function RefereeSalaryPanel() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError('')
        const data = await refereePaymentService.getRefereePaymentsFromApi()
        if (!cancelled) setPayments(data)
      } catch (err) {
        if (!cancelled) {
          setPayments([])
          setError(getApiErrorMessage(err) || 'Không tải được lịch sử lương')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const paidTotal = payments
    .filter((item) => item.status === 'PAID')
    .reduce((sum, item) => sum + Number(item.amount ?? 0), 0)

  return (
    <Card className="mb-6 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
            <Banknote className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Lương & phụ cấp</h2>
            <p className="text-sm text-white/50">Dữ liệu từ GET /referee/payments</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-white/45">Tổng đã nhận</p>
          <p className="text-2xl font-bold tabular-nums text-emerald-300">
            {loading ? '...' : fmtVND(paidTotal)}
          </p>
        </div>
      </div>

      {error ? (
        <div className="px-6 py-4 text-sm text-red-200">{error}</div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-6 py-10 text-sm text-white/45">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Đang tải...
        </div>
      ) : payments.length ? (
        <div className="divide-y divide-white/5">
          {payments.map((item) => {
            const badge = statusLabel(item.status)
            return (
              <div
                key={item.id ?? `${item.raceId}-${item.status}`}
                className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
              >
                <div>
                  <p className="font-semibold text-white">{item.raceName || `Cuộc đua #${item.raceId}`}</p>
                  <p className="text-sm text-white/50">{item.tournamentName || 'Giải đấu'}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {item.paidAt
                      ? `${formatDisplayDate(item.paidAt?.slice?.(0, 10) ?? item.paidAt, '—')} · ${new Date(item.paidAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                      : item.heldAt
                        ? `Giữ lương: ${formatDisplayDate(item.heldAt?.slice?.(0, 10) ?? item.heldAt, '—')}`
                        : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold tabular-nums text-emerald-300">
                    {item.status === 'PAID' ? '+' : ''}{fmtVND(item.amount)}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.tone}`}>
                    {item.status === 'PAID' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {badge.text}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="px-6 py-10 text-center text-sm text-white/45">
          Chưa có khoản lương/phụ cấp nào. Admin phân công → hệ thống giữ lương → tự thanh toán khi chốt kết quả.
        </div>
      )}
    </Card>
  )
}
