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

function makeDraft(tournament) {
  return {
    name: tournament.name ?? '',
    description: tournament.description ?? '',
    location: tournament.location ?? '',
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
    registrationOpenAt:
      raw.registrationOpenAt ?? dateTime(tournament.registrationOpenDate || draft.startDate, '08:00'),
    registrationCloseAt:
      raw.registrationCloseAt ?? dateTime(tournament.registrationCloseDate || draft.startDate, '17:00'),
    startAt: dateTime(draft.startDate, tournament.startTime || '08:00'),
    endAt: dateTime(draft.endDate, tournament.endTime || '17:00'),
    checkInDeadlineAt:
      raw.checkInDeadlineAt ?? dateTime(tournament.checkInDeadlineDate || draft.startDate, '07:30'),
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
  if (!draft.name.trim()) return 'Tên giải đấu không được để trống'
  if (!draft.location.trim()) return 'Địa điểm không được để trống'
  if (!draft.startDate || !draft.endDate) return 'Ngày bắt đầu và kết thúc không được để trống'
  if (draft.startDate > draft.endDate) return 'Ngày bắt đầu không được sau ngày kết thúc'
  return ''
}

export default function SettingsTab({ tournament, setTournament }) {
  const [draft, setDraft] = useState(() => makeDraft(tournament))
  const [saving, setSaving] = useState(false)

  const updateDraft = (patch) => {
    setDraft((previous) => ({ ...previous, ...patch }))
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
          <Field label="Ngày bắt đầu">
            <Input
              type="date"
              value={draft.startDate}
              onChange={(event) => updateDraft({ startDate: event.target.value })}
            />
          </Field>
          <Field label="Ngày kết thúc">
            <Input
              type="date"
              value={draft.endDate}
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
