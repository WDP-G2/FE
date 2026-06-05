import { useState } from "react";
import {
  Award,
  Crown,
  Flag,
  Grid3x3,
  Info,
  Medal,
  Plus,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Badge from "@/components/admin/ui/Badge";
import Card from "@/components/admin/ui/Card";
import Field from "@/components/admin/ui/Field";
import { Input, Select, TextArea } from "@/components/admin/ui/Input";
import {
  PanelActions,
  PanelHeader,
  SimpleTable,
} from "@/components/admin/ui/Panel";
import { primaryButton } from "@/components/admin/ui/styles";
import {
  approvedRegistrationsFor,
  formatVnd,
  getTotalPrize,
  registrationsFor,
  resultsFor,
  toneForStatus,
} from "./utils";

export default function RacesTab({
  tournament,
  setTournament,
  onAddRace,
  onSaveRace,
  onRemoveRace,
  onUpdateRegistrationStatus,
  savingRace,
  updatingRegistrationId,
}) {
  const [selectedId, setSelectedId] = useState(tournament.races[0]?.id);
  const [panel, setPanel] = useState("info");
  const selected =
    tournament.races.find((race) => race.id === selectedId) ??
    tournament.races[0];

  const updateRace = (patch) => {
    setTournament({
      ...tournament,
      races: tournament.races.map((race) =>
        race.id === selected.id ? { ...race, ...patch } : race,
      ),
    });
  };

  const addRace = async () => {
    if (!onAddRace) return;
    const no = tournament.races.length + 1;
    const draft = {
      no,
      name: `Cuộc đua ${no}`,
      date: tournament.startDate,
      time: "09:00",
      distance: 1200,
      track: tournament.location,
      surface: "Cỏ",
      category: "Open",
      minHorses: 0,
      maxHorses: tournament.config?.maxRegistrations || 12,
      entryFee: tournament.config?.entryFee || 0,
      regDeadline: tournament.startDate,
      checkIn: "08:00",
      prizes: { first: 0, second: 0, third: 0 },
      status: "Nháp",
      description: "",
    };
    const nextId = await onAddRace(draft);
    if (nextId) setSelectedId(nextId);
  };

  const removeRace = async () => {
    if (!window.confirm(`Xóa cuộc đua "${selected.name}"?`)) return;
    if (onRemoveRace) return onRemoveRace(selected);
    toast.error("BE chưa hỗ trợ xóa cuộc đua");
  };

  if (!selected) {
    return (
      <Card className="p-16 text-center">
        <Flag className="mx-auto mb-5 h-14 w-14 text-[#dda50e]" />
        <h2 className="mb-3 text-2xl font-bold">Chưa có cuộc đua nào</h2>
        <button type="button" onClick={addRace} className={primaryButton}>
          <Plus className="h-5 w-5" />
          Tạo cuộc đua đầu tiên
        </button>
      </Card>
    );
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[360px_1fr]">
      <Card className="h-fit p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Cuộc đua</h2>
            <p className="text-sm text-white/50">
              {tournament.races.length} cuộc đua trong giải
            </p>
          </div>
          <button
            type="button"
            onClick={addRace}
            className={`${primaryButton} h-11 px-4 text-sm`}
          >
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <div className="space-y-3">
          {tournament.races.map((race) => (
            <button
              type="button"
              key={race.id}
              onClick={() => setSelectedId(race.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                race.id === selected.id
                  ? "border-[#dda50e] bg-[#dda50e]/15"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-lg bg-[#dda50e] px-2 py-2 text-xs font-bold">
                    R{race.no}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-bold">{race.name}</div>
                    <div className="text-xs text-white/50">
                      {race.date} · {race.time}
                    </div>
                  </div>
                </div>
                <Badge tone={toneForStatus(race.status)}>{race.status}</Badge>
              </div>
              <div className="mb-3 flex justify-between text-xs text-white/55">
                <span>{race.distance} m</span>
                <span>
                  {race.registered}/{race.maxHorses} đăng ký
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#dda50e]"
                  style={{
                    width: `${Math.min(100, (race.registered / Math.max(1, race.maxHorses)) * 100)}%`,
                  }}
                />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-[#dda50e] px-4 py-3 font-bold">
                R{selected.no}
              </span>
              <div>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-white/50">
                  {selected.date} · {selected.time} · {selected.distance} m
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Xóa cuộc đua"
              onClick={removeRace}
              className="p-3 text-white/55 hover:text-rose-300"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ["info", "Thông tin", Info],
              ["prizes", "Giải thưởng", Crown],
              ["registrations", "Đăng ký", Users],
              ["gates", "Vị trí xuất phát", Grid3x3],
              ["race-results", "Kết quả", Award],
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPanel(key)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${
                  panel === key
                    ? "border-[#dda50e]/45 bg-[#dda50e]/15 text-[#dda50e]"
                    : "border-transparent text-white/55 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </Card>

        {panel === "info" && (
          <RaceInfo
            race={selected}
            updateRace={updateRace}
            onSave={() => onSaveRace?.(selected)}
            saving={savingRace}
          />
        )}
        {panel === "prizes" && (
          <RacePrizes
            race={selected}
            updateRace={updateRace}
            onSave={() => onSaveRace?.(selected)}
            saving={savingRace}
          />
        )}
        {panel === "registrations" && (
          <RaceRegistrations
            race={selected}
            onUpdateStatus={onUpdateRegistrationStatus}
            updatingId={updatingRegistrationId}
          />
        )}
        {panel === "gates" && <RaceGates race={selected} />}
        {panel === "race-results" && <RaceResults race={selected} />}
      </div>
    </div>
  );
}

function RaceInfo({ race, updateRace, onSave, saving }) {
  return (
    <Card>
      <PanelHeader
        icon={Info}
        title="Thông tin cuộc đua"
        subtitle="Tên, thời gian, đường đua, lệ phí và giới hạn ngựa"
      />
      <div className="grid gap-5 p-6 md:grid-cols-2">
        <Field label="Tên cuộc đua">
          <Input
            value={race.name}
            onChange={(event) => updateRace({ name: event.target.value })}
          />
        </Field>
        <Field label="Số thứ tự">
          <Input
            type="number"
            value={race.no}
            onChange={(event) => updateRace({ no: Number(event.target.value) })}
          />
        </Field>
        <Field label="Mô tả" full>
          <TextArea
            value={race.description}
            onChange={(event) =>
              updateRace({ description: event.target.value })
            }
          />
        </Field>
        <Field label="Ngày thi đấu">
          <Input
            type="date"
            value={race.date}
            onChange={(event) => updateRace({ date: event.target.value })}
          />
        </Field>
        <Field label="Giờ thi đấu">
          <Input
            type="time"
            value={race.time}
            onChange={(event) => updateRace({ time: event.target.value })}
          />
        </Field>
        <Field label="Khoảng cách">
          <div className="relative">
            <Input
              type="number"
              min="0"
              value={race.distance}
              onChange={(event) =>
                updateRace({ distance: Number(event.target.value) })
              }
              className="pr-12"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/45">
              m
            </span>
          </div>
        </Field>
        <Field label="Đường đua">
          <Input
            value={race.track}
            onChange={(event) => updateRace({ track: event.target.value })}
          />
        </Field>
        <Field label="Mặt sân">
          <Select
            value={race.surface}
            onChange={(event) => updateRace({ surface: event.target.value })}
          >
            <option>Cỏ</option>
            <option>Đất</option>
            <option>Tổng hợp</option>
          </Select>
        </Field>
        <Field label="Hạng đua">
          <Select
            value={race.category}
            onChange={(event) => updateRace({ category: event.target.value })}
          >
            <option>Hạng A</option>
            <option>Hạng B</option>
            <option>Hạng C</option>
            <option>Open</option>
          </Select>
        </Field>
        <Field label="Số ngựa tối đa">
          <Input
            type="number"
            value={race.maxHorses}
            onChange={(event) =>
              updateRace({ maxHorses: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Số ngựa tối thiểu">
          <Input
            type="number"
            value={race.minHorses}
            onChange={(event) =>
              updateRace({ minHorses: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Lệ phí đăng ký">
          <Input
            type="number"
            value={race.entryFee}
            onChange={(event) =>
              updateRace({ entryFee: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Hạn đăng ký">
          <Input
            type="date"
            value={race.regDeadline}
            onChange={(event) =>
              updateRace({ regDeadline: event.target.value })
            }
          />
        </Field>
        <Field label="Giờ check-in">
          <Input
            type="time"
            value={race.checkIn}
            onChange={(event) => updateRace({ checkIn: event.target.value })}
          />
        </Field>
        <Field label="Trạng thái" full>
          <Select
            value={race.status}
            onChange={(event) => updateRace({ status: event.target.value })}
          >
            <option>Nháp</option>
            <option>Sắp chạy</option>
            <option>Đang chạy</option>
            <option>Hoàn thành</option>
          </Select>
        </Field>
      </div>
      <PanelActions onSave={onSave} saving={saving} />
    </Card>
  );
}

function RacePrizes({ race, updateRace, onSave, saving }) {
  const items = [
    { key: "first", label: "Vô địch", icon: Crown, color: "text-[#dda50e]" },
    { key: "second", label: "Á quân", icon: Medal, color: "text-white" },
    { key: "third", label: "Hạng ba", icon: Medal, color: "text-orange-300" },
  ];
  const total = getTotalPrize(race);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
      <Card>
        <PanelHeader
          icon={Crown}
          title="Cấu hình giải thưởng"
          subtitle="Mỗi cuộc đua có giải thưởng riêng"
        />
        <div className="space-y-4 p-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
              >
                <Icon className={`h-7 w-7 ${item.color}`} />
                <span className="flex-1 font-semibold">{item.label}</span>
                <Input
                  type="number"
                  className="max-w-52"
                  value={race.prizes[item.key]}
                  onChange={(event) =>
                    updateRace({
                      prizes: {
                        ...race.prizes,
                        [item.key]: Number(event.target.value),
                      },
                    })
                  }
                />
              </div>
            );
          })}
        </div>
        <PanelActions onSave={onSave} saving={saving} />
      </Card>
      <Card className="h-fit p-6">
        <h3 className="text-lg font-bold">Tổng giải thưởng</h3>
        <p className="mb-6 mt-2 text-2xl font-bold text-[#dda50e]">
          {formatVnd(total)}
        </p>
        {items.map((item) => (
          <div
            key={item.key}
            className="mb-3 flex justify-between text-sm text-white/65"
          >
            <span>{item.label}</span>
            <span className="font-semibold text-white">
              {formatVnd(race.prizes[item.key])}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function RaceRegistrations({ race, onUpdateStatus, updatingId }) {
  const registrations = registrationsFor(race);

  return (
    <Card>
      <PanelHeader
        icon={Users}
        title="Đăng ký cuộc đua"
        subtitle={`${registrations.length} hồ sơ đăng ký`}
      />
      {registrations.length === 0 ? (
        <div className="p-8 text-center text-sm text-white/45">
          Chưa có đăng ký nào cho cuộc đua này. Chủ ngựa đăng ký xong sẽ hiện
          tại đây để admin duyệt.
        </div>
      ) : (
        <SimpleTable
          headers={["Ngựa", "Chủ ngựa", "Jockey", "Trạng thái", "Thao tác"]}
          rows={registrations.map((item) => [
            item.horse,
            item.owner,
            item.jockey || "Chưa chọn",
            <Badge
              key={`status-${item.id}`}
              tone={
                item.approval === "Đã duyệt"
                  ? "green"
                  : item.approval === "Từ chối"
                    ? "red"
                    : "gold"
              }
            >
              {item.approval}
            </Badge>,
            <div key={`actions-${item.id}`} className="flex flex-wrap gap-2">
              {item.approval === "Chờ duyệt" ? (
                <>
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => onUpdateStatus?.(item.id, "Đã duyệt")}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-50"
                  >
                    Duyệt
                  </button>
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => onUpdateStatus?.(item.id, "Từ chối")}
                    className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/25 disabled:opacity-50"
                  >
                    Từ chối
                  </button>
                </>
              ) : (
                <span className="text-xs text-white/40">—</span>
              )}
            </div>,
          ])}
        />
      )}
    </Card>
  );
}

function RaceGates({ race }) {
  return (
    <Card>
      <PanelHeader
        icon={Grid3x3}
        title="Vị trí xuất phát"
        subtitle="Phân làn các ngựa đã được duyệt"
      />
      <div className="grid gap-4 p-6 md:grid-cols-2">
        {approvedRegistrationsFor(race)
          .slice(0, race.maxHorses)
          .map((item, index) => (
            <div
              key={item.id || item.horse}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dda50e] text-xl font-bold">
                {index + 1}
              </span>
              <div>
                <p className="font-bold">{item.horse}</p>
                <p className="text-sm text-white/55">{item.jockey}</p>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}

function RaceResults({ race }) {
  return (
    <Card>
      <PanelHeader
        icon={Award}
        title="Nhập kết quả cuộc đua"
        subtitle="Xếp hạng và công bố thành tích"
      />
      <SimpleTable
        headers={["Hạng", "Ngựa", "Jockey", "Thời gian", "Giải thưởng"]}
        rows={resultsFor(race).map((item) => [
          `#${item.position}`,
          item.horse,
          item.jockey,
          item.time,
          item.position < 4
            ? formatVnd(
                [race.prizes.first, race.prizes.second, race.prizes.third][
                  item.position - 1
                ],
              )
            : "—",
        ])}
      />
      <div className="flex justify-end p-6 pt-0">
        <button type="button" className={primaryButton}>
          <Send className="h-5 w-5" />
          Công bố kết quả
        </button>
      </div>
    </Card>
  );
}
