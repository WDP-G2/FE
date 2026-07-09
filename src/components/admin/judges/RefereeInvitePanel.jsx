import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Lock, Mail, Send, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Badge from '@/components/ui/Badge'
import { GlassCard, GhostButton, PrimaryButton } from '@/pages/admin/AdminLayout'
import { refereeService } from '@/services/refereeService'
import {
  fetchAdminInvitations,
  getInvitationSummaryForRace,
  getInvitationsForRace,
  getLatestInvitationForReferee,
  invitationStatusLabel,
  invitationStatusTone,
  REFEREE_INVITATIONS_UPDATED_EVENT,
} from '@/services/refereeInvitationService'
import { getApiErrorMessage } from '@/utils/apiError'
import { refereeInitial } from '@/data/adminJudgeMock'

const STATUS_SORT = { ACCEPTED: 0, PENDING: 1, NONE: 2, DECLINED: 3 }
const POLL_MS = 12_000

function cardBorderClass(status) {
  if (status === 'ACCEPTED') return 'border-emerald-400/40 bg-emerald-500/[0.06]'
  if (status === 'PENDING') return 'border-[#D4A017]/40 bg-[#D4A017]/[0.06]'
  if (status === 'DECLINED') return 'border-white/10 bg-white/[0.02] opacity-80'
  return 'border-white/10 bg-white/[0.03]'
}

export default function RefereeInvitePanel({
  tournament,
  race,
  onInviteReferee,
  locked: lockedProp,
  saving = false,
  officialRefereeId = null,
}) {
  const [referees, setReferees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [sendingId, setSendingId] = useState('')
  const [invitations, setInvitations] = useState([])
  const [summary, setSummary] = useState({ pending: 0, accepted: 0, declined: 0 })

  const locked = Boolean(lockedProp)

  const refreshInvitations = () => {
    if (!race?.id) {
      setInvitations([])
      setSummary({ pending: 0, accepted: 0, declined: 0 })
      return
    }
    setInvitations(getInvitationsForRace(race.id))
    const nextSummary = getInvitationSummaryForRace(race.id)
    setSummary({
      pending: nextSummary.pending,
      accepted: nextSummary.accepted,
      declined: nextSummary.declined,
    })
  }

  useEffect(() => {
    let cancelled = false

    const syncInvitations = async () => {
      await fetchAdminInvitations({ notify: false })
      if (!cancelled) refreshInvitations()
    }

    async function loadReferees() {
      try {
        setLoading(true)
        const data = await refereeService.getAvailableReferees()
        if (!cancelled) {
          setReferees(data)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setReferees([])
          setError(getApiErrorMessage(err) || 'Không thể tải danh sách trọng tài')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadReferees()
    syncInvitations()

    const timer = setInterval(() => syncInvitations(), POLL_MS)
    const handleInvitationsUpdated = () => syncInvitations()
    const onFocus = () => syncInvitations()
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncInvitations()
    }

    window.addEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, handleInvitationsUpdated)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, handleInvitationsUpdated)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [race?.id])

  const refereeRows = useMemo(() => {
    return referees
      .map((referee) => {
        const invitation = race?.id ? getLatestInvitationForReferee(race.id, referee.id) : null
        const status = invitation?.status ?? 'NONE'
        return { referee, invitation, status }
      })
      .sort((a, b) => {
        const orderA = STATUS_SORT[a.status] ?? 9
        const orderB = STATUS_SORT[b.status] ?? 9
        if (orderA !== orderB) return orderA - orderB
        return a.referee.name.localeCompare(b.referee.name, 'vi')
      })
  }, [referees, race?.id, invitations])

  const handleInvite = async (referee) => {
    if (!race?.id) return
    if (locked) {
      toast.error('Cuộc đua này đã thanh toán — không thể gửi thêm lời mời')
      return
    }

    setSendingId(referee.id)
    try {
      await onInviteReferee?.(referee, message)
      await fetchAdminInvitations({ notify: true })
      refreshInvitations()
    } finally {
      setSendingId('')
    }
  }

  return (
    <GlassCard>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-[#D4A017]" />
          <div>
            <h3 className="font-bold text-white">Bước 1 · Mời & chọn trọng tài · {race.name}</h3>
            <p className="text-xs text-white/50">
              Gửi lời mời, xem phản hồi đồng ý/từ chối và chọn vào tổ trọng tài
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {summary.accepted > 0 ? (
            <Badge tone="green">{summary.accepted} đã đồng ý</Badge>
          ) : null}
          {summary.pending > 0 ? (
            <Badge tone="gold">{summary.pending} chờ phản hồi</Badge>
          ) : null}
          {summary.declined > 0 ? (
            <Badge tone="gray">{summary.declined} đã từ chối</Badge>
          ) : null}
        </div>
      </div>

      {locked ? (
        <div className="mx-5 mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          Cuộc đua đã thanh toán lương — không thể gửi thêm lời mời.
        </div>
      ) : null}

      {summary.accepted > 0 ? (
        <div className="mx-5 mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Có trọng tài đã đồng ý — bấm &quot;Chọn&quot; để thêm vào tổ trọng tài bên dưới.
        </div>
      ) : summary.declined > 0 && summary.accepted === 0 ? (
        <div className="mx-5 mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          Một số trọng tài đã từ chối — hãy mời trọng tài khác hoặc gửi lại lời mời.
        </div>
      ) : null}

      <div className="space-y-4 p-5">
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/45">
            Lời nhắn kèm theo (tuỳ chọn)
          </label>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            disabled={locked}
            placeholder="VD: Mời bạn làm trọng tài chính cuộc đua này..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-[#D4A017]/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-white/40 sm:col-span-2">
              Đang tải danh sách trọng tài...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-400/25 bg-rose-400/[0.07] p-6 text-center text-xs text-rose-200 sm:col-span-2">
              {error}
            </div>
          ) : refereeRows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-white/40 sm:col-span-2">
              Chưa có trọng tài hoạt động trong hệ thống.
            </div>
          ) : (
            refereeRows.map(({ referee, invitation, status }) => {
              const declined = status === 'DECLINED'
              const accepted = status === 'ACCEPTED'
              const isOfficial =
                officialRefereeId != null && String(officialRefereeId) === String(referee.id)
              const hasAccepted = accepted || isOfficial
              const someoneElseAssigned = officialRefereeId != null && !isOfficial
              const busy = saving || sendingId === referee.id
              const displayStatus = hasAccepted ? 'ACCEPTED' : status

              return (
                <div
                  key={referee.id}
                  className={`flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center ${
                    hasAccepted ? 'border-emerald-400/40 bg-emerald-500/[0.06]' : cardBorderClass(displayStatus)
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 font-bold text-white/70">
                      {refereeInitial(referee.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-white">{referee.name}</span>
                        {hasAccepted ? (
                          <Badge tone="green">Đã chấp nhận</Badge>
                        ) : displayStatus !== 'NONE' ? (
                          <Badge tone={invitationStatusTone(displayStatus)}>
                            {invitationStatusLabel(displayStatus)}
                          </Badge>
                        ) : (
                          <Badge tone="gray">Chưa mời</Badge>
                        )}
                      </div>
                      {referee.email ? (
                        <div className="truncate text-[11px] text-white/55">{referee.email}</div>
                      ) : null}
                      <div className="truncate text-[10px] text-white/40">
                        {referee.experience > 0 ? `${referee.experience} năm` : 'Chưa có kinh nghiệm'} ·{' '}
                        {referee.specialty}
                      </div>
                      {invitation?.invitedAt ? (
                        <div className="mt-1 text-[10px] text-white/35">
                          Gửi lúc {new Date(invitation.invitedAt).toLocaleString('vi-VN')}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    {hasAccepted ? (
                      <GhostButton disabled className="!px-3 !py-2 text-xs opacity-60">
                        Đã nhận lời
                      </GhostButton>
                    ) : status === 'PENDING' ? (
                      <GhostButton disabled className="!px-3 !py-2 text-xs opacity-60">
                        Đã gửi lời mời
                      </GhostButton>
                    ) : (
                      <PrimaryButton
                        icon={Send}
                        disabled={locked || busy || someoneElseAssigned}
                        onClick={() => handleInvite(referee)}
                        className="!px-3 !py-2 text-xs"
                      >
                        {busy ? 'Đang gửi...' : declined ? 'Mời lại' : 'Mời trọng tài'}
                      </PrimaryButton>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </GlassCard>
  )
}
