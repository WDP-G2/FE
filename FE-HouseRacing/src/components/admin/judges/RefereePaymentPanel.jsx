import { useCallback, useEffect, useMemo, useState } from 'react'
import { Banknote, CheckCircle2, Clock, LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '@/components/ui/Badge'
import { GlassCard } from '@/pages/admin/AdminLayout'
import { refereePaymentService } from '@/services/refereePaymentService'
import { fmtVND } from '@/utils/formatCurrency'
import {
  isRaceCompletedForRefereePayout,
  refereePayoutBlockedMessage,
} from '@/utils/refereePayoutUtils'

function resolveAssignedRefereeId(race) {
  return race?.raw?.refereeId ?? race?.refereeId ?? null
}

function statusBadge(status) {
  if (status === 'PAID') return { tone: 'green', label: 'Đã thanh toán' }
  if (status === 'HELD') return { tone: 'gold', label: 'Đã giữ lương' }
  if (status === 'RELEASED') return { tone: 'gray', label: 'Đã hoàn lương' }
  return { tone: 'gold', label: 'Chưa có' }
}

export default function RefereePaymentPanel({
  tournament,
  race,
  refereesById = new Map(),
  payoutLocked = false,
}) {
  const [payout, setPayout] = useState(null)
  const [loading, setLoading] = useState(true)

  const assignedRefereeId = useMemo(() => resolveAssignedRefereeId(race), [race])
  const assignedReferee = assignedRefereeId
    ? refereesById.get(String(assignedRefereeId))
    : null
  const assignedName =
    race?.raw?.refereeUsername ||
    race?.refereeName ||
    assignedReferee?.name ||
    payout?.refereeName ||
    ''

  const raceCompleted = useMemo(
    () => isRaceCompletedForRefereePayout(race, tournament),
    [race, tournament],
  )
  const payoutBlockedMessage = useMemo(
    () => refereePayoutBlockedMessage(race, tournament),
    [race, tournament],
  )

  const loadPayoutStatus = useCallback(async () => {
    if (!race?.id) {
      setPayout(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const status = await refereePaymentService.getRacePayoutStatus(race.id)
    setPayout(status)
    setLoading(false)
  }, [race?.id])

  useEffect(() => {
    loadPayoutStatus()
  }, [loadPayoutStatus, assignedRefereeId])

  const badge = statusBadge(payout?.status)
  const displayAmount = payout?.amount > 0 ? payout.amount : 0

  return (
    <GlassCard>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
            <Banknote className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Bước 3 · Lương trọng tài</h2>
            <p className="text-xs text-white/50">
              {tournament.name} · {race.name} · Tự động thanh toán khi chốt kết quả
            </p>
          </div>
        </div>
        <Link
          to="/admin/settings"
          className="text-xs font-semibold text-[#dda50e] hover:underline"
        >
          Cấu hình mức lương
        </Link>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-wider text-white/45">Mức lương đã giữ</p>
            <p className="mt-2 text-2xl font-bold tabular-nums text-[#dda50e]">
              {loading ? '...' : fmtVND(displayAmount)}
            </p>
            <p className="mt-1 text-xs text-white/45">
              {payout?.salaryConfigName || 'Theo cấu hình khi phân công'}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs uppercase tracking-wider text-white/45">Trọng tài được giao</p>
            {assignedRefereeId ? (
              <>
                <p className="mt-2 text-lg font-semibold text-white">{assignedName || 'Trọng tài'}</p>
                <p className="mt-1 text-xs text-white/45">ID: {assignedRefereeId}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-white/45">
                Chưa có trọng tài trên hệ thống. Gửi phân công trước.
              </p>
            )}
          </div>
        </div>

        {!assignedRefereeId ? (
          <div className="rounded-2xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Hoàn thành bước 2 (gửi phân công) trước — hệ thống sẽ giữ lương từ ví admin.
          </div>
        ) : null}

        {assignedRefereeId && !raceCompleted && payout?.status === 'HELD' ? (
          <div className="rounded-2xl border border-sky-300/25 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
            Lương đã được giữ. Thanh toán tự động khi trọng tài chốt kết quả cuộc đua.
          </div>
        ) : null}

        {assignedRefereeId && !raceCompleted && !payout?.status ? (
          <div className="rounded-2xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {payoutBlockedMessage}
          </div>
        ) : null}

        {payoutLocked ? (
          <div className="rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            Lương đã được giữ hoặc thanh toán — không thể thay đổi phân công trọng tài.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-white/70">
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin text-white/45" />
                Đang tải từ API...
              </>
            ) : payout?.status === 'PAID' ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                Đã thanh toán {fmtVND(displayAmount)}
                {payout.paidAt ? ` · ${new Date(payout.paidAt).toLocaleString('vi-VN')}` : ''}
              </>
            ) : payout?.status === 'HELD' ? (
              <>
                <Clock className="h-4 w-4 text-[#dda50e]" />
                Đã giữ lương — chờ chốt kết quả để chuyển vào ví trọng tài
              </>
            ) : assignedRefereeId ? (
              <>Chờ phân công hoàn tất và hệ thống giữ lương</>
            ) : (
              <>Chưa có dữ liệu thanh toán</>
            )}
          </div>

          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>

        <p className="text-xs text-white/40">
          BE tự động thanh toán khi trọng tài chốt kết quả. Trọng tài xem tại Ví của tôi → Lương & phụ cấp.
        </p>
      </div>
    </GlassCard>
  )
}
