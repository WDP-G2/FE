import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Users, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { PanelHeader } from '@/components/ui/Panel'
import { raceRegistrationService } from '@/services/raceRegistrationService'
import { useApiCacheStore } from '@/store/apiCacheStore'
import { getApiErrorMessage } from '@/utils/apiError'
import { formatDisplayDateTime } from '@/utils/dateFormat'
import { fmtVND } from '@/utils/formatCurrency'

const participantTabs = [
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
]

function actionPayloadId(registration) {
  return registration.rawId ?? registration.id
}

function invalidateTournamentCaches(tournamentId) {
  const cache = useApiCacheStore.getState()
  cache.removeCache(`admin:tournament:${tournamentId}`)
  cache.removeCache('admin:tournaments')
}

function ActionButton({ children, icon: Icon, tone = 'gold', disabled, onClick }) {
  const tones = {
    gold: 'border-[#dda50e]/40 bg-[#dda50e]/15 text-[#fff4c2] hover:bg-[#dda50e]/25',
    red: 'border-rose-400/40 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25',
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  )
}

function RegistrationTable({
  rows,
  emptyText,
  savingId,
  showActions = false,
  onApprove,
  onReject,
}) {
  const headers = ['Cuộc đua', 'Ngựa', 'Chủ ngựa', 'Jockey', 'Phí', 'Trạng thái', 'Ngày tạo']
  if (showActions) headers.push('Thao tác')

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px]">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
            {headers.map((header) => (
              <th key={header} className="px-5 py-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!rows.length && (
            <tr>
              <td colSpan={headers.length} className="px-5 py-9 text-center text-sm text-white/45">
                {emptyText}
              </td>
            </tr>
          )}

          {rows.map((registration) => {
            const disabled = savingId === String(actionPayloadId(registration))

            return (
              <tr
                key={registration.id}
                className="border-b border-white/5 text-sm text-white/70 last:border-0"
              >
                <td className="px-5 py-4 font-semibold text-white">
                  {registration.raceName || `Race #${registration.raceId}`}
                </td>
                <td className="px-5 py-4">{registration.horseName || 'Chưa cập nhật'}</td>
                <td className="px-5 py-4">{registration.ownerUsername || 'Chưa cập nhật'}</td>
                <td className="px-5 py-4">{registration.jockeyUsername || 'Chưa cập nhật'}</td>
                <td className="px-5 py-4 font-semibold text-white/85">
                  <div>{fmtVND(registration.entryFeeAmount + registration.depositAmount)}</div>
                  <div className="text-[10px] font-normal text-white/45">Phí {fmtVND(registration.entryFeeAmount)} · Cọc {fmtVND(registration.depositAmount)}</div>
                </td>
                <td className="px-5 py-4">
                  <Badge tone={registration.statusTone}>{registration.status}</Badge>
                </td>
                <td className="px-5 py-4 text-white/55">
                  {formatDisplayDateTime(registration.createdAt, 'Chưa cập nhật')}
                </td>
                {showActions && (
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <ActionButton
                        icon={CheckCircle2}
                        disabled={disabled}
                        onClick={() => onApprove(registration)}
                      >
                        Duyệt
                      </ActionButton>
                      <ActionButton
                        icon={XCircle}
                        tone="red"
                        disabled={disabled}
                        onClick={() => onReject(registration)}
                      >
                        Từ chối
                      </ActionButton>
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function ParticipantsTab({ tournament }) {
  const [registrations, setRegistrations] = useState([])
  const [activeTab, setActiveTab] = useState('pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [savingId, setSavingId] = useState('')

  const pendingRegistrations = useMemo(
    () => registrations.filter((registration) => registration.statusCode === 'PENDING'),
    [registrations],
  )
  const approvedRegistrations = useMemo(
    () => registrations.filter((registration) => registration.statusCode === 'APPROVED'),
    [registrations],
  )
  const activeRows = activeTab === 'approved' ? approvedRegistrations : pendingRegistrations

  useEffect(() => {
    if (!tournament?.id) return undefined

    let cancelled = false

    async function loadRegistrations() {
      setLoading(true)
      setError('')

      try {
        const data = await raceRegistrationService.getAdminTournamentRegistrations(tournament.id)
        if (!cancelled) setRegistrations(data)
      } catch (requestError) {
        if (!cancelled) {
          setError(getApiErrorMessage(requestError) || 'Không thể tải danh sách đăng ký')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRegistrations()

    return () => {
      cancelled = true
    }
  }, [tournament?.id])

  const updateRegistration = (nextRegistration) => {
    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === nextRegistration.id ? nextRegistration : registration,
      ),
    )
    if (tournament?.id) invalidateTournamentCaches(tournament.id)
  }

  const approveRegistration = async (registration) => {
    const id = actionPayloadId(registration)
    setSavingId(String(id))

    try {
      const nextRegistration = await raceRegistrationService.approveRegistration(id)
      updateRegistration(nextRegistration)
      toast.success('Đã duyệt đăng ký thi đấu')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError) || 'Không thể duyệt đăng ký')
    } finally {
      setSavingId('')
    }
  }

  const rejectRegistration = async (registration) => {
    const promptedNote = window.prompt('Lý do từ chối đăng ký', 'Không đạt điều kiện duyệt')
    if (promptedNote === null) return

    const id = actionPayloadId(registration)
    setSavingId(String(id))

    try {
      const nextRegistration = await raceRegistrationService.rejectRegistration(
        id,
        promptedNote || 'Không đạt điều kiện duyệt',
      )
      updateRegistration(nextRegistration)
      toast.success('Đã từ chối đăng ký thi đấu')
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError) || 'Không thể từ chối đăng ký')
    } finally {
      setSavingId('')
    }
  }

  return (
    <Card>
      <PanelHeader
        icon={Users}
        title="Người tham gia"
        subtitle={`${approvedRegistrations.length} đã duyệt · ${pendingRegistrations.length} chờ duyệt`}
      />

      <div className="flex flex-wrap gap-2 border-b border-white/10 p-4">
        {participantTabs.map((tab) => {
          const count = tab.key === 'approved' ? approvedRegistrations.length : pendingRegistrations.length
          const active = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                active
                  ? 'bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/20'
                  : 'border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {tab.label}
              <span className="rounded-full bg-black/20 px-2 py-0.5 text-xs">{count}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-3 border-b border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="px-5 py-9 text-center text-sm text-white/45">
          Đang tải danh sách đăng ký...
        </div>
      ) : (
        <RegistrationTable
          rows={activeRows}
          savingId={savingId}
          showActions={activeTab === 'pending'}
          emptyText={
            activeTab === 'approved'
              ? 'Chưa có hồ sơ đăng ký đã duyệt'
              : 'Không có hồ sơ đăng ký đang chờ duyệt'
          }
          onApprove={approveRegistration}
          onReject={rejectRegistration}
        />
      )}
    </Card>
  )
}
