import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { JUDGE_ROLES } from '@/data/adminJudgeMock'
import { refereeService } from '@/services/refereeService'
import { publishRaceAssignments } from '@/services/refereeAssignmentService'
import { getApiErrorMessage } from '@/utils/apiError'
import AssignedJudgesPanel from './AssignedJudgesPanel'
import AvailableRefereesPanel from './AvailableRefereesPanel'

export default function JudgeAssigner({ tournament, race, onChangeJudges }) {
  const assignments = race.judges ?? []
  const [referees, setReferees] = useState([])
  const [loadingReferees, setLoadingReferees] = useState(true)
  const [refereeError, setRefereeError] = useState('')
  const [saving, setSaving] = useState(false)

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

  const chiefCount = assignments.filter((item) => item.role === 'Trọng tài chính').length
  const hasChief = chiefCount > 0
  const hasDoping = assignments.some((item) => item.role === 'Giám sát doping')
  const ready =
    hasChief &&
    chiefCount <= 1 &&
    hasDoping &&
    assignments.length >= 3

  const addJudge = (refereeId) => {
    if (assignedIds.has(refereeId)) return
    const role = hasChief ? 'Trọng tài biên' : 'Trọng tài chính'
    onChangeJudges([...assignments, { refereeId, role }])
  }

  const removeJudge = (refereeId) => {
    onChangeJudges(assignments.filter((item) => item.refereeId !== refereeId))
  }

  const changeRole = (refereeId, role) => {
    onChangeJudges(
      assignments.map((item) => (item.refereeId === refereeId ? { ...item, role } : item)),
    )
  }

  const submitAssignment = async () => {
    const chief = assignments.find((item) => item.role === 'Trọng tài chính')
    if (!chief) {
      toast.error('Phải có trọng tài chính trước khi gửi phân công')
      return
    }

    try {
      setSaving(true)
      publishRaceAssignments({
        tournament,
        race,
        assignments,
        refereesById,
      })

      await refereeService.assignRaceReferee(race.id, chief.refereeId)

      toast.success('Đã gửi phân công trọng tài. Trọng tài có thể xem cuộc đua được giao.')
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Không thể gửi phân công trọng tài')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <AssignedJudgesPanel
        race={race}
        assignments={assignments}
        refereesById={refereesById}
        saving={saving}
        onClearAll={() => onChangeJudges([])}
        onRemove={removeJudge}
        onChangeRole={changeRole}
        onSubmit={submitAssignment}
        ready={ready}
        hasChief={hasChief}
      />
      <AvailableRefereesPanel
        referees={referees}
        loading={loadingReferees}
        error={refereeError}
        assignedIds={assignedIds}
        onAdd={addJudge}
      />
    </div>
  )
}
