import { Plus } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { primaryButton } from "@/components/ui/styles";
import { toneForStatus, getAdminRaceDisplayStatus } from "../utils";
import { formatDistance } from "./helpers";
import { formatDisplayDate } from "@/utils/dateFormat";

export default function RaceList({ races, selectedId, onAdd, onSelect }) {
  return (
    <Card className="h-fit shrink-0 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Cuộc đua</h2>
          <p className="text-sm text-white/50">
            {races.length} cuộc đua trong giải
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={`${primaryButton} h-11 px-4 text-sm`}
        >
          <Plus className="h-4 w-4" />
          Thêm
        </button>
      </div>

      <div className="space-y-3">
        {races.map((race) => {
          const displayName = race.name?.trim() || "Cuộc đua mới";
          const timeRange = `${race.time || "--:--"} - ${race.endTime || "--:--"}`;
          const scheduleText =
            race.date || race.time || race.endTime
              ? `${formatDisplayDate(race.date, "Chưa chọn ngày")} · ${timeRange}`
              : "Chưa cấu hình lịch";
          const maxHorses = Number(race.maxHorses || 0);
          const registered = Number(race.registered || 0);
          const progress =
            maxHorses > 0 ? Math.min(100, (registered / maxHorses) * 100) : 0;

          return (
            <button
              type="button"
              key={race.id}
              onClick={() => onSelect(race.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                race.id === selectedId
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
                    <div className="truncate font-bold">{displayName}</div>
                    <div className="text-xs text-white/50">{scheduleText}</div>
                  </div>
                </div>
                <Badge tone={toneForStatus(getAdminRaceDisplayStatus(race))}>
                  {getAdminRaceDisplayStatus(race)}
                </Badge>
              </div>

              <div className="mb-3 flex justify-between text-xs text-white/55">
                <span>{formatDistance(race.distance) || "Chưa nhập cự ly"}</span>
                <span>
                  {registered}/{maxHorses || 0} đăng ký
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#dda50e]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
