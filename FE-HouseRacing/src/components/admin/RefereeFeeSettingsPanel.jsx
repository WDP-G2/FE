import { useEffect, useState } from 'react'
import { Banknote, Save, Undo2 } from 'lucide-react'
import { toast } from 'sonner'
import Field from '@/components/ui/Field'
import { MoneyInput } from '@/components/ui/Input'
import {
  DEFAULT_REFEREE_PER_RACE_FEE,
  readRefereeFeeSettings,
  writeRefereeFeeSettings,
} from '@/services/refereeFeeSettingsService'

export default function RefereeFeeSettingsPanel() {
  const [perRaceFee, setPerRaceFee] = useState(String(DEFAULT_REFEREE_PER_RACE_FEE))
  const [savedPerRaceFee, setSavedPerRaceFee] = useState(String(DEFAULT_REFEREE_PER_RACE_FEE))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const settings = readRefereeFeeSettings()
    const value = String(settings.perRaceFee)
    setPerRaceFee(value)
    setSavedPerRaceFee(value)
  }, [])

  const saveSettings = async () => {
    const amount = Number(perRaceFee)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Mức lương phải là số nguyên dương')
      return
    }

    try {
      setSaving(true)
      const saved = writeRefereeFeeSettings({ perRaceFee: amount })
      const value = String(saved.perRaceFee)
      setPerRaceFee(value)
      setSavedPerRaceFee(value)
      toast.success('Đã lưu mức lương trọng tài')
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    setPerRaceFee(savedPerRaceFee)
  }

  return (
    <div className="grid gap-8 p-6 lg:grid-cols-[360px_1fr]">
      <section>
        <h3 className="text-lg font-bold">Mức lương mặc định</h3>
        <p className="mt-1 text-sm text-white/50">
          Số tiền admin trả cho trọng tài sau mỗi cuộc đua được phân công.
        </p>
        <div className="mt-5">
          <Field label="Lương / phụ cấp theo cuộc đua (VNĐ)">
            <MoneyInput
              type="text"
              inputMode="numeric"
              value={perRaceFee}
              placeholder="Ví dụ: 500000"
              onValueChange={setPerRaceFee}
            />
          </Field>
        </div>
        <p className="mt-4 text-xs leading-5 text-white/40">
          Mức này được áp dụng tại trang Phân công trọng tài khi admin bấm thanh toán.
        </p>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <Banknote className="h-5 w-5 text-[#dda50e]" />
          <div>
            <h3 className="text-lg font-bold">Cấu hình hiện tại</h3>
            <p className="text-sm text-white/50">Ghi nhận thanh toán lương cho trọng tài theo cuộc đua</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-6">
          <p className="text-sm text-white/50">Lương theo cuộc đua</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-[#dda50e]">
            {Number(perRaceFee || 0).toLocaleString('vi-VN')} đ
          </p>
            <p className="mt-3 text-sm text-white/45">
              Trọng tài xem khoản đã nhận tại Ví của tôi sau khi admin xác nhận thanh toán.
            </p>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={resetSettings}
            className="flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 font-semibold text-white/65 disabled:opacity-50"
          >
            <Undo2 className="h-4 w-4" />
            Hủy thay đổi
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={saveSettings}
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
