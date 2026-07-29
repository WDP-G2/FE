import { useCallback, useEffect, useState } from 'react'
import { Save, Settings, Trash2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import Field from '@/components/ui/Field'
import { MoneyInput } from '@/components/ui/Input'
import { systemSettingsService, readExtraFeeGroups, writeExtraFeeGroups } from '@/services/systemSettingsService'
import { getApiErrorMessage } from '@/utils/apiError'

function createFeeGroup() {
  return {
    id: `fee-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    registrationFee: '',
    lateFee: '',
  }
}

function FeeGroupCard({ title, registrationFee, lateFee, onRegistrationChange, onLateChange, onRemove }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dda50e]/15 text-[#dda50e]">
            <Settings className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-bold text-white">{title}</h3>
            <p className="text-xs text-white/45">Lệ phí đăng ký mặc định và phí trễ hạn</p>
          </div>
        </div>
        {onRemove && (
          <button
            type="button"
            title="Xóa lệ phí"
            aria-label="Xóa lệ phí"
            onClick={onRemove}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/45 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Lệ phí đăng ký mặc định (VNĐ)">
          <MoneyInput
            value={registrationFee}
            onValueChange={onRegistrationChange}
          />
        </Field>
        <Field label="Phí trễ hạn (VNĐ)">
          <MoneyInput
            value={lateFee}
            onValueChange={onLateChange}
          />
        </Field>
      </div>
    </section>
  )
}

export default function DefaultFeesSettingsPanel({ onRegisterAddFee }) {
  const [registrationFee, setRegistrationFee] = useState('')
  const [lateFee, setLateFee] = useState('')
  const [savedRegistrationFee, setSavedRegistrationFee] = useState('')
  const [savedLateFee, setSavedLateFee] = useState('')
  const [extraFeeGroups, setExtraFeeGroups] = useState([])
  const [savedExtraFeeGroups, setSavedExtraFeeGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const addFee = useCallback(() => {
    setExtraFeeGroups((current) => [...current, createFeeGroup()])
  }, [])

  useEffect(() => {
    onRegisterAddFee?.(addFee)
  }, [onRegisterAddFee, addFee])

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      try {
        setLoading(true)
        const response = await systemSettingsService.getAdminSettings()
        const storedExtraFeeGroups = readExtraFeeGroups()
        if (!cancelled) {
          const registration = String(response.data.defaultRegistrationFee ?? '')
          const late = String(response.data.lateCheckInFee ?? '')
          setRegistrationFee(registration)
          setLateFee(late)
          setSavedRegistrationFee(registration)
          setSavedLateFee(late)
          setExtraFeeGroups(storedExtraFeeGroups)
          setSavedExtraFeeGroups(storedExtraFeeGroups)
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

  const updateExtraFeeGroup = (id, patch) => {
    setExtraFeeGroups((current) =>
      current.map((group) => (group.id === id ? { ...group, ...patch } : group)),
    )
  }

  const removeExtraFeeGroup = (id) => {
    setExtraFeeGroups((current) => current.filter((group) => group.id !== id))
  }

  const resetFees = () => {
    setRegistrationFee(savedRegistrationFee)
    setLateFee(savedLateFee)
    setExtraFeeGroups(savedExtraFeeGroups)
  }

  const validateFeeGroup = (group, label) => {
    const defaultRegistrationFee = Number(group.registrationFee)
    const lateCheckInFee = Number(group.lateFee)

    if (!Number.isFinite(defaultRegistrationFee) || defaultRegistrationFee < 0) {
      toast.error(`${label}: lệ phí đăng ký mặc định không hợp lệ`)
      return false
    }
    if (!Number.isFinite(lateCheckInFee) || lateCheckInFee < 0) {
      toast.error(`${label}: phí trễ hạn không hợp lệ`)
      return false
    }
    return true
  }

  const saveFees = async () => {
    if (!validateFeeGroup({ registrationFee, lateFee }, 'Lệ phí mặc định')) return

    for (let index = 0; index < extraFeeGroups.length; index += 1) {
      if (!validateFeeGroup(extraFeeGroups[index], `Lệ phí bổ sung ${index + 1}`)) return
    }

    try {
      setSaving(true)
      const response = await systemSettingsService.updateFees({
        defaultRegistrationFee: Number(registrationFee),
        lateCheckInFee: Number(lateFee),
      })
      const registration = String(response.data.defaultRegistrationFee ?? registrationFee)
      const late = String(response.data.lateCheckInFee ?? lateFee)
      writeExtraFeeGroups(extraFeeGroups)
      setRegistrationFee(registration)
      setLateFee(late)
      setSavedRegistrationFee(registration)
      setSavedLateFee(late)
      setSavedExtraFeeGroups(extraFeeGroups)
      toast.success('Đã lưu cấu hình lệ phí')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-10 text-center text-white/55">Đang tải lệ phí mặc định...</div>
  }

  return (
    <>
      <div className="space-y-5 p-6">
        <FeeGroupCard
          title="Lệ phí mặc định"
          registrationFee={registrationFee}
          lateFee={lateFee}
          onRegistrationChange={setRegistrationFee}
          onLateChange={setLateFee}
        />

        {extraFeeGroups.map((group, index) => (
          <FeeGroupCard
            key={group.id}
            title={`Lệ phí bổ sung ${index + 1}`}
            registrationFee={group.registrationFee}
            lateFee={group.lateFee}
            onRegistrationChange={(value) =>
              updateExtraFeeGroup(group.id, { registrationFee: value })
            }
            onLateChange={(value) => updateExtraFeeGroup(group.id, { lateFee: value })}
            onRemove={() => removeExtraFeeGroup(group.id)}
          />
        ))}
      </div>

      <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
        <button
          type="button"
          disabled={saving}
          onClick={resetFees}
          className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-semibold text-white/70 transition hover:bg-white/[0.08] disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" />
          Hủy thay đổi
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={saveFees}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#dda50e] px-5 font-semibold text-white transition hover:bg-[#c8940f] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
        </button>
      </div>
    </>
  )
}
