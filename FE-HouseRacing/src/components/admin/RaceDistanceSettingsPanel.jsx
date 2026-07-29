import { useEffect, useState } from 'react'
import { Plus, Ruler, Save, Trash2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { systemSettingsService } from '@/services/systemSettingsService'
import { getApiErrorMessage } from '@/utils/apiError'

function normalizedMeters(distances) {
  return [...new Set(distances.map(Number).filter((value) => Number.isInteger(value) && value > 0))]
    .sort((first, second) => first - second)
}

export default function RaceDistanceSettingsPanel() {
  const [savedDistances, setSavedDistances] = useState([])
  const [draftDistances, setDraftDistances] = useState([])
  const [newDistance, setNewDistance] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      try {
        setLoading(true)
        const response = await systemSettingsService.getAdminSettings()
        if (!cancelled) {
          const distances = normalizedMeters(
            response.data.raceDistances.map((distance) => distance.meters),
          )
          setSavedDistances(distances)
          setDraftDistances(distances)
        }
      } catch (error) {
        if (!cancelled) toast.error(getApiErrorMessage(error))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadSettings()
    return () => {
      cancelled = true
    }
  }, [])

  const addDistance = () => {
    const meters = Number(newDistance)
    if (!Number.isInteger(meters) || meters <= 0) {
      toast.error('Khoảng cách phải là số nguyên dương')
      return
    }
    if (draftDistances.includes(meters)) {
      toast.error('Khoảng cách này đã tồn tại')
      return
    }
    setDraftDistances((current) => normalizedMeters([...current, meters]))
    setNewDistance('')
  }

  const saveDistances = async () => {
    if (!draftDistances.length) {
      toast.error('Phải có ít nhất một khoảng cách đua')
      return
    }

    try {
      setSaving(true)
      const response = await systemSettingsService.updateRaceDistances(draftDistances)
      const distances = normalizedMeters(
        response.data.raceDistances.map((distance) => distance.meters),
      )
      setSavedDistances(distances)
      setDraftDistances(distances)
      setNewDistance('')
      toast.success('Đã lưu cấu hình khoảng cách đua')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const resetDistances = () => {
    setDraftDistances(savedDistances)
    setNewDistance('')
  }

  if (loading) {
    return <div className="p-8 text-center text-white/55">Đang tải khoảng cách đua...</div>
  }

  return (
    <div className="grid gap-8 p-6 lg:grid-cols-[360px_1fr]">
      <section>
        <h3 className="text-lg font-bold">Thêm khoảng cách</h3>
        <p className="mt-1 text-sm text-white/50">Nhập số nguyên theo đơn vị mét.</p>
        <div className="mt-5 flex gap-3">
          <div className="relative min-w-0 flex-1">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={newDistance}
              placeholder="Ví dụ: 800"
              className="pr-12"
              onChange={(event) => setNewDistance(event.target.value.replace(/\D/g, ''))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addDistance()
                }
              }}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/45">
              m
            </span>
          </div>
          <button
            type="button"
            onClick={addDistance}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#dda50e] px-4 font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <p className="mt-4 text-xs leading-5 text-white/40">
          Danh sách mới chỉ được áp dụng sau khi bấm Lưu cấu hình.
        </p>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <Ruler className="h-5 w-5 text-[#dda50e]" />
          <div>
            <h3 className="text-lg font-bold">Khoảng cách đang cấu hình</h3>
            <p className="text-sm text-white/50">{draftDistances.length} lựa chọn</p>
          </div>
        </div>

        {draftDistances.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {draftDistances.map((meters) => (
              <div
                key={meters}
                className="flex h-14 items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4"
              >
                <span className="font-semibold tabular-nums">{meters}m</span>
                <button
                  type="button"
                  title={`Xóa ${meters}m`}
                  aria-label={`Xóa ${meters}m`}
                  onClick={() => setDraftDistances((current) => current.filter((item) => item !== meters))}
                  className="rounded-lg p-2 text-white/45 hover:bg-rose-400/10 hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-rose-400/25 bg-rose-400/[0.07] p-5 text-sm text-rose-200">
            Phải có ít nhất một khoảng cách đua trước khi lưu.
          </div>
        )}

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={resetDistances}
            className="flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 font-semibold text-white/65 disabled:opacity-50"
          >
            <Undo2 className="h-4 w-4" />
            Hủy thay đổi
          </button>
          <button
            type="button"
            disabled={saving || !draftDistances.length}
            onClick={saveDistances}
            className="flex h-11 items-center gap-2 rounded-xl bg-[#dda50e] px-5 font-semibold text-white disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </section>
    </div>
  )
}
