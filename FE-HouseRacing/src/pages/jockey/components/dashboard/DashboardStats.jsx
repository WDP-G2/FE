import { Trophy, TrendingUp, Medal } from "lucide-react";
import { StatCard } from "../../../admin/AdminLayout";
import { fmtVND } from "@/utils/formatCurrency";

export function DashboardStats({ profile, ranking, totalPrize }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Xếp hạng"
        value={`#${profile?.ranking ?? "—"}`}
        icon={Trophy}
        tone="gold"
        delta={ranking ? `${ranking.wins} thắng` : undefined}
      />
      <StatCard
        label="Tổng chiến thắng"
        value={String(profile?.wins ?? 0)}
        icon={Medal}
        tone="green"
      />
      <StatCard
        label="Tỷ lệ thắng"
        value={`${profile?.winRate ?? 0}%`}
        icon={TrendingUp}
        tone="blue"
      />
      <StatCard
        label="Tổng thưởng"
        value={fmtVND(totalPrize).replace("₫", "").trim()}
        icon={Trophy}
        tone="purple"
      />
    </div>
  );
}
