import { Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { PanelHeader, SimpleTable } from "@/components/ui/Panel";
import { registrationsFor } from "../utils";

export default function RaceRegistrations({ race }) {
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
