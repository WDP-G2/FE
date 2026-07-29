import { useEffect, useState } from 'react'
import { BadgePercent, Save, ShieldCheck, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import Field from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { financeSettingsService } from '@/services/financeSettingsService'
import { getApiErrorMessage } from '@/utils/apiError'

function parsePercentInput(value) {
  const cleaned = value.replace(/[^\d.]/g, '')
  const parts = cleaned.split('.')
  if (parts.length <= 2) return cleaned
  return `${parts[0]}.${parts.slice(1).join('')}`
}

function BettingToggle({ checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 transition ${
        checked
          ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
          : 'border-white/10 bg-white/[0.04] text-white/75'
      }`}
    >
      <span className="flex items-center gap-3 text-sm font-semibold">
        <ShieldCheck className="h-4 w-4" />
        {checked ? 'Đang bật' : 'Đang tắt'}
      </span>
      <span
        className={`flex h-6 w-11 items-center rounded-full p-1 transition ${
          checked ? 'bg-emerald-400/80' : 'bg-white/15'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </span>
    </button>
  )
}

export default function BettingSettingsPanel() {
  const [bettingEnabled, setBettingEnabled] = useState(false)
  const [betWinningTaxPercent, setBetWinningTaxPercent] = useState('')
  const [savedBettingEnabled, setSavedBettingEnabled] = useState(false)
  const [savedBetWinningTaxPercent, setSavedBetWinningTaxPercent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const hasDirtyFinance = bettingEnabled !== savedBettingEnabled || betWinningTaxPercent !== savedBetWinningTaxPercent
  const canSave = hasDirtyFinance

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      try {
        setLoading(true)
        const financeResponse = await financeSettingsService.getAdminSettings()

        if (cancelled) return

        const nextBettingEnabled = Boolean(financeResponse.data.bettingEnabled)
        const nextTaxPercent = String(financeResponse.data.betWinningTaxPercent ?? '')
        setBettingEnabled(nextBettingEnabled)
        setBetWinningTaxPercent(nextTaxPercent)
        setSavedBettingEnabled(nextBettingEnabled)
        setSavedBetWinningTaxPercent(nextTaxPercent)
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

  const validateSettings = () => {
    const taxPercent = Number(betWinningTaxPercent)
    if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
      toast.error('Thuế thắng cược phải từ 0 đến 100')
      return false
    }

    return true
  }

  const saveSettings = async () => {
    if (!validateSettings()) return

    try {
      setSaving(true)
      const financePayload = {
        bettingEnabled,
        betWinningTaxPercent: Number(betWinningTaxPercent),
      }
      const financeResponse = await financeSettingsService.updateAdminSettings(financePayload)

      const nextTaxPercent = String(financeResponse.data.betWinningTaxPercent ?? betWinningTaxPercent)

      setBettingEnabled(Boolean(financeResponse.data.bettingEnabled))
      setBetWinningTaxPercent(nextTaxPercent)
      setSavedBettingEnabled(Boolean(financeResponse.data.bettingEnabled))
      setSavedBetWinningTaxPercent(nextTaxPercent)
      toast.success('Đã lưu cấu hình đặt cược')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    setBettingEnabled(savedBettingEnabled)
    setBetWinningTaxPercent(savedBetWinningTaxPercent)
  }

  if (loading) {
    return <div className="p-10 text-center text-white/55">Đang tải cấu hình đặt cược...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <section className="max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#dda50e]/15 text-[#dda50e]">
              <BadgePercent className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">Trạng thái đặt cược</h3>
              <p className="text-sm text-white/50">Bật hoặc tắt tính năng cược cho spectator.</p>
            </div>
          </div>

          <div className="space-y-4">
            <BettingToggle checked={bettingEnabled} onToggle={() => setBettingEnabled((current) => !current)} />
            <Field label="Thuế thắng cược (%)">
              <Input
                type="text"
                inputMode="decimal"
                value={betWinningTaxPercent}
                onChange={(event) => setBetWinningTaxPercent(parsePercentInput(event.target.value))}
                placeholder="0"
              />
            </Field>
            <p className="text-xs leading-5 text-white/40">
              Thuế chỉ tính trên phần lãi và được cố định khi tạo kèo. Mức thuế mới chỉ áp dụng
              cho các kèo được tạo sau khi lưu. Khi tắt tính năng, backend sẽ chặn spectator đặt cược.
            </p>
          </div>
        </div>

      </section>

      <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          disabled={saving || !canSave}
          onClick={resetSettings}
          className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-semibold text-white/70 transition hover:bg-white/[0.08] disabled:opacity-50"
        >
          <Undo2 className="h-4 w-4" />
          Hủy thay đổi
        </button>
        <button
          type="button"
          disabled={saving || !canSave}
          onClick={saveSettings}
          className="flex h-11 items-center gap-2 rounded-xl bg-[#dda50e] px-5 font-semibold text-white transition hover:bg-[#c8940f] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Đang lưu...' : 'Lưu cấu hình đặt cược'}
        </button>
      </div>
    </div>
  )
}
