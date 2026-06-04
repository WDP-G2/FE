import { useLocation } from "react-router-dom";
import { JockeyDashboard } from "./JockeyDashboard";
import { JockeyProfile } from "./JockeyProfile";
import { JockeyInvitations } from "./JockeyInvitations";
import { JockeyTournaments } from "./JockeyTournaments";
import { JockeyTournamentDetailPage } from "./JockeyTournamentDetailPage";
import { JockeySchedules } from "./JockeySchedules";
import { JockeyHorses } from "./JockeyHorses";
import { JockeyResults } from "./JockeyResults";
import { JockeyRankings } from "./JockeyRankings";
import { JockeyNotifications } from "./JockeyNotifications";
import { JockeySettings } from "./JockeySettings";
import { JockeyWallet } from "./JockeyWallet";

export default function JockeyPage() {
  const { pathname } = useLocation();
  if (pathname.startsWith("/jockey/profile")) return <JockeyProfile />;
  if (pathname.startsWith("/jockey/invitations")) return <JockeyInvitations />;
  if (/^\/jockey\/tournaments\/[^/]+/.test(pathname))
    return <JockeyTournamentDetailPage />;
  if (pathname.startsWith("/jockey/tournaments")) return <JockeyTournaments />;
  if (pathname.startsWith("/jockey/schedules")) return <JockeySchedules />;
  if (pathname.startsWith("/jockey/horses")) return <JockeyHorses />;
  if (pathname.startsWith("/jockey/results")) return <JockeyResults />;
  if (pathname.startsWith("/jockey/rankings")) return <JockeyRankings />;
  if (pathname.startsWith("/jockey/wallet")) return <JockeyWallet />;
  if (pathname.startsWith("/jockey/notifications"))
    return <JockeyNotifications />;
  if (pathname.startsWith("/jockey/settings")) return <JockeySettings />;
  return <JockeyDashboard />;
}
