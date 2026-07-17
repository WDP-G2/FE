import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Settings, Trash2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import Field from '@/components/ui/Field'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { PanelActions, PanelHeader } from '@/components/ui/Panel'
import { tournamentService, invalidateTournamentListCache } from '@/services/tournamentService'
import { locationSettingsService } from '@/services/locationSettingsService'
import { fetchDefaultTournamentRules } from '@/services/systemSettingsService'
import { useApiCacheStore } from '@/store/apiCacheStore'
import { matchProvinceForTournament } from '@/components/tournament-detail/RacesTab/helpers'
import { getApiErrorMessage } from '@/utils/apiError'

const STATUS_LABELS = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã công bố',
  OPEN_REGISTRATION: 'Đang mở đăng ký',
  REGISTRATION_CLOSED: 'Đã đóng đăng ký',
  SCHEDULED: 'Đã lên lịch',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
}

const STATUS_TRANSITIONS = {
  DRAFT: ['DRAFT', 'PUBLISHED', 'CANCELLED'],
  PUBLISHED: ['PUBLISHED', 'OPEN_REGISTRATION', 'CANCELLED'],
  OPEN_REGISTRATION: ['OPEN_REGISTRATION', 'REGISTRATION_CLOSED'],
  REGISTRATION_CLOSED: ['REGISTRATION_CLOSED', 'SCHEDULED'],
  SCHEDULED: ['SCHEDULED', 'ONGOING'],
  ONGOING: ['ONGOING', 'COMPLETED'],
  COMPLETED: ['COMPLETED'],
  CANCELLED: ['CANCELLED'],
}

function dateTime(date, time = '08:00') {
  return `${date}T${time || '08:00'}:00`
}

function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date, days) {
  if (!date) return ''
  const value = new Date(`${date}T00:00:00`)
  value.setDate(value.getDate() + days)
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function resolveProvinceId(tournament) {
  if (tournament.provinceId != null && tournament.provinceId !== '') {
    return String(tournament.provinceId)
  }
  if (tournament.raw?.provinceId) {
    return String(tournament.raw.provinceId)
  }
  const raceWithProvince = (tournament.races || []).find(
    (race) => race?.provinceId != null && race.provinceId !== '',
  )
  if (raceWithProvince) {
    return String(raceWithProvince.provinceId)
  }
  return ''
}

function makeDraft(tournament, provinces = []) {
  let provinceId = resolveProvinceId(tournament)
  let location = tournament.location ?? ''

  if (!provinceId && provinces.length) {
    const matched = matchProvinceForTournament(tournament, provinces)
    if (matched) {
      provinceId = matched.id
      if (!location.trim()) location = matched.name
    }
  }

  return {
    name: tournament.name ?? '',
    description: tournament.description ?? '',
    location,
    provinceId,
    registrationOpenDate: tournament.registrationOpenDate ?? '',
    registrationCloseDate: tournament.registrationCloseDate ?? '',
    startDate: tournament.startDate ?? '',
    endDate: tournament.endDate ?? '',
    statusCode: tournament.statusCode ?? 'DRAFT',
    minTeams: Number(tournament.minTeams || 1),
    maxTeams: Number(tournament.maxTeams || 1),
    minHorsesPerOwner: Number(tournament.minHorsesPerOwner || 4),
    maxHorsesPerOwner: Number(tournament.maxHorsesPerOwner || 10),
    rules: tournament.rules ?? '',
  }
}

function buildUpdatePayload(tournament, draft) {
  const raw = tournament.raw ?? {}

  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    location: draft.location.trim(),
    provinceId: draft.provinceId || null,
    bannerUrl: raw.bannerUrl ?? null,
    registrationOpenAt: dateTime(draft.registrationOpenDate, '08:00'),
    registrationCloseAt: dateTime(draft.registrationCloseDate, '17:00'),
    startAt: dateTime(draft.startDate, tournament.startTime || '08:00'),
    endAt: dateTime(draft.endDate, tournament.endTime || '17:00'),
    checkInDeadlineAt: dateTime(draft.registrationCloseDate, '17:30'),
    minTeams: Number(draft.minTeams),
    maxTeams: Number(draft.maxTeams),
    minHorsesPerOwner: Number(draft.minHorsesPerOwner),
    maxHorsesPerOwner: Number(draft.maxHorsesPerOwner),
    rules: draft.rules.trim(),
    jockeyChallengeEnabled: Boolean(raw.jockeyChallengeEnabled),
    jockeyChallengeFirstPoints: Number(raw.jockeyChallengeFirstPoints || 3),
    jockeyChallengeSecondPoints: Number(raw.jockeyChallengeSecondPoints || 2),
    jockeyChallengeThirdPoints: Number(raw.jockeyChallengeThirdPoints || 1),
    jockeyChallengePrizes: Array.isArray(raw.jockeyChallengePrizes)
      ? raw.jockeyChallengePrizes.map((prize) => ({
          rank: Number(prize.rank || 1),
          amount: Number(prize.amount || 0),
          note: prize.note || '',
        }))
      : [],
  }
}

function hasBaseFieldChanges(tournament, draft) {
  return (
    draft.name !== tournament.name ||
    draft.description !== tournament.description ||
    draft.location !== tournament.location ||
    String(draft.provinceId) !== String(tournament.provinceId) ||
    draft.registrationOpenDate !== tournament.registrationOpenDate ||
    draft.registrationCloseDate !== tournament.registrationCloseDate ||
    draft.startDate !== tournament.startDate ||
    draft.endDate !== tournament.endDate ||
    Number(draft.minTeams) !== Number(tournament.minTeams) ||
    Number(draft.maxTeams) !== Number(tournament.maxTeams) ||
    Number(draft.minHorsesPerOwner) !== Number(tournament.minHorsesPerOwner) ||
    Number(draft.maxHorsesPerOwner) !== Number(tournament.maxHorsesPerOwner) ||
    draft.rules.trim() !== (tournament.rules || '').trim()
  )
}

function getStatusTransitionError(currentStatus, nextStatus, tournament = null) {
  const allowed = STATUS_TRANSITIONS[currentStatus] || [currentStatus]
  if (!allowed.includes(nextStatus)) {
    return 'Không thể chuyển sang trạng thái này từ trạng thái hiện tại'
  }
  if (currentStatus === 'ONGOING' && nextStatus === 'COMPLETED') {
    const races = Array.isArray(tournament?.races) ? tournament.races : []
    const pending = races.filter(
      (race) => race?.statusCode && race.statusCode !== 'RESULT_CONFIRMED',
    )
    if (pending.length > 0) {
      return `Còn ${pending.length} cuộc đua chưa ghi nhận kết quả. Trọng tài cần hoàn tất trước khi kết thúc giải.`
    }
  }
  return ''
}

function getValidationError(draft, original = null) {
  const today = getTodayDate()
  const registrationOpenMin = addDays(today, 1)
  const startDateMin = addDays(today, 7)
  const registrationCloseMax = draft.startDate ? addDays(draft.startDate, -2) : ''
  const registrationOpenChanged =
    !original || draft.registrationOpenDate !== original.registrationOpenDate
  const registrationCloseChanged =
    !original || draft.registrationCloseDate !== original.registrationCloseDate
  const startDateChanged = !original || draft.startDate !== original.startDate
  const endDateChanged = !original || draft.endDate !== original.endDate

  if (!draft.name.trim()) return 'Tên giải đấu không được để trống'
  if (!draft.provinceId) return 'Vui lòng chọn tỉnh/thành phố'
  if (Number(draft.minTeams) <= 0 || Number(draft.maxTeams) <= 0) return 'Giới hạn đội phải lớn hơn 0'
  if (Number(draft.minTeams) > Number(draft.maxTeams)) return 'Số đội tối thiểu không được lớn hơn tối đa'
  if (Number(draft.minHorsesPerOwner) <= 0 || Number(draft.maxHorsesPerOwner) <= 0) return 'Số ngựa mỗi tài khoản phải lớn hơn 0'
  if (Number(draft.minHorsesPerOwner) > Number(draft.maxHorsesPerOwner)) return 'Số ngựa tối thiểu mỗi tài khoản không được lớn hơn tối đa'
  if (!draft.registrationOpenDate || !draft.registrationCloseDate) return 'Ngày mở và kết thúc đăng ký không được để trống'
  if (registrationOpenChanged && draft.registrationOpenDate < registrationOpenMin) {
    return 'Ngày mở đăng ký phải sau ngày tạo ít nhất 1 ngày'
  }
  if (draft.registrationOpenDate > draft.registrationCloseDate) return 'Ngày mở đăng ký không được sau ngày kết thúc đăng ký'
  if (
    registrationCloseChanged &&
    registrationCloseMax &&
    draft.registrationCloseDate > registrationCloseMax
  ) {
    return 'Ngày kết thúc đăng ký phải trước ngày bắt đầu giải ít nhất 2 ngày'
  }
  if (!draft.startDate || !draft.endDate) return 'Ngày bắt đầu và kết thúc không được để trống'
  if (startDateChanged && draft.startDate < startDateMin) {
    return 'Ngày bắt đầu giải phải sau thời gian thực tế ít nhất 1 tuần'
  }
  if (endDateChanged && draft.endDate <= draft.startDate) return 'Ngày kết thúc phải sau ngày bắt đầu'
  return ''
}

export default function SettingsTab({ tournament, setTournament }) {
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => makeDraft(tournament))
  const [systemDefaultRules, setSystemDefaultRules] = useState(tournament.rules ?? '')
  const [saving, setSaving] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [provinces, setProvinces] = useState([])
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [confirmState, setConfirmState] = useState(null)

  const closeConfirm = () => setConfirmState(null)
  const askConfirm = (options) => setConfirmState(options)
  const runConfirm = () => {
    const action = confirmState?.onConfirm
    closeConfirm()
    action?.()
  }
  const savedStatusCodeRef = useRef(tournament.statusCode ?? 'DRAFT')
  const today = getTodayDate()
  const registrationOpenMin = addDays(today, 1)
  const startDateMin = addDays(today, 7)
  const registrationCloseMax = draft.startDate ? addDays(draft.startDate, -2) : ''
  const endDateMin = draft.startDate ? addDays(draft.startDate, 1) : startDateMin
  const statusOptions = STATUS_TRANSITIONS[tournament.statusCode] || [tournament.statusCode]

  useEffect(() => {
    savedStatusCodeRef.current = tournament.statusCode ?? 'DRAFT'
    setDraft(makeDraft(tournament))
  }, [tournament])

  useEffect(() => {
    if (!provinces.length) return

    setDraft((previous) => {
      if (previous.provinceId) return previous

      const resolved = resolveProvinceId(tournament)
      if (resolved) {
        return { ...previous, provinceId: resolved }
      }

      const matched = matchProvinceForTournament(tournament, provinces)
      if (!matched) return previous

      return {
        ...previous,
        provinceId: matched.id,
        location: previous.location?.trim() ? previous.location : matched.name,
      }
    })
  }, [provinces, tournament])

  useEffect(() => {
    return () => {
      setSaving(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function syncDefaultRules() {
      try {
        const rules = await fetchDefaultTournamentRules()
        if (!cancelled && rules) {
          setSystemDefaultRules(rules)
          setDraft((previous) => ({ ...previous, rules }))
        }
      } catch {
        // Keep tournament rules if system settings cannot be loaded.
      }
    }

    syncDefaultRules()
    return () => {
      cancelled = true
    }
  }, [tournament.id])

  useEffect(() => {
    let cancelled = false

    async function loadProvinces() {
      try {
        setLoadingProvinces(true)
        const response = await locationSettingsService.getProvinces()
        if (!cancelled) {
          setProvinces(
            response.data.filter(
              (province) => province.active || province.id === String(tournament.provinceId),
            ),
          )
        }
      } catch {
        if (!cancelled) setProvinces([])
      } finally {
        if (!cancelled) setLoadingProvinces(false)
      }
    }

    loadProvinces()
    return () => {
      cancelled = true
    }
  }, [tournament.provinceId])

  const updateDraft = (patch) => {
    setDraft((previous) => {
      if ('startDate' in patch) {
        const nextStartDate = patch.startDate
        const nextRegistrationCloseMax = addDays(nextStartDate, -2)
        return {
          ...previous,
          ...patch,
          endDate:
            previous.endDate && previous.endDate <= nextStartDate
              ? addDays(nextStartDate, 1)
              : previous.endDate,
          registrationCloseDate:
            previous.registrationCloseDate && previous.registrationCloseDate > nextRegistrationCloseMax
              ? nextRegistrationCloseMax
              : previous.registrationCloseDate,
        }
      }

      if ('registrationOpenDate' in patch) {
        const nextRegistrationOpenDate = patch.registrationOpenDate
        return {
          ...previous,
          ...patch,
          registrationCloseDate:
            previous.registrationCloseDate && previous.registrationCloseDate < nextRegistrationOpenDate
              ? nextRegistrationOpenDate
              : previous.registrationCloseDate,
        }
      }

      return { ...previous, ...patch }
    })
  }

  const saveSettings = async () => {
    const draftForSave = { ...draft, rules: systemDefaultRules }
    const baseChanged = hasBaseFieldChanges(tournament, draftForSave)
    const statusChanged = draft.statusCode !== savedStatusCodeRef.current

    if (!baseChanged && !statusChanged) {
      toast.info('Không có thay đổi để lưu')
      return
    }

    if (baseChanged) {
      const validationError = getValidationError(draftForSave, tournament)
      if (validationError) {
        toast.error(validationError)
        return
      }
    }

    if (statusChanged) {
      const statusError = getStatusTransitionError(savedStatusCodeRef.current, draft.statusCode, tournament)
      if (statusError) {
        toast.error(statusError)
        return
      }
    }

    try {
      setSaving(true)
      let nextTournament = tournament

      if (baseChanged) {
        const response = await tournamentService.updateTournament(
          tournament.id,
          buildUpdatePayload(tournament, draftForSave),
        )
        nextTournament = response.data
      }

      if (statusChanged) {
        const statusResponse = await tournamentService.updateTournamentStatus(
          tournament.id,
          draft.statusCode,
        )
        nextTournament = statusResponse.data
      }

      const syncedTournament = {
        ...nextTournament,
        rules: systemDefaultRules,
        statusCode: nextTournament.statusCode ?? draft.statusCode,
      }

      savedStatusCodeRef.current = syncedTournament.statusCode
      useApiCacheStore.getState().setCache(`admin:tournament:${tournament.id}`, syncedTournament)
      invalidateTournamentListCache()
      setTournament(syncedTournament)
      setDraft(makeDraft(syncedTournament, provinces))
      toast.success(
        statusChanged && !baseChanged ? 'Đã cập nhật trạng thái giải đấu' : 'Đã lưu cài đặt giải đấu',
      )
    } catch (error) {
      console.error('Không thể lưu cài đặt giải đấu', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể lưu cài đặt giải đấu')
      setDraft((previous) => ({
        ...previous,
        statusCode: savedStatusCodeRef.current,
      }))
    } finally {
      setSaving(false)
    }
  }

  const scheduleTournament = () => {
    askConfirm({
      title: 'Lên lịch giải đấu',
      message: `Lên lịch giải "${tournament.name}"? Các cuộc đua sẽ chuyển sang trạng thái "Sắp diễn ra" để trọng tài check-in.`,
      confirmLabel: 'Lên lịch',
      onConfirm: performScheduleTournament,
    })
  }

  const performScheduleTournament = async () => {
    try {
      setScheduling(true)
      const response = await tournamentService.scheduleTournament(tournament.id)
      savedStatusCodeRef.current = response.data.statusCode ?? savedStatusCodeRef.current
      const syncedTournament = { ...response.data, rules: systemDefaultRules }
      useApiCacheStore.getState().setCache(`admin:tournament:${tournament.id}`, syncedTournament)
      invalidateTournamentListCache()
      setTournament(syncedTournament)
      setDraft(makeDraft(syncedTournament, provinces))
      toast.success('Đã lên lịch giải đấu — trọng tài có thể check-in ngựa')
    } catch (error) {
      console.error('Không thể lên lịch giải đấu', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể lên lịch giải đấu')
    } finally {
      setScheduling(false)
    }
  }

  const deleteTournament = () => {
    askConfirm({
      title: 'Xóa giải đấu',
      message: `Xóa giải đấu "${tournament.name}"? Hành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa giải đấu',
      tone: 'danger',
      onConfirm: performDeleteTournament,
    })
  }

  const performDeleteTournament = async () => {
    try {
      setDeleting(true)
      await tournamentService.deleteTournament(tournament.id)
      invalidateTournamentListCache()
      useApiCacheStore.getState().removeCache(`admin:tournament:${tournament.id}`)
      useApiCacheStore.getState().removeCache('admin:tournaments')
      toast.success('Đã xóa giải đấu')
      navigate('/admin/tournaments', { replace: true })
    } catch (error) {
      console.error('Không thể xóa giải đấu', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể xóa giải đấu')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
      <Card>
        <PanelHeader icon={Settings} title="Cài đặt giải đấu" subtitle="Thông tin chung và trạng thái" />
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="Tên giải đấu" full>
            <Input value={draft.name} onChange={(event) => updateDraft({ name: event.target.value })} />
          </Field>
          <Field label="Mô tả" full>
            <TextArea
              value={draft.description}
              onChange={(event) => updateDraft({ description: event.target.value })}
            />
          </Field>
          <Field label="Tỉnh/Thành phố" full>
            <Select
              value={draft.provinceId}
              disabled={loadingProvinces}
              onChange={(event) => {
                const provinceId = event.target.value
                const applyProvince = () => {
                  const province = provinces.find((item) => item.id === provinceId)
                  updateDraft({
                    provinceId,
                    location: province?.name || draft.location,
                  })
                }

                if (
                  tournament.races.length > 0 &&
                  String(provinceId) !== String(tournament.provinceId)
                ) {
                  askConfirm({
                    title: 'Đổi tỉnh/thành phố',
                    message:
                      'Giải đã có cuộc đua. Backend sẽ từ chối đổi tỉnh nếu địa điểm đua không thuộc tỉnh mới. Tiếp tục chọn?',
                    confirmLabel: 'Tiếp tục',
                    onConfirm: applyProvince,
                  })
                  return
                }

                applyProvince()
              }}
            >
              <option value="">{loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}</option>
              {provinces.map((province) => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Ngày mở đăng ký">
            <Input
              type="date"
              value={draft.registrationOpenDate}
              min={registrationOpenMin}
              max={draft.registrationCloseDate || registrationCloseMax}
              onChange={(event) => updateDraft({ registrationOpenDate: event.target.value })}
            />
          </Field>
          <Field label="Ngày kết thúc đăng ký">
            <Input
              type="date"
              value={draft.registrationCloseDate}
              min={draft.registrationOpenDate || registrationOpenMin}
              max={registrationCloseMax}
              onChange={(event) => updateDraft({ registrationCloseDate: event.target.value })}
            />
          </Field>
          <Field label="Ngày bắt đầu">
            <Input
              type="date"
              value={draft.startDate}
              min={startDateMin}
              onChange={(event) => updateDraft({ startDate: event.target.value })}
            />
          </Field>
          <Field label="Ngày kết thúc">
            <Input
              type="date"
              value={draft.endDate}
              min={endDateMin}
              onChange={(event) => updateDraft({ endDate: event.target.value })}
            />
          </Field>
          <Field label="Số đội tối thiểu">
            <Input
              type="number"
              min="1"
              value={draft.minTeams}
              onChange={(event) => updateDraft({ minTeams: Number(event.target.value) })}
            />
          </Field>
          <Field label="Số đội tối đa">
            <Input
              type="number"
              min={Math.max(1, Number(draft.minTeams))}
              value={draft.maxTeams}
              onChange={(event) => updateDraft({ maxTeams: Number(event.target.value) })}
            />
          </Field>
          <Field label="Số ngựa tối thiểu / tài khoản">
            <Input
              type="number"
              min="1"
              value={draft.minHorsesPerOwner}
              onChange={(event) => {
                const value = Number(event.target.value)
                updateDraft({
                  minHorsesPerOwner: value,
                  maxHorsesPerOwner: Math.max(Number(draft.maxHorsesPerOwner), value),
                })
              }}
            />
          </Field>
          <Field label="Số ngựa tối đa / tài khoản">
            <Input
              type="number"
              min={Number(draft.minHorsesPerOwner)}
              value={draft.maxHorsesPerOwner}
              onChange={(event) => updateDraft({ maxHorsesPerOwner: Number(event.target.value) })}
            />
          </Field>
          <Field label="Trạng thái" full>
            <Select
              value={draft.statusCode}
              onChange={(event) => updateDraft({ statusCode: event.target.value })}
            >
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {STATUS_LABELS[value] || value}
                </option>
              ))}
            </Select>
            {tournament.statusCode === 'PUBLISHED' && statusOptions.includes('OPEN_REGISTRATION') && (
              <p className="mt-2 text-xs text-white/45">
                Để mở đăng ký, giải cần có ít nhất một cuộc đua và cấu hình giải thưởng đầy đủ.
              </p>
            )}
            {tournament.statusCode === 'REGISTRATION_CLOSED' && (
              <div className="mt-3 rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/10 p-4">
                <p className="text-sm text-white/75">
                  Giải đã đóng đăng ký. Bấm lên lịch để các cuộc đua chuyển sang "Sắp diễn ra" — trọng tài mới check-in được.
                </p>
                <button
                  type="button"
                  onClick={scheduleTournament}
                  disabled={saving || scheduling || deleting}
                  className="mt-3 inline-flex h-11 items-center rounded-xl bg-[#dda50e] px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {scheduling ? 'Đang lên lịch...' : 'Lên lịch giải đấu'}
                </button>
              </div>
            )}
          </Field>
          <Field label="Luật giải đấu" full>
            <TextArea value={draft.rules} disabled rows={8} />
            <p className="mt-2 text-xs text-white/45">
              Đồng bộ từ Cài đặt hệ thống → Luật mặc định. Lưu cài đặt để cập nhật luật cho giải này.
            </p>
          </Field>
        </div>
        <PanelActions
          saving={saving}
          onCancel={() => {
            savedStatusCodeRef.current = tournament.statusCode ?? 'DRAFT'
            setDraft({ ...makeDraft(tournament, provinces), rules: systemDefaultRules })
          }}
          onSave={saveSettings}
        />
      </Card>
      <Card className="h-fit border-rose-400/25 bg-rose-400/[0.07] p-6">
        <h3 className="mb-2 text-xl font-bold">Vùng nguy hiểm</h3>
        <p className="mb-5 text-sm text-white/55">Hành động không thể hoàn tác.</p>
        <button
          type="button"
          onClick={deleteTournament}
          disabled={saving || deleting}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 font-semibold text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-5 w-5" />
          {deleting ? 'Đang xóa...' : 'Xóa giải đấu'}
        </button>
      </Card>
      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title}
        message={confirmState?.message}
        confirmLabel={confirmState?.confirmLabel}
        tone={confirmState?.tone}
        onConfirm={runConfirm}
        onCancel={closeConfirm}
      />
    </div>
  )
}
