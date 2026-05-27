import { Settings, Trash2 } from 'lucide-react'
import Card from '@/components/admin/ui/Card'
import Field from '@/components/admin/ui/Field'
import { Input, Select } from '@/components/admin/ui/Input'
import { PanelActions, PanelHeader } from '@/components/admin/ui/Panel'

export default function SettingsTab({ tournament, setTournament }) {
  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
      <Card>
        <PanelHeader icon={Settings} title="Cài đặt giải đấu" subtitle="Thông tin chung và trạng thái" />
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="Tên giải đấu" full>
            <Input
              value={tournament.name}
              onChange={(event) => setTournament({ ...tournament, name: event.target.value })}
            />
          </Field>
          <Field label="Địa điểm" full>
            <Input
              value={tournament.location}
              onChange={(event) => setTournament({ ...tournament, location: event.target.value })}
            />
          </Field>
          <Field label="Ngày bắt đầu">
            <Input
              type="date"
              value={tournament.startDate}
              onChange={(event) => setTournament({ ...tournament, startDate: event.target.value })}
            />
          </Field>
          <Field label="Ngày kết thúc">
            <Input
              type="date"
              value={tournament.endDate}
              onChange={(event) => setTournament({ ...tournament, endDate: event.target.value })}
            />
          </Field>
          <Field label="Trạng thái" full>
            <Select
              value={tournament.status}
              onChange={(event) => setTournament({ ...tournament, status: event.target.value })}
            >
              <option>Nháp</option>
              <option>Đang mở đăng ký</option>
              <option>Đang diễn ra</option>
              <option>Đã kết thúc</option>
            </Select>
          </Field>
        </div>
        <PanelActions />
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
