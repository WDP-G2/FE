import { Activity, FileText, Flag, Trophy, Users } from "lucide-react";
import {
  Card,
  SectionHeading,
  StatCard,
} from "@/components/admin/tournament-detail/DetailUi";
import { formatVnd } from "@/components/admin/tournament-detail/detailData";

export default function OverviewTab({
  tournament,
  totalPrize,
  totalRegistered,
}) {
  return (
    <>
      <div className="mb-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Flag}
          tone="gold"
          value={String(tournament.races.length)}
          label="Cuộc đua"
        />
        <StatCard
          icon={Users}
          tone="green"
          value={String(totalRegistered)}
          label="Đăng ký"
        />
        <StatCard
          icon={Trophy}
          tone="purple"
          value={formatVnd(totalPrize)}
          label="Tổng giải thưởng"
        />
        <StatCard
          icon={Activity}
          tone="blue"
          value={tournament.status}
          label="Trạng thái"
        />
      </div>

      <Card className="p-8">
        <SectionHeading icon={FileText}>Mô tả giải đấu</SectionHeading>
        <p className="mb-10 text-lg leading-8 text-white/70">
          {tournament.description}
        </p>
        <SectionHeading icon={FileText}>Luật giải đấu</SectionHeading>
        <pre className="whitespace-pre-wrap rounded-3xl border border-white/10 bg-white/[0.035] p-7 font-sans text-lg leading-8 text-white/70">
          {tournament.rules}
        </pre>
      </Card>
    </>
  );
}
