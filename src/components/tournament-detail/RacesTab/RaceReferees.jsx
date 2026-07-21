import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Gavel } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { PanelHeader } from "@/components/ui/Panel";
import { refereeService } from "@/services/refereeService";
import { getPublishedAssignmentEntry } from "@/services/refereeAssignmentService";
import { formatDisplayDate } from "@/utils/dateFormat";
import { getAdminRaceDisplayStatus, toneForStatus } from "../utils";

function resolveRefereeAssignment(race, refereesById) {
  const published = getPublishedAssignmentEntry(race.id);
  const refereeId =
    race.refereeId ||
    race.raw?.refereeId ||
    published?.assignments?.[0]?.refereeId ||
    null;

  const name =
    race.refereeName?.trim() ||
    race.raw?.refereeUsername ||
    published?.assignments?.[0]?.refereeName ||
    (refereeId ? refereesById.get(String(refereeId))?.name : "") ||
    "";

  const referee = refereeId ? refereesById.get(String(refereeId)) : null;

  return {
    assigned: Boolean(refereeId || name),
    name,
    referee,
  };
}

function assignmentTone(assigned) {
  return assigned ? "green" : "blue";
}

export default function RaceReferees({ race, tournament }) {
  const [referees, setReferees] = useState([]);
  const [loadingReferees, setLoadingReferees] = useState(true);
  const [assignmentsVersion, setAssignmentsVersion] = useState(0);

  const tournamentRaces = tournament.races ?? [];

  const refereesById = useMemo(
    () => new Map(referees.map((referee) => [referee.id, referee])),
    [referees],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadReferees() {
      try {
        setLoadingReferees(true);
        const data = await refereeService.getAvailableReferees();
        if (!cancelled) setReferees(data);
      } catch {
        if (!cancelled) setReferees([]);
      } finally {
        if (!cancelled) setLoadingReferees(false);
      }
    }

    loadReferees();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleAssignmentsUpdated = () => setAssignmentsVersion((value) => value + 1);
    window.addEventListener("referee-assignments-updated", handleAssignmentsUpdated);
    return () => window.removeEventListener("referee-assignments-updated", handleAssignmentsUpdated);
  }, []);

  return (
    <div className="space-y-6">
      <Card className="min-w-0 overflow-hidden">
        <PanelHeader
          icon={Gavel}
          title="Trọng tài theo vòng đua"
          subtitle={`${tournamentRaces.length} cuộc đua trong giải · đồng bộ từ phân công admin`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 pb-4">
          <p className="text-sm text-white/55">
            Xem trạng thái phân công trọng tài cho từng cuộc đua của giải{" "}
            <strong className="text-white/80">{tournament.name}</strong>. Phân công tại trang
            riêng.
          </p>
          <Link
            to="/admin/judges"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#dda50e] hover:underline"
          >
            Mở trang phân công
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="max-w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
                {[
                  "Vòng",
                  "Cuộc đua",
                  "Lịch",
                  "Trạng thái cuộc đua",
                  "Trọng tài",
                  "Phân công",
                ].map((header) => (
                  <th key={header} className="px-5 py-4">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tournamentRaces.map((item) => {
                const { assigned, name, referee } = resolveRefereeAssignment(
                  item,
                  refereesById,
                );
                const isActive = String(item.id) === String(race.id);
                const displayStatus = getAdminRaceDisplayStatus(item);

                return (
                  <tr
                    key={`${item.id}-${assignmentsVersion}`}
                    className={`border-b border-white/5 text-sm last:border-0 ${
                      isActive ? "bg-[#dda50e]/10" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-semibold text-white">R{item.no}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{item.name}</div>
                      {isActive ? (
                        <span className="text-xs text-[#dda50e]">Đang xem</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-white/60">
                      {formatDisplayDate(item.date, "Chưa có ngày")}
                      {item.time ? ` · ${item.time}` : ""}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={toneForStatus(displayStatus)}>{displayStatus}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      {loadingReferees && assigned && !name ? (
                        <span className="text-white/40">Đang tải...</span>
                      ) : assigned && name ? (
                        <div>
                          <div className="font-medium text-white/85">{name}</div>
                          {referee ? (
                            <span className="text-xs text-white/45">
                              {referee.license !== "Chưa có giấy phép"
                                ? `GP: ${referee.license}`
                                : "Trọng tài"}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={assignmentTone(assigned)}>
                        {assigned ? "Đã phân công" : "Chưa phân công"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
