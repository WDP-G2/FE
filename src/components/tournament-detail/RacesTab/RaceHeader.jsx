import { Award, Crown, Grid3x3, Info, Trash2, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import { formatDistance } from "./helpers";

const PANELS = [
  ["info", "Thông tin", Info],
  ["prizes", "Giải thưởng", Crown],
  ["registrations", "Đăng ký", Users],
  ["gates", "Vị trí xuất phát", Grid3x3],
  ["race-results", "Kết quả", Award],
];

export default function RaceHeader({
  race,
  panel,
  saving,
  onPanelChange,
  onRemove,
}) {
  const displayName = race.name?.trim() || "Cuộc đua mới";
  const scheduleParts = [
    race.date || "Chưa chọn ngày",
    race.time || "--:--",
    formatDistance(race.distance) || "Chưa nhập cự ly",
  ];

  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="rounded-xl bg-[#dda50e] px-4 py-3 font-bold">
            R{race.no}
          </span>
          <div>
            <h2 className="text-xl font-bold">{displayName}</h2>
            <p className="text-sm text-white/50">{scheduleParts.join(" · ")}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Xóa cuộc đua"
          onClick={onRemove}
          disabled={saving}
          className="p-3 text-white/55 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PANELS.map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => onPanelChange(key)}
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
  );
}
