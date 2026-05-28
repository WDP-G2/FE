import { Settings, Trash2 } from "lucide-react";
import Card from "@/components/admin/ui/Card";
import Field from "@/components/admin/ui/Field";
import { Input, Select, TextArea } from "@/components/admin/ui/Input";
import { PanelActions, PanelHeader } from "@/components/admin/ui/Panel";

const defaultConfig = {
  entryFee: 0,
  depositFee: 0,
  refundDays: 3,
  maxRaces: 0,
  maxRegistrations: 0,
  requireJockey: true,
  requireHorseOwner: true,
  requireVetCheck: true,
  requireDopingCheck: true,
  allowLateRegistration: false,
  deadlineAt: "",
};

function toDateInput(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function SettingsTab({
  tournament,
  setTournament,
  onSave,
  saving,
}) {
  const config = {
    ...defaultConfig,
    ...(tournament.config || {}),
    deadlineAt: toDateInput(tournament.config?.deadlineAt),
  };

  const updateField = (patch) => {
    setTournament({ ...tournament, ...patch });
  };

  const updateConfig = (patch) => {
    setTournament({
      ...tournament,
      config: {
        ...config,
        ...patch,
      },
    });
  };

  const handleSave = () => {
    if (!onSave) return;
    onSave({
      name: tournament.name,
      description: tournament.description,
      location: tournament.location,
      banner: tournament.banner,
      type: tournament.type,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      status: tournament.status,
      rules: tournament.rules,
      config,
    });
  };

  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
      <Card>
        <PanelHeader
          icon={Settings}
          title="Cài đặt giải đấu"
          subtitle="Thông tin chung và trạng thái"
        />
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="Tên giải đấu" full>
            <Input
              value={tournament.name}
              onChange={(event) =>
                updateField({ name: event.target.value })
              }
            />
          </Field>
          <Field label="Mô tả" full>
            <TextArea
              value={tournament.description}
              onChange={(event) =>
                updateField({ description: event.target.value })
              }
            />
          </Field>
          <Field label="Địa điểm" full>
            <Input
              value={tournament.location}
              onChange={(event) =>
                updateField({ location: event.target.value })
              }
            />
          </Field>
          <Field label="Banner URL" full>
            <Input
              value={tournament.banner}
              onChange={(event) =>
                updateField({ banner: event.target.value })
              }
            />
          </Field>
          <Field label="Ngày bắt đầu">
            <Input
              type="date"
              value={tournament.startDate}
              onChange={(event) =>
                updateField({ startDate: event.target.value })
              }
            />
          </Field>
          <Field label="Ngày kết thúc">
            <Input
              type="date"
              value={tournament.endDate}
              onChange={(event) =>
                updateField({ endDate: event.target.value })
              }
            />
          </Field>
          <Field label="Loại giải">
            <Select
              value={tournament.type}
              onChange={(event) => updateField({ type: event.target.value })}
            >
              <option value="regular">Regular</option>
              <option value="championship">Championship</option>
            </Select>
          </Field>
          <Field label="Trạng thái" full>
            <Select
              value={tournament.status}
              onChange={(event) =>
                updateField({ status: event.target.value })
              }
            >
              <option>Nháp</option>
              <option>Đang mở đăng ký</option>
              <option>Đang diễn ra</option>
              <option>Đã kết thúc</option>
            </Select>
          </Field>
          <Field label="Luật thi đấu" full>
            <TextArea
              value={tournament.rules}
              onChange={(event) => updateField({ rules: event.target.value })}
            />
          </Field>
        </div>
        <div className="grid gap-5 border-t border-white/10 p-6 md:grid-cols-2">
          <Field label="Lệ phí mặc định">
            <Input
              type="number"
              value={config.entryFee}
              onChange={(event) =>
                updateConfig({ entryFee: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Tiền cọc mặc định">
            <Input
              type="number"
              value={config.depositFee}
              onChange={(event) =>
                updateConfig({ depositFee: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Số cuộc đua tối đa">
            <Input
              type="number"
              value={config.maxRaces}
              onChange={(event) =>
                updateConfig({ maxRaces: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Số đăng ký tối đa">
            <Input
              type="number"
              value={config.maxRegistrations}
              onChange={(event) =>
                updateConfig({ maxRegistrations: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Số ngày hoàn phí">
            <Input
              type="number"
              value={config.refundDays}
              onChange={(event) =>
                updateConfig({ refundDays: Number(event.target.value) })
              }
            />
          </Field>
          <Field label="Hạn đăng ký">
            <Input
              type="date"
              value={config.deadlineAt}
              onChange={(event) =>
                updateConfig({ deadlineAt: event.target.value })
              }
            />
          </Field>
          <Field label="Điều kiện đăng ký" full>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ["requireJockey", "Bắt buộc có jockey"],
                ["requireHorseOwner", "Bắt buộc chủ ngựa"],
                ["requireVetCheck", "Kiểm tra thú y"],
                ["requireDopingCheck", "Kiểm tra doping"],
                ["allowLateRegistration", "Cho đăng ký trễ"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-white/75"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(config[key])}
                    onChange={(event) =>
                      updateConfig({ [key]: event.target.checked })
                    }
                    className="h-4 w-4 accent-[#dda50e]"
                  />
                  {label}
                </label>
              ))}
            </div>
          </Field>
        </div>
        <PanelActions onSave={handleSave} saving={saving} />
      </Card>
      <Card className="h-fit border-rose-400/25 bg-rose-400/[0.07] p-6">
        <h3 className="mb-2 text-xl font-bold">Vùng nguy hiểm</h3>
        <p className="mb-5 text-sm text-white/55">
          Hành động không thể hoàn tác.
        </p>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 font-semibold text-rose-300"
        >
          <Trash2 className="h-5 w-5" />
          Xóa giải đấu
        </button>
      </Card>
    </div>
  );
}
