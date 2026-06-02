import { useState } from "react";
import { toast } from "sonner";
import {
  Award,
  Crown,
  Flag,
  Gift,
  Grid3x3,
  Info,
  Medal,
  Plus,
  Send,
  Trash2,
  Users,
} from "lucide-react";
import { createRaces } from "@/data/admin/tournamentMocks";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import { Input, Select, TextArea } from "@/components/ui/Input";
import { PanelActions, PanelHeader, SimpleTable } from "@/components/ui/Panel";
import { primaryButton } from "@/components/ui/styles";
import { tournamentService } from "@/services/tournamentService";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  formatVnd,
  getPrizeAmountByRank,
  normalizePrizeList,
  registrationsFor,
  resultsFor,
  toneForStatus,
} from "./utils";

export default function RacesTab({ tournament, setTournament }) {
  const [selectedId, setSelectedId] = useState(tournament.races[0]?.id);
  const [panel, setPanel] = useState("info");
  const [saving, setSaving] = useState(false);
  const selected =
    tournament.races.find((race) => race.id === selectedId) ??
    tournament.races[0];

  const addRace = () => {
    const no = tournament.races.length + 1;
    const race = {
      ...createRaces(tournament.id, [0])[0],
      id: `${tournament.id}-r${no}`,
      no,
      name: `Cuộc đua ${no}`,
      date: tournament.startDate,
      status: "Nháp",
    };
    setTournament({ ...tournament, races: [...tournament.races, race] });
    setSelectedId(race.id);
  };

  const removeRace = () => {
    const nextRaces = tournament.races.filter(
      (race) => race.id !== selected.id,
    );
    setTournament({ ...tournament, races: nextRaces });
    setSelectedId(nextRaces[0]?.id);
  };

  const saveRaces = async (
    nextRacesOrEvent = tournament.races,
    nextSelectedId = selectedId,
  ) => {
    const nextRaces = Array.isArray(nextRacesOrEvent)
      ? nextRacesOrEvent
      : tournament.races;
    if (!["DRAFT", "PUBLISHED"].includes(tournament.statusCode)) {
      toast.error(
        "Chỉ có thể lưu cấu hình cuộc đua khi giải đấu ở trạng thái Nháp hoặc Đã công bố",
      );
      return;
    }

    const validationError = getRaceValidationError(nextRaces, tournament);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      const response = await tournamentService.replaceTournamentRaces(
        tournament.id,
        nextRaces,
      );
      setTournament(response.data);
      setSelectedId(
        response.data.races.find((race) => race.id === nextSelectedId)?.id ??
          response.data.races[0]?.id,
      );
      toast.success("Đã lưu cấu hình cuộc đua");
    } catch (error) {
      console.error(
        "Không thể lưu cấu hình cuộc đua",
        error?.response?.data || error,
      );
      toast.error(
        getApiErrorMessage(error) || "Không thể lưu cấu hình cuộc đua",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveRaceInfo = (draft) => {
    const nextRaces = tournament.races.map((race) =>
      race.id === selected.id ? { ...race, ...draft } : race,
    );
    return saveRaces(nextRaces, selected.id);
  };

  const saveRacePrizes = (prizes) => {
    const nextRaces = tournament.races.map((race) =>
      race.id === selected.id ? { ...race, prizes } : race,
    );
    return saveRaces(nextRaces, selected.id);
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
                <span>{formatDistance(race.distance)}</span>
                <span>
                  {race.registered}/{race.maxHorses} đăng ký
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#dda50e]"
                  style={{
                    width: `${Math.min(100, (race.registered / race.maxHorses) * 100)}%`,
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
                  {selected.date} · {selected.time} · {formatDistance(selected.distance)}
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
            key={selected.id}
            race={selected}
            tournament={tournament}
            saving={saving}
            onSave={saveRaceInfo}
          />
        )}
        {panel === "prizes" && (
          <RacePrizes
            key={`${selected.id}-prizes`}
            race={selected}
            saving={saving}
            onSave={saveRacePrizes}
          />
        )}
        {panel === "registrations" && <RaceRegistrations race={selected} />}
        {panel === "gates" && <RaceGates race={selected} />}
        {panel === "race-results" && <RaceResults race={selected} />}
      </div>
    </div>
  );
}

function shiftTime(time, hours) {
  if (!time) return "";

  const [hour = "00", minute = "00"] = time.split(":");
  const nextHour = Math.max(0, Math.min(23, Number(hour) + hours));
  return `${String(nextHour).padStart(2, "0")}:${String(Number(minute)).padStart(2, "0")}`;
}

function clampDate(date, min, max) {
  if (!date) return "";
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

function clampTime(time, min, max) {
  if (!time) return "";
  if (min && time < min) return min;
  if (max && time > max) return max;
  return time;
}

function metersFromDistance(distance) {
  return String(distance || "").match(/\d+/)?.[0] || "";
}

function formatDistance(distance) {
  const meters = metersFromDistance(distance);
  return meters ? `${meters}m` : "";
}

function toDateTimeValue(date, time = "08:00") {
  return `${date}T${time || "08:00"}`;
}

function addOneHourDateTimeValue(date, time = "08:00") {
  if (!date) return "";

  const [hours = "08", minutes = "00"] = time.split(":");
  const start = new Date(
    Date.UTC(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 1,
      Number(date.slice(8, 10)),
      Number(hours),
      Number(minutes),
    ),
  );
  start.setUTCHours(start.getUTCHours() + 1);

  return start.toISOString().slice(0, 16);
}

function getRaceValidationError(races, tournament) {
  const tournamentStart = toDateTimeValue(
    tournament.startDate,
    tournament.startTime || "00:00",
  );
  const tournamentEnd = toDateTimeValue(
    tournament.endDate,
    tournament.endTime || "23:59",
  );
  const keys = new Set();

  for (const race of races) {
    const raceName = race.name?.trim();
    const raceDistance = race.distance?.trim();
    const raceStart = toDateTimeValue(race.date, race.time);
    const raceEnd = addOneHourDateTimeValue(race.date, race.time);
    const raceKey = `${raceName?.toLowerCase()}|${raceStart}`;
    const prizeRanks = new Set();

    if (!raceName) return "Tên cuộc đua không được để trống";
    if (raceName.length > 120) return "Tên cuộc đua tối đa 120 ký tự";
    if (!raceDistance) return "Khoảng cách cuộc đua không được để trống";
    if (raceDistance.length > 80) return "Khoảng cách tối đa 80 ký tự";
    if (Number(metersFromDistance(raceDistance)) <= 0)
      return "Khoảng cách phải lớn hơn 0 m";
    if ((race.description || "").length > 1000)
      return "Mô tả cuộc đua tối đa 1000 ký tự";
    if (!race.date || !race.time)
      return "Ngày và giờ thi đấu không được để trống";
    if (raceStart < tournamentStart || raceEnd > tournamentEnd)
      return "Lịch thi đấu phải nằm trong thời gian mùa giải";
    if (Number(race.minHorses) <= 0 || Number(race.maxHorses) <= 0)
      return "Giới hạn ngựa phải lớn hơn 0";
    if (Number(race.minHorses) > Number(race.maxHorses))
      return "Tối thiểu ngựa không được lớn hơn tối đa ngựa";
    if (Number(race.entryFee) < 0)
      return "Lệ phí đăng ký không được âm";
    if (keys.has(raceKey))
      return "Tên cuộc đua và giờ thi đấu không được trùng nhau trong cùng giải";

    for (const prize of normalizePrizeList(race.prizes)) {
      if (prize.rank <= 0) return "Hạng giải thưởng phải lớn hơn 0";
      if (prizeRanks.has(prize.rank))
        return "Hạng giải thưởng không được trùng nhau trong cùng cuộc đua";
      prizeRanks.add(prize.rank);
    }

    keys.add(raceKey);
  }

  return "";
}

function RaceInfo({ race, tournament, saving, onSave }) {
  const [draft, setDraft] = useState(race);
  const updateDraft = (patch) => {
    setDraft((previous) => ({ ...previous, ...patch }));
  };
  const raceDateMin = tournament.startDate || undefined;
  const raceDateMax = tournament.endDate || undefined;
  const raceTimeMin =
    draft.date === tournament.startDate
      ? tournament.startTime || undefined
      : undefined;
  const raceTimeMax =
    draft.date === tournament.endDate
      ? shiftTime(tournament.endTime, -1) || undefined
      : undefined;

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
            value={draft.name}
            onChange={(event) => updateDraft({ name: event.target.value })}
          />
        </Field>
        <Field label="Số thứ tự">
          <Input
            type="number"
            value={draft.no}
            onChange={(event) =>
              updateDraft({ no: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Mô tả" full>
          <TextArea
            value={draft.description}
            onChange={(event) =>
              updateDraft({ description: event.target.value })
            }
          />
        </Field>
        <Field label="Ngày thi đấu">
          <Input
            type="date"
            min={raceDateMin}
            max={raceDateMax}
            value={draft.date}
            onChange={(event) => {
              const date = clampDate(
                event.target.value,
                tournament.startDate,
                tournament.endDate,
              );
              const nextRaceTimeMin =
                date === tournament.startDate ? tournament.startTime : "";
              const nextRaceTimeMax =
                date === tournament.endDate
                  ? shiftTime(tournament.endTime, -1)
                  : "";

              updateDraft({
                date,
                time: clampTime(draft.time, nextRaceTimeMin, nextRaceTimeMax),
              });
            }}
          />
          <p className="mt-2 text-xs text-white/40">
            Chỉ chọn trong thời gian mùa giải: {tournament.startDate} -{" "}
            {tournament.endDate}.
          </p>
        </Field>
        <Field label="Giờ thi đấu">
          <Input
            type="time"
            min={raceTimeMin}
            max={raceTimeMax}
            value={draft.time}
            onChange={(event) =>
              updateDraft({
                time: clampTime(event.target.value, raceTimeMin, raceTimeMax),
              })
            }
          />
          {(raceTimeMin || raceTimeMax) && (
            <p className="mt-2 text-xs text-white/40">
              Giờ thi đấu trong ngày này: {raceTimeMin || "00:00"} -{" "}
              {raceTimeMax || "23:59"}.
            </p>
          )}
        </Field>
        <Field label="Khoảng cách">
          <div className="relative">
            <Input
              type="number"
              min="1"
              step="50"
              value={metersFromDistance(draft.distance)}
              onChange={(event) =>
                updateDraft({ distance: event.target.value ? `${event.target.value}m` : "" })
              }
              className="pr-14"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/45">
              m
            </span>
          </div>
        </Field>
        <Field label="Đường đua">
          <Input
            value={draft.track}
            onChange={(event) => updateDraft({ track: event.target.value })}
          />
        </Field>

        <Field label="Số ngựa tối thiểu của cuộc đua">
          <Input
            type="number"
            min="1"
            value={draft.minHorses}
            onChange={(event) =>
              updateDraft({ minHorses: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Số ngựa tối đa của cuộc đua">
          <Input
            type="number"
            min="1"
            value={draft.maxHorses}
            onChange={(event) =>
              updateDraft({ maxHorses: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Lệ phí đăng ký">
          <div className="relative">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={draft.entryFee ?? ""}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "");
                updateDraft({ entryFee: digits ? Number(digits) : "" });
              }}
              className="pr-20"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-white/45">
              VND
            </span>
          </div>
        </Field>
        <Field label="Trạng thái" full>
          <Input value="Nháp" disabled />
        </Field>
      </div>
      <PanelActions
        saving={saving}
        onCancel={() => setDraft(race)}
        onSave={() => onSave(draft)}
      />
    </Card>
  );
}

function RacePrizes({ race, saving, onSave }) {
  const [draftPrizes, setDraftPrizes] = useState(() =>
    normalizePrizeList(race.prizes),
  );
  const prizes = draftPrizes;
  const total = prizes.reduce(
    (sum, prize) => sum + Number(prize.amount || 0),
    0,
  );
  const updatePrize = (id, patch) => {
    setDraftPrizes((previous) =>
      previous.map((prize) =>
        prize.id === id ? { ...prize, ...patch } : prize,
      ),
    );
  };
  const addPrize = () => {
    setDraftPrizes((previous) => {
      const nextRank =
        Math.max(0, ...previous.map((prize) => Number(prize.rank || 0))) + 1;
      let suffix = previous.length + 1;
      let nextId = `new-prize-${race.id}-${nextRank}-${suffix}`;

      while (previous.some((prize) => prize.id === nextId)) {
        suffix += 1;
        nextId = `new-prize-${race.id}-${nextRank}-${suffix}`;
      }

      return [
        ...previous,
        {
          id: nextId,
          rank: nextRank,
          itemName: `Giải ${nextRank}`,
          amount: 0,
        },
      ];
    });
  };
  const removePrize = (id) => {
    setDraftPrizes((previous) => previous.filter((prize) => prize.id !== id));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <style>
        {`
          @media (min-width: 768px) {
            .race-prize-grid {
              grid-template-columns: 40px minmax(0, 1fr) 120px 180px 44px;
            }
          }
        `}
      </style>
      <Card className="overflow-hidden">
        <PanelHeader
          icon={Crown}
          title="Cấu hình giải thưởng"
          subtitle="Mỗi cuộc đua có giải thưởng riêng"
        />
        <div className="flex justify-end border-b border-white/10 bg-white/[0.018] px-6 py-4">
          <button
            type="button"
            onClick={addPrize}
            className={`${primaryButton} h-11 rounded-xl px-5 text-sm shadow-[#dda50e]/15`}
          >
            <Plus className="h-4 w-4" />
            Thêm giải thưởng
          </button>
        </div>
        <div className="space-y-3 p-6">
          <div className="race-prize-grid hidden items-center gap-4 rounded-2xl border border-[#dda50e]/20 bg-gradient-to-r from-[#dda50e]/12 to-white/[0.035] px-4 py-3 text-xs font-bold uppercase text-white/60 shadow-inner shadow-white/[0.025] md:grid">
            <span aria-hidden="true" />
            <span className="whitespace-nowrap text-white/70">
              Tên giải thưởng
            </span>
            <span className="text-center text-white/70">Hạng</span>
            <span className="text-center text-white/70">Số tiền</span>
            <span aria-hidden="true" />
          </div>
          {prizes.map((prize) => {
            const Icon =
              prize.rank === 1 ? Crown : prize.rank <= 3 ? Medal : Gift;
            const color =
              prize.rank === 1
                ? "text-[#dda50e]"
                : prize.rank <= 3
                  ? "text-orange-300"
                  : "text-emerald-300";
            return (
              <div
                key={prize.id}
                className="race-prize-grid grid gap-3 rounded-2xl border border-white/10 bg-white/[0.028] p-4 transition hover:border-[#dda50e]/25 hover:bg-white/[0.045] md:items-center md:gap-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#07111f]/65">
                  <Icon className={`h-5 w-5 ${color}`} />
                </span>
                <Input
                  className="font-semibold"
                  value={prize.itemName}
                  onChange={(event) =>
                    updatePrize(prize.id, { itemName: event.target.value })
                  }
                  placeholder="Tên giải thưởng"
                />
                <Input
                  type="number"
                  min="1"
                  value={prize.rank}
                  onChange={(event) =>
                    updatePrize(prize.id, { rank: Number(event.target.value) })
                  }
                  aria-label="Hạng nhận thưởng"
                  className="font-bold tabular-nums md:text-center"
                  placeholder="Hạng"
                />
                <Input
                  type="number"
                  min="0"
                  value={prize.amount}
                  onChange={(event) =>
                    updatePrize(prize.id, {
                      amount: Number(event.target.value),
                    })
                  }
                  aria-label="Số tiền thưởng"
                  className="font-semibold tabular-nums md:text-right"
                  placeholder="Số tiền"
                />
                <button
                  type="button"
                  aria-label="Xóa giải thưởng"
                  onClick={() => removePrize(prize.id)}
                  disabled={prizes.length === 1}
                  className="justify-self-end rounded-xl border border-transparent p-3 text-white/45 transition hover:border-rose-300/20 hover:bg-rose-400/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-transparent disabled:text-white/20"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>
        <PanelActions
          saving={saving}
          onCancel={() => setDraftPrizes(normalizePrizeList(race.prizes))}
          onSave={() => onSave(prizes)}
        />
      </Card>
      <Card className="h-fit overflow-hidden">
        <div className="border-b border-white/10 bg-[#dda50e]/10 p-6">
          <h3 className="text-sm font-bold uppercase text-white/58">
            Tổng giải thưởng
          </h3>
          <p className="mt-2 text-3xl font-bold text-[#dda50e]">
            {formatVnd(total)}
          </p>
        </div>
        <div className="p-6">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className="mb-3 flex justify-between gap-4 rounded-xl bg-white/[0.035] px-4 py-3 text-sm text-white/65"
            >
              <span className="min-w-0 truncate">{prize.itemName}</span>
              <span className="shrink-0 font-semibold text-white">
                {formatVnd(prize.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function RaceRegistrations({ race }) {
  const registrations = registrationsFor(race);
  return (
    <Card>
      <PanelHeader
        icon={Users}
        title="Đăng ký cuộc đua"
        subtitle={`${registrations.length} hồ sơ đăng ký`}
      />
      <SimpleTable
        headers={["Ngựa", "Chủ ngựa", "Jockey", "Duyệt"]}
        rows={registrations.map((item) => [
          item.horse,
          item.owner,
          item.jockey,
          <Badge key="a" tone={item.approval === "Đã duyệt" ? "green" : "gold"}>
            {item.approval}
          </Badge>,
        ])}
      />
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
        {registrationsFor(race)
          .slice(0, race.maxHorses)
          .map((item, index) => (
            <div
              key={item.horse}
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
            ? formatVnd(getPrizeAmountByRank(race, item.position))
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
