import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { refereeService } from '@/services/refereeService'
import { fetchAdminInvitations } from '@/services/refereeInvitationService'
import {
  refereePaymentService,
  isRacePayoutLocked,
  REFEREE_PAYOUTS_UPDATED_EVENT,
} from '@/services/refereePaymentService'
import { isRaceCompletedForRefereePayout } from '@/utils/refereePayoutUtils'
import { getApiErrorMessage } from '@/utils/apiError'
import AssignedJudgesPanel from './AssignedJudgesPanel'
import RefereeInvitePanel from './RefereeInvitePanel'
import RefereePaymentPanel from './RefereePaymentPanel'
import JudgeWorkflowSteps from './JudgeWorkflowSteps'

const DEFAULT_JUDGE_ROLE = 'Trọng tài chính'
const MAX_REFEREES_PER_RACE = 1

function resolveAssignedRefereeId(race) {
  return race?.raw?.refereeId ?? race?.refereeId ?? null
}

export default function JudgeAssigner({ tournament, race, onChangeJudges, onAssigned }) {
  const assignments = race.judges ?? []
  const [referees, setReferees] = useState([])
  const [loadingReferees, setLoadingReferees] = useState(true)
  const [refereeError, setRefereeError] = useState('')
  const [saving, setSaving] = useState(false)
  const [payoutStatus, setPayoutStatus] = useState(null)

  const payoutLocked = isRacePayoutLocked(payoutStatus)
  const isPaid = payoutStatus?.status === 'PAID'
  const officialRefereeId = resolveAssignedRefereeId(race)
  const isOfficiallyAssigned = Boolean(officialRefereeId)
  const isRaceCompleted = isRaceCompletedForRefereePayout(race, tournament)

  const refreshPayoutStatus = useCallback(async () => {
    if (!race?.id) {
      setPayoutStatus(null)
      return
    }
    const status = await refereePaymentService.getRacePayoutStatus(race.id)
    setPayoutStatus(status)
  }, [race?.id])

  useEffect(() => {
    refreshPayoutStatus()
  }, [refreshPayoutStatus, officialRefereeId])

  useEffect(() => {
    const handleUpdated = () => refreshPayoutStatus()
    window.addEventListener(REFEREE_PAYOUTS_UPDATED_EVENT, handleUpdated)
    return () => window.removeEventListener(REFEREE_PAYOUTS_UPDATED_EVENT, handleUpdated)
  }, [refreshPayoutStatus])

  useEffect(() => {
    let cancelled = false

    async function loadReferees() {
      try {
        setLoadingReferees(true)
        const data = await refereeService.getAvailableReferees()
        if (!cancelled) {
          setReferees(data)
          setRefereeError('')
        }
      } catch (error) {
        if (!cancelled) {
          setReferees([])
          setRefereeError(getApiErrorMessage(error) || 'Không thể tải danh sách trọng tài')
        }
      } finally {
        if (!cancelled) setLoadingReferees(false)
      }
    }

    loadReferees()
    return () => {
      cancelled = true
    }
  }, [])

  const refereesById = useMemo(
    () => new Map(referees.map((referee) => [referee.id, referee])),
    [referees],
  )
  const assignedIds = useMemo(
    () => new Set(assignments.map((item) => item.refereeId)),
    [assignments],
  )

  const addJudge = (refereeId) => {
    if (payoutLocked) {
      toast.error('Cuộc đua này đã thanh toán lương — không thể thêm trọng tài')
      return
    }
    if (assignedIds.has(refereeId)) return
    if (assignments.length >= MAX_REFEREES_PER_RACE) {
      toast.info('Mỗi cuộc đua chỉ có một trọng tài chính. Hãy gỡ trọng tài hiện tại trước khi chọn người khác.')
      return
    }
    onChangeJudges([...assignments, { refereeId, role: DEFAULT_JUDGE_ROLE }])
  }

  const removeJudge = (refereeId) => {
    if (payoutLocked) {
      toast.error('Cuộc đua này đã thanh toán lương — không thể thay đổi phân công')
      return
    }
    onChangeJudges(assignments.filter((item) => item.refereeId !== refereeId))
  }

  const inviteReferee = async (referee, message = '') => {
    if (!referee?.id) return
    if (payoutLocked) {
      toast.error('Cuộc đua này đã thanh toán lương — không thể gửi thêm lời mời')
      return
    }
    if (officialRefereeId && String(officialRefereeId) !== String(referee.id)) {
      toast.error('Cuộc đua đã có trọng tài. Không thể đổi trọng tài sau khi phân công.')
      return
    }

    try {
      setSaving(true)
      await refereeService.createRefereeInvitation({
        raceId: race.id,
        refereeId: referee.id,
        message,
      })
      await fetchAdminInvitations({ notify: true })
      toast.success(`Đã gửi lời mời tới ${referee.name}. Trọng tài sẽ thấy ở mục "Lời mời".`)
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Không thể gửi lời mời trọng tài')
      throw error
    } finally {
      setSaving(false)
    }
  }

  const submitAssignment = async () => {
    if (payoutLocked) {
      toast.error('Cuộc đua này đã thanh toán lương — không thể gửi lại phân công')
      return
    }

    const primary = assignments[0]
    if (!primary) {
      toast.error('Phải chọn ít nhất một trọng tài trước khi gửi phân công')
      return
    }

    if (isOfficiallyAssigned) {
      toast.info('Phân công đã được xác nhận — trọng tài đã chấp nhận lời mời.')
      return
    }

    toast.info(
      'Đang chờ trọng tài chấp nhận lời mời. Sau khi chấp nhận, phân công sẽ được xác nhận tự động.',
    )
  }

  return (
    <div className="space-y-6">
      <JudgeWorkflowSteps
        hasSelection={assignments.length > 0 || isOfficiallyAssigned}
        isAssigned={isOfficiallyAssigned}
        isRaceCompleted={isRaceCompleted}
        isPaid={isPaid}
        isLocked={payoutLocked}
      />

      <RefereeInvitePanel
        tournament={tournament}
        race={race}
        locked={payoutLocked}
        saving={saving}
        maxReached={assignments.length >= MAX_REFEREES_PER_RACE}
        assignedIds={assignedIds}
        officialRefereeId={officialRefereeId}
        onSelectForAssignment={(referee) => addJudge(referee.id)}
        onInviteReferee={inviteReferee}
      />

      <AssignedJudgesPanel
        race={race}
        assignments={assignments}
        refereesById={refereesById}
        saving={saving}
        locked={payoutLocked}
        isOfficiallyAssigned={isOfficiallyAssigned}
        onRemove={removeJudge}
        onSubmit={submitAssignment}
      />

      <RefereePaymentPanel
        tournament={tournament}
        race={race}
        refereesById={refereesById}
        payoutLocked={payoutLocked}
      />
    </div>
  )
}
