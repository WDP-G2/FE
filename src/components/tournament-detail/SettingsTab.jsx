import { useState } from 'react'
import { toast } from 'sonner'
import { Settings, Trash2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Field from '@/components/ui/Field'
import { Input, Select, TextArea } from '@/components/ui/Input'
import { PanelActions, PanelHeader } from '@/components/ui/Panel'
import { tournamentService } from '@/services/tournamentService'
import { getApiErrorMessage } from '@/utils/apiError'

const STATUS_OPTIONS = [
  ['DRAFT', 'Nháp'],
  ['PUBLISHED', 'Đã công bố'],
  ['OPEN_REGISTRATION', 'Đang mở đăng ký'],
  ['REGISTRATION_CLOSED', 'Đã đóng đăng ký'],
  ['SCHEDULED', 'Đã lên lịch'],
  ['ONGOING', 'Đang diễn ra'],
  ['COMPLETED', 'Đã kết thúc'],
  ['CANCELLED', 'Đã hủy'],
]

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

function makeDraft(tournament) {
  return {
    name: tournament.name ?? '',
    description: tournament.description ?? '',
    location: tournament.location ?? '',
    registrationOpenDate: tournament.registrationOpenDate ?? '',
    registrationCloseDate: tournament.registrationCloseDate ?? '',
    startDate: tournament.startDate ?? '',
    endDate: tournament.endDate ?? '',
    statusCode: tournament.statusCode ?? 'DRAFT',
  }
}

function buildUpdatePayload(tournament, draft) {
  const raw = tournament.raw ?? {}

  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    location: draft.location.trim(),
    bannerUrl: raw.bannerUrl ?? null,
    registrationOpenAt: dateTime(draft.registrationOpenDate, '08:00'),
    registrationCloseAt: dateTime(draft.registrationCloseDate, '17:00'),
    startAt: dateTime(draft.startDate, tournament.startTime || '08:00'),
    endAt: dateTime(draft.endDate, tournament.endTime || '17:00'),
    checkInDeadlineAt: dateTime(draft.registrationCloseDate, '17:30'),
    minTeams: Number(tournament.minTeams || raw.minTeams || 1),
    maxTeams: Number(tournament.maxTeams || raw.maxTeams || 1),
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

function getValidationError(draft) {
  const today = getTodayDate()
  const registrationOpenMin = addDays(today, 1)
  const startDateMin = addDays(today, 7)
  const registrationCloseMax = draft.startDate ? addDays(draft.startDate, -2) : ''

  if (!draft.name.trim()) return 'Tên giải đấu không được để trống'
  if (!draft.location.trim()) return 'Địa điểm không được để trống'
  if (!draft.registrationOpenDate || !draft.registrationCloseDate) return 'Ngày mở và kết thúc đăng ký không được để trống'
  if (draft.registrationOpenDate < registrationOpenMin) return 'Ngày mở đăng ký phải sau ngày tạo ít nhất 1 ngày'
  if (draft.registrationOpenDate > draft.registrationCloseDate) return 'Ngày mở đăng ký không được sau ngày kết thúc đăng ký'
  if (registrationCloseMax && draft.registrationCloseDate > registrationCloseMax) return 'Ngày kết thúc đăng ký phải trước ngày bắt đầu giải ít nhất 2 ngày'
  if (!draft.startDate || !draft.endDate) return 'Ngày bắt đầu và kết thúc không được để trống'
  if (draft.startDate < startDateMin) return 'Ngày bắt đầu giải phải sau thời gian thực tế ít nhất 1 tuần'
  if (draft.endDate <= draft.startDate) return 'Ngày kết thúc phải sau ngày bắt đầu'
  return ''
}

export default function SettingsTab({ tournament, setTournament }) {
  const [draft, setDraft] = useState(() => makeDraft(tournament))
  const [saving, setSaving] = useState(false)
  const today = getTodayDate()
  const registrationOpenMin = addDays(today, 1)
  const startDateMin = addDays(today, 7)
  const registrationCloseMax = draft.startDate ? addDays(draft.startDate, -2) : ''
  const endDateMin = draft.startDate ? addDays(draft.startDate, 1) : startDateMin

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
    const validationError = getValidationError(draft)
    if (validationError) {
      toast.error(validationError)
      return
    }

    try {
      setSaving(true)
      let nextTournament = tournament

      const baseChanged =
        draft.name !== tournament.name ||
        draft.description !== tournament.description ||
        draft.location !== tournament.location ||
        draft.registrationOpenDate !== tournament.registrationOpenDate ||
        draft.registrationCloseDate !== tournament.registrationCloseDate ||
        draft.startDate !== tournament.startDate ||
        draft.endDate !== tournament.endDate

      if (baseChanged) {
        const response = await tournamentService.updateTournament(
          tournament.id,
          buildUpdatePayload(tournament, draft),
        )
        nextTournament = response.data
      }

      if (draft.statusCode !== nextTournament.statusCode) {
        const statusResponse = await tournamentService.updateTournamentStatus(
          tournament.id,
          draft.statusCode,
        )
        nextTournament = statusResponse.data
      }

      setTournament(nextTournament)
      setDraft(makeDraft(nextTournament))
      toast.success('Đã lưu cài đặt giải đấu')
    } catch (error) {
      console.error('Không thể lưu cài đặt giải đấu', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể lưu cài đặt giải đấu')
    } finally {
      setSaving(false)
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
          <Field label="Địa điểm" full>
            <Input value={draft.location} onChange={(event) => updateDraft({ location: event.target.value })} />
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
          <Field label="Trạng thái" full>
            <Select
              value={draft.statusCode}
              onChange={(event) => updateDraft({ statusCode: event.target.value })}
            >
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <PanelActions saving={saving} onCancel={() => setDraft(makeDraft(tournament))} onSave={saveSettings} />
      </Card>
      <Card className="h-fit border-rose-400/25 bg-rose-400/[0.07] p-6">
        <h3 className="mb-2 text-xl font-bold">Vùng nguy hiểm</h3>
        <p className="mb-5 text-sm text-white/55">Hành động không thể hoàn tác.</p>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 font-semibold text-rose-300"
        >
          <Trash2 className="h-5 w-5" />
          Xóa giải đấu
        </button>
      </Card>
    </div>
  )
}
