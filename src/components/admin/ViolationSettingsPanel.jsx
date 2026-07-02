import { useEffect, useState } from 'react'
import { AlertTriangle, Pencil, Plus, Save, Trash2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/Input'
import { systemSettingsService } from '@/services/systemSettingsService'
import { getApiErrorMessage } from '@/utils/apiError'
import {
  VIOLATION_SEVERITY_LABELS,
  VIOLATION_RESULT_ACTION_LABELS,
  buildViolationRulesPayload,
  buildViolationTypesPayload,
  mapViolationRulesFromApi,
  mapViolationTypesFromApi,
  validateViolationRules,
  validateViolationTypes,
} from '@/utils/violationSettings'

function createEmptyViolationType() {
  return {
    localId: `type-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    code: '',
    label: '',
    active: true,
  }
}

export default function ViolationSettingsPanel() {
  const [savedTypes, setSavedTypes] = useState([])
  const [draftTypes, setDraftTypes] = useState([])
  const [savedRules, setSavedRules] = useState([])
  const [draftRules, setDraftRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingTypeId, setEditingTypeId] = useState(null)

  const applySettingsFromResponse = (response) => {
    const types = mapViolationTypesFromApi(response.data.violationTypes)
    const rules = mapViolationRulesFromApi(response.data.violationPenaltyRules)

    setSavedTypes(types)
    setDraftTypes(types)
    setSavedRules(rules)
    setDraftRules(rules)
  }

  const reloadSettingsFromBe = async ({ withLoading = false } = {}) => {
    try {
      if (withLoading) setLoading(true)
      const response = await systemSettingsService.getAdminSettings()
      applySettingsFromResponse(response)
      return true
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      return false
    } finally {
      if (withLoading) setLoading(false)
    }
  }

  useEffect(() => {
    reloadSettingsFromBe({ withLoading: true })
  }, [])

  const updateType = (localId, patch) => {
    setDraftTypes((current) =>
      current.map((item) => (item.localId === localId ? { ...item, ...patch } : item)),
    )
  }

  const removeType = async (localId) => {
    const isPersistedItem = savedTypes.some((item) => item.localId === localId)

    // Local draft row (new, not saved to BE) can be removed directly.
    if (!isPersistedItem) {
      setDraftTypes((current) => current.filter((item) => item.localId !== localId))
      if (editingTypeId === localId) setEditingTypeId(null)
      return
    }

    // Delete persisted row against the last known valid BE snapshot.
    const nextSavedTypes = savedTypes.filter((item) => item.localId !== localId)
    const typeError = validateViolationTypes(nextSavedTypes)
    if (typeError) {
      toast.error(typeError)
      return
    }

    try {
      setSaving(true)
      const payload = buildViolationTypesPayload(nextSavedTypes)
      await systemSettingsService.updateViolationTypes(payload)
      await reloadSettingsFromBe()
      toast.success('Đã xóa loại vi phạm')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      await reloadSettingsFromBe()
    } finally {
      setSaving(false)
    }
  }

  const addType = () => {
    const next = createEmptyViolationType()
    setDraftTypes((current) => [...current, next])
    setEditingTypeId(next.localId)
  }

  const updateRule = (severity, patch) => {
    setDraftRules((current) =>
      current.map((item) => (item.severity === severity ? { ...item, ...patch } : item)),
    )
  }

  const resetChanges = () => {
    setDraftTypes(savedTypes)
    setDraftRules(savedRules)
    setEditingTypeId(null)
  }

  const saveSettings = async () => {
    const typeError = validateViolationTypes(draftTypes)
    if (typeError) {
      toast.error(typeError)
      return
    }

    const ruleError = validateViolationRules(draftRules)
    if (ruleError) {
      toast.error(ruleError)
      return
    }

    try {
      setSaving(true)
      const typesPayload = buildViolationTypesPayload(draftTypes)
      const rulesPayload = buildViolationRulesPayload(draftRules)

      await systemSettingsService.updateViolationTypes(typesPayload)
      const response = await systemSettingsService.updateViolationRules(rulesPayload)
      applySettingsFromResponse(response)
      setEditingTypeId(null)
      toast.success('Đã lưu cấu hình vi phạm')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
      await reloadSettingsFromBe()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-white/55">Đang tải cấu hình vi phạm...</div>
  }

  return (
    <div className="space-y-8 p-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Loại vi phạm</h3>
            <p className="mt-1 text-sm text-white/50">
              Danh sách đang bật sẽ hiển thị trong dropdown của trọng tài
            </p>
          </div>
          <button
            type="button"
            onClick={addType}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#dda50e] px-4 text-sm font-semibold text-white transition hover:bg-[#c8940f]"
          >
            <Plus className="h-4 w-4" />
            Thêm loại
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-5 py-3 font-semibold">Thứ tự</th>
                <th className="px-5 py-3 font-semibold">Tên hiển thị</th>
                <th className="px-5 py-3 font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {draftTypes.map((item, index) => (
                <tr key={item.localId} className="border-b border-white/5">
                  <td className="px-5 py-4 text-white/70">{index + 1}</td>
                  <td className="px-5 py-4">
                    <Input
                      value={item.label}
                      onChange={(event) => updateType(item.localId, { label: event.target.value })}
                      placeholder="Ví dụ: Lái nguy hiểm"
                      maxLength={100}
                      disabled={editingTypeId !== item.localId}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingTypeId((current) => (current === item.localId ? null : item.localId))
                        }
                        className="rounded-lg p-2 text-[#D4A017]/70 hover:bg-[#D4A017]/10 hover:text-[#D4A017] disabled:opacity-30"
                        title={editingTypeId === item.localId ? 'Khóa chỉnh sửa' : 'Chỉnh sửa'}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeType(item.localId)}
                        disabled={draftTypes.length <= 1 || saving}
                        className="rounded-lg p-2 text-[#D4A017]/70 hover:bg-[#D4A017]/10 hover:text-[#D4A017] disabled:opacity-30"
                        title="Xóa loại vi phạm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[#dda50e]" />
            <div>
              <h3 className="text-lg font-bold text-white">Cấu hình xử phạt vi phạm</h3>
              <p className="mt-1 text-sm text-white/50">
                Quy tắc này được snapshot vào biên bản khi trọng tài ghi vi phạm
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-5 py-3 font-semibold">Mức độ</th>
                <th className="px-5 py-3 font-semibold">Tác động kết quả</th>
                <th className="px-5 py-3 font-semibold">Giây phạt</th>
              </tr>
            </thead>
            <tbody>
              {draftRules.map((rule) => {
                const timePenaltyEnabled = rule.resultAction === 'TIME_PENALTY'

                return (
                  <tr key={rule.severity} className="border-b border-white/5">
                    <td className="px-5 py-4 font-semibold text-white">
                      {VIOLATION_SEVERITY_LABELS[rule.severity]}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={rule.resultAction}
                        onChange={(event) =>
                          updateRule(rule.severity, {
                            resultAction: event.target.value,
                            timePenaltySeconds:
                              event.target.value === 'TIME_PENALTY' ? rule.timePenaltySeconds || 1 : 0,
                          })
                        }
                        className="h-11 w-full min-w-[220px] rounded-xl border border-white/10 bg-[#0A1628] px-3 text-sm text-white outline-none focus:border-[#dda50e]/50"
                      >
                        {Object.entries(VIOLATION_RESULT_ACTION_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={String(rule.timePenaltySeconds ?? 0)}
                        disabled={!timePenaltyEnabled}
                        onChange={(event) =>
                          updateRule(rule.severity, {
                            timePenaltySeconds: Number(event.target.value.replace(/\D/g, '') || 0),
                          })
                        }
                        className="max-w-[120px]"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          disabled={saving}
          onClick={resetChanges}
          className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-semibold text-white/70 transition hover:bg-white/[0.08] disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" />
          Hủy thay đổi
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={saveSettings}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#dda50e] px-5 font-semibold text-white transition hover:bg-[#c8940f] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </div>
  )
}
