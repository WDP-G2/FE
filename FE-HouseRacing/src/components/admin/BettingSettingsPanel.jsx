import { useEffect, useMemo, useState } from 'react'
import { BadgePercent, Plus, Save, ShieldCheck, Trash2, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import Field from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { financeSettingsService } from '@/services/financeSettingsService'
import { getApiErrorMessage } from '@/utils/apiError'

function createShareRow(rank = '') {
  return {
    id: `share-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    rank: String(rank),
    jockeyPercent: '',
    ownerPercent: '',
  }
}

function formatPercent(value) {
  if (value === '' || value == null) return ''
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return ''
  return numeric.toFixed(2).replace(/\.00$/, '')
}

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

function PrizeShareRow({ row, onChange, onRemove, canRemove }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[140px_1fr_1fr_180px_48px] lg:items-end">
      <Field label="Thứ hạng">
        <Input
          type="text"
          inputMode="numeric"
          value={row.rank}
          onChange={(event) => onChange({ rank: event.target.value.replace(/\D/g, '') })}
        />
      </Field>
      <Field label="Jockey %">
        <Input
          type="text"
          inputMode="decimal"
          value={row.jockeyPercent}
          onChange={(event) => onChange({ jockeyPercent: parsePercentInput(event.target.value) })}
        />
      </Field>
      <Field label="Chủ ngựa %">
        <Input type="text" value={row.ownerPercent} readOnly className="opacity-90" />
      </Field>
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/50">
        BE tính tự động theo 100 - jockey
      </div>
      <button
        type="button"
        disabled={!canRemove}
        onClick={onRemove}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 text-white/45 transition hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-300 disabled:opacity-40"
        title="Xóa dòng"
        aria-label="Xóa dòng"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function BettingSettingsPanel() {
  const [bettingEnabled, setBettingEnabled] = useState(false)
  const [betWinningTaxPercent, setBetWinningTaxPercent] = useState('')
  const [savedBettingEnabled, setSavedBettingEnabled] = useState(false)
  const [savedBetWinningTaxPercent, setSavedBetWinningTaxPercent] = useState('')
  const [shares, setShares] = useState([])
  const [savedShares, setSavedShares] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const hasDirtyFinance = bettingEnabled !== savedBettingEnabled || betWinningTaxPercent !== savedBetWinningTaxPercent
  const hasDirtyShares = JSON.stringify(shares) !== JSON.stringify(savedShares)
  const canSave = useMemo(() => hasDirtyFinance || hasDirtyShares, [hasDirtyFinance, hasDirtyShares])

  useEffect(() => {
    let cancelled = false

    async function loadSettings() {
      try {
        setLoading(true)
        const [financeResponse, sharesResponse] = await Promise.all([
          financeSettingsService.getAdminSettings(),
          financeSettingsService.getRacePrizeShareSettings(),
        ])

        if (cancelled) return

        const nextBettingEnabled = Boolean(financeResponse.data.bettingEnabled)
        const nextTaxPercent = String(financeResponse.data.betWinningTaxPercent ?? '')
        const nextShares = (sharesResponse.data.shares ?? []).map((share) => ({
          id: `share-${share.rank}`,
          rank: String(share.rank ?? ''),
          jockeyPercent: formatPercent(share.jockeyPercent),
          ownerPercent: formatPercent(share.ownerPercent),
        }))
        const initialShares = nextShares.length ? nextShares : [createShareRow(1)]

        setBettingEnabled(nextBettingEnabled)
        setBetWinningTaxPercent(nextTaxPercent)
        setSavedBettingEnabled(nextBettingEnabled)
        setSavedBetWinningTaxPercent(nextTaxPercent)
        setShares(initialShares)
        setSavedShares(initialShares)
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

  const updateShare = (id, patch) => {
    setShares((current) =>
      current.map((row) => {
        if (row.id !== id) return row
        const nextRow = { ...row, ...patch }
        const jockey = Number(nextRow.jockeyPercent)
        nextRow.ownerPercent = Number.isFinite(jockey) ? formatPercent(Math.max(0, 100 - jockey)) : ''
        return nextRow
      }),
    )
  }

  const addShare = () => {
    const nextRank = shares.length ? Math.max(...shares.map((row) => Number(row.rank) || 0)) + 1 : 1
    setShares((current) => [...current, createShareRow(nextRank)])
  }

  const removeShare = (id) => {
    setShares((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current))
  }

  const validateSettings = () => {
    const taxPercent = Number(betWinningTaxPercent)
    if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
      toast.error('Thuế thắng cược phải từ 0 đến 100')
      return false
    }

    const ranks = new Set()
    for (let index = 0; index < shares.length; index += 1) {
      const row = shares[index]
      const rank = Number(row.rank)
      const jockeyPercent = Number(row.jockeyPercent)

      if (!Number.isInteger(rank) || rank <= 0) {
        toast.error(`Dòng ${index + 1}: thứ hạng phải là số nguyên dương`)
        return false
      }
      if (ranks.has(rank)) {
        toast.error('Thứ hạng chia thưởng phải là duy nhất')
        return false
      }
      ranks.add(rank)

      if (!Number.isFinite(jockeyPercent) || jockeyPercent < 0 || jockeyPercent > 100) {
        toast.error(`Dòng ${index + 1}: phần trăm jockey phải từ 0 đến 100`)
        return false
      }
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
      const prizeSharesPayload = {
        shares: shares.map((row) => ({
          rank: Number(row.rank),
          jockeyPercent: Number(row.jockeyPercent),
        })),
      }

      const [financeResponse, sharesResponse] = await Promise.all([
        financeSettingsService.updateAdminSettings(financePayload),
        financeSettingsService.updateRacePrizeShareSettings(prizeSharesPayload),
      ])

      const nextTaxPercent = String(financeResponse.data.betWinningTaxPercent ?? betWinningTaxPercent)
      const nextShares = (sharesResponse.data.shares ?? []).map((share) => ({
        id: `share-${share.rank}`,
        rank: String(share.rank ?? ''),
        jockeyPercent: formatPercent(share.jockeyPercent),
        ownerPercent: formatPercent(share.ownerPercent),
      }))

      setBettingEnabled(Boolean(financeResponse.data.bettingEnabled))
      setBetWinningTaxPercent(nextTaxPercent)
      setSavedBettingEnabled(Boolean(financeResponse.data.bettingEnabled))
      setSavedBetWinningTaxPercent(nextTaxPercent)
      setShares(nextShares)
      setSavedShares(nextShares)
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
    setShares(savedShares)
  }

  if (loading) {
    return <div className="p-10 text-center text-white/55">Đang tải cấu hình đặt cược...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
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
              Khi tắt tính năng này, các API cược ở spectator sẽ tự chặn theo cấu hình backend.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white">Cấu hình chia thưởng theo thứ hạng</h3>
              <p className="text-sm text-white/50">BE chỉ lưu phần jockey, phần chủ ngựa được tính tự động.</p>
            </div>
            <button
              type="button"
              onClick={addShare}
              className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-semibold text-white/80 transition hover:bg-white/[0.08]"
            >
              <Plus className="h-4 w-4" />
              Thêm dòng
            </button>
          </div>

          <div className="space-y-3">
            {shares.map((row) => (
              <PrizeShareRow
                key={row.id}
                row={row}
                canRemove={shares.length > 1}
                onChange={(patch) => updateShare(row.id, patch)}
                onRemove={() => removeShare(row.id)}
              />
            ))}
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