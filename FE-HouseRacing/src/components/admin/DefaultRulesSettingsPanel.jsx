import { useEffect, useState } from 'react'
import { Save, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import Field from '@/components/ui/Field'
import { TextArea } from '@/components/ui/Input'
import { systemSettingsService } from '@/services/systemSettingsService'
import { getApiErrorMessage } from '@/utils/apiError'

export default function DefaultRulesSettingsPanel() {
  const [savedRules, setSavedRules] = useState('')
  const [draftRules, setDraftRules] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      try {
        setLoading(true)
        const response = await systemSettingsService.getAdminSettings()
        if (!cancelled) {
          const rules = response.data.defaultTournamentRules || ''
          setSavedRules(rules)
          setDraftRules(rules)
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

  const saveRules = async () => {
    const trimmedRules = draftRules.trim()
    if (!trimmedRules) {
      toast.error('Luật mặc định không được để trống')
      return
    }

    try {
      setSaving(true)
      const response = await systemSettingsService.updateDefaultRules(trimmedRules)
      const rules = response.data.defaultTournamentRules || trimmedRules
      setSavedRules(rules)
      setDraftRules(rules)
      toast.success('Đã lưu luật mặc định')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const resetRules = () => {
    setDraftRules(savedRules)
  }

  if (loading) {
    return <div className="p-10 text-center text-white/55">Đang tải luật mặc định...</div>
  }

  return (
    <>
      <div className="p-6">
        <Field label="Luật mẫu áp dụng cho giải đấu mới" full>
          <TextArea
            rows={12}
            spellCheck={false}
            value={draftRules}
            onChange={(event) => setDraftRules(event.target.value)}
            className="min-h-[280px] max-h-[52vh] overflow-y-auto"
          />
          <p className="mt-3 text-sm leading-6 text-white/45">
            Luật được lưu trên trình duyệt và đồng bộ khi tạo/cập nhật giải đấu.
          </p>
        </Field>
      </div>

      <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
        <button
          type="button"
          disabled={saving}
          onClick={resetRules}
          className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-semibold text-white/70 transition hover:bg-white/[0.08] disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" />
          Hủy thay đổi
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={saveRules}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#dda50e] px-5 font-semibold text-white transition hover:bg-[#c8940f] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </>
  )
}
