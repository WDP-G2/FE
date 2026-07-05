import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Mail, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Badge from '@/components/ui/Badge'
import { GlassCard, PrimaryButton, GhostButton } from '@/pages/admin/AdminLayout'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/utils/apiError'
import {
  fetchRefereeInvitations,
  getInvitationsForReferee,
  invitationStatusLabel,
  invitationStatusTone,
  REFEREE_INVITATIONS_UPDATED_EVENT,
  respondToInvitation,
} from '@/services/refereeInvitationService'
import { formatDisplayDate } from '@/utils/dateFormat'

const POLL_MS = 12_000

export default function RefereeInvitationsPanel() {
  const user = useAuthStore((state) => state.user)
  const [invitations, setInvitations] = useState([])
  const [respondingId, setRespondingId] = useState('')
  const [loading, setLoading] = useState(true)

  const loadInvitations = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    try {
      await fetchRefereeInvitations({ notify: false })
      setInvitations(getInvitationsForReferee(user))
    } catch (error) {
      if (!silent) {
        toast.error(getApiErrorMessage(error) || 'Không thể tải lời mời')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }, [user])

  useEffect(() => {
    let cancelled = false

    const refresh = async ({ silent = false } = {}) => {
      if (cancelled) return
      await loadInvitations({ silent })
    }

    refresh()

    const timer = setInterval(() => refresh({ silent: true }), POLL_MS)

    const onFocus = () => refresh({ silent: true })
    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh({ silent: true })
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, onFocus)

    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, onFocus)
    }
  }, [loadInvitations])

  const handleRespond = async (invitationId, status) => {
    setRespondingId(invitationId)
    try {
      await respondToInvitation(invitationId, user, status)
      setInvitations(getInvitationsForReferee(user))
      toast.success(
        status === 'ACCEPTED'
          ? 'Đã chấp nhận lời mời — cuộc đua sẽ hiện tại tab Điều hành'
          : 'Đã từ chối lời mời',
      )
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Không thể cập nhật lời mời')
    } finally {
      setRespondingId('')
    }
  }

  const pending = invitations.filter((item) => item.status === 'PENDING')
  const history = invitations.filter((item) => item.status !== 'PENDING')

  return (
    <div className="space-y-6">
      <GlassCard className="overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[#D4A017]" />
            <div>
              <h3 className="font-bold text-white">Lời mời làm trọng tài</h3>
              <p className="text-xs text-white/50">
                Lời mời từ admin · {pending.length} chờ phản hồi
              </p>
            </div>
          </div>
        </div>

        {pending.length ? (
          <div className="divide-y divide-white/5">
            {pending.map((item) => (
              <div key={item.id} className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold text-white">{item.tournamentName}</div>
                    <div className="text-sm text-[#D4A017]/90">{item.raceName}</div>
                    <div className="mt-1 text-xs text-white/50">
                      {formatDisplayDate(item.raceDate, 'Chưa có ngày')}
                      {item.raceTime ? ` · ${item.raceTime}` : ''}
                      {item.tournamentLocation ? ` · ${item.tournamentLocation}` : ''}
                    </div>
                    {item.message ? (
                      <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                        {item.message}
                      </p>
                    ) : null}
                  </div>
                  <Badge tone={invitationStatusTone(item.status)}>
                    {invitationStatusLabel(item.status)}
                  </Badge>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <GhostButton
                    icon={XCircle}
                    disabled={respondingId === item.id}
                    onClick={() => handleRespond(item.id, 'DECLINED')}
                  >
                    Từ chối
                  </GhostButton>
                  <PrimaryButton
                    icon={CheckCircle2}
                    disabled={respondingId === item.id}
                    onClick={() => handleRespond(item.id, 'ACCEPTED')}
                  >
                    Chấp nhận
                  </PrimaryButton>
                </div>
              </div>
            ))}
          </div>
        ) : loading ? (
          <div className="p-10 text-center text-sm text-white/40">Đang tải lời mời...</div>
        ) : (
          <div className="p-10 text-center text-sm text-white/40">
            Hiện chưa có lời mời mới. Khi admin gửi lời mời, bạn sẽ thấy tại đây.
          </div>
        )}
      </GlassCard>

      {history.length ? (
        <GlassCard className="overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <h3 className="font-bold text-white">Lịch sử lời mời</h3>
          </div>
          <div className="divide-y divide-white/5">
            {history.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <div className="font-semibold text-white">
                    {item.tournamentName} · {item.raceName}
                  </div>
                  <div className="text-xs text-white/45">
                    {item.respondedAt
                      ? `Phản hồi ${new Date(item.respondedAt).toLocaleString('vi-VN')}`
                      : item.invitedAt
                        ? `Mời lúc ${new Date(item.invitedAt).toLocaleString('vi-VN')}`
                        : ''}
                  </div>
                </div>
                <Badge tone={invitationStatusTone(item.status)}>
                  {invitationStatusLabel(item.status)}
                </Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}
    </div>
  )
}
