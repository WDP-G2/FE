import { Users } from "lucide-react";
import Badge from "@/components/admin/ui/Badge";
import Card from "@/components/admin/ui/Card";
import { PanelHeader, SimpleTable } from "@/components/admin/ui/Panel";
import { registrationsFor } from "./utils";

export default function ParticipantsTab({
  tournament,
  onUpdateRegistrationStatus,
  updatingRegistrationId,
}) {
  const rows = tournament.races.flatMap((race) =>
    registrationsFor(race).map((person) => [
      `R${race.no} · ${race.name}`,
      person.horse,
      person.owner,
      person.jockey || "Chưa chọn",
      <Badge
        key={`status-${person.id}`}
        tone={
          person.approval === "Đã duyệt"
            ? "green"
            : person.approval === "Từ chối"
              ? "red"
              : "gold"
        }
      >
        {person.approval}
      </Badge>,
      <div key={`actions-${person.id}`} className="flex flex-wrap gap-2">
        {person.approval === "Chờ duyệt" ? (
          <>
            <button
              type="button"
              disabled={updatingRegistrationId === person.id}
              onClick={() =>
                onUpdateRegistrationStatus?.(person.id, "Đã duyệt")
              }
              className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30 disabled:opacity-50"
            >
              Duyệt
            </button>
            <button
              type="button"
              disabled={updatingRegistrationId === person.id}
              onClick={() =>
                onUpdateRegistrationStatus?.(person.id, "Từ chối")
              }
              className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/25 disabled:opacity-50"
            >
              Từ chối
            </button>
          </>
        ) : (
          <span className="text-xs text-white/40">—</span>
        )}
      </div>,
    ]),
  );

  return (
    <Card>
      <PanelHeader
        icon={Users}
        title="Tất cả đăng ký trong giải đấu"
        subtitle="Dữ liệu thật từ database — duyệt tại đây hoặc tab Cấu hình cuộc đua"
      />
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-white/45">
          Chưa có đăng ký nào trong giải này.
        </div>
      ) : (
        <SimpleTable
          headers={[
            "Cuộc đua",
            "Ngựa",
            "Chủ ngựa",
            "Jockey",
            "Trạng thái",
            "Thao tác",
          ]}
          rows={rows}
        />
      )}
    </Card>
  );
}
