import { Link } from "react-router-dom";
import { Calendar, Mail } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { PrimaryButton, GhostButton } from "../admin/AdminLayout";
import { useJockeyDashboard } from "./hooks/useJockeyDashboard";
import { JockeyErrorBanner } from "./components/JockeyErrorBanner";
import { DashboardStats } from "./components/dashboard/DashboardStats";
import { UpcomingSchedulesCard } from "./components/dashboard/UpcomingSchedulesCard";
import { PendingInvitationsCard } from "./components/dashboard/PendingInvitationsCard";
import { RecentResultsCard } from "./components/dashboard/RecentResultsCard";

export function JockeyDashboard() {
  const {
    profile,
    schedules,
    results,
    ranking,
    totalPrize,
    loading,
    error,
    pendingInvitations,
    displayName,
  } = useJockeyDashboard();

  return (
    <JockeyLayout
      title="Jockey · Dashboard"
      subtitle={
        loading
          ? "Đang tải dữ liệu..."
          : `Chào ${displayName} · Rank #${profile?.ranking ?? "—"} · ${pendingInvitations.length} lời mời đang chờ`
      }
      actions={
        <>
          <Link to="/jockey/invitations">
            <GhostButton icon={Mail}>Lời mời ({pendingInvitations.length})</GhostButton>
          </Link>
          <Link to="/jockey/schedules">
            <PrimaryButton icon={Calendar}>Lịch race</PrimaryButton>
          </Link>
        </>
      }
    >
      <JockeyErrorBanner message={error} />

      <DashboardStats profile={profile} ranking={ranking} totalPrize={totalPrize} />

      <div className="space-y-6">
        <UpcomingSchedulesCard loading={loading} schedules={schedules} />
        <PendingInvitationsCard invitations={pendingInvitations} />
        <RecentResultsCard results={results} />
      </div>
    </JockeyLayout>
  );
}
