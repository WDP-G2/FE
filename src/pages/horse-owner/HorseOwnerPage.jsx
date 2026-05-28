import { useLocation } from "react-router-dom";
import { HorseOwnerDashboard } from "./HorseOwnerDashboard";
import { HorseOwnerProfile } from "./HorseOwnerProfile";
import { HorseOwnerHorses } from "./HorseOwnerHorses";
import { HorseOwnerTournaments } from "./HorseOwnerTournaments";
import { HorseOwnerRegistrations } from "./HorseOwnerRegistrations";
import { HorseOwnerTournamentRegisterPage } from "./HorseOwnerTournamentRegisterPage";
import { HorseOwnerJockeys } from "./HorseOwnerJockeys";
import { HorseOwnerPayments } from "./HorseOwnerPayments";
import { HorseOwnerResults } from "./HorseOwnerResults";
import { HorseOwnerNotifications } from "./HorseOwnerNotifications";
import { HorseOwnerSettings } from "./HorseOwnerSettings";
import HorseOwnerHorseDetailPage from "./HorseOwnerHorseDetailPage";

export default function HorseOwnerPage() {
  const { pathname } = useLocation();
  const detailMatch = pathname.match(/^\/horse-owner\/horses\/([^/]+)$/);
  const registerMatch = pathname.match(
    /^\/horse-owner\/tournaments\/([^/]+)\/register$/,
  );
  const horseId = detailMatch ? detailMatch[1] : "";

  if (pathname.startsWith("/horse-owner/profile")) return <HorseOwnerProfile />;
  if (horseId) return <HorseOwnerHorseDetailPage horseId={horseId} />;
  if (registerMatch) return <HorseOwnerTournamentRegisterPage />;
  if (pathname.startsWith("/horse-owner/horses")) return <HorseOwnerHorses />;
  if (pathname.startsWith("/horse-owner/tournaments"))
    return <HorseOwnerTournaments />;
  if (pathname.startsWith("/horse-owner/registrations"))
    return <HorseOwnerRegistrations />;
  if (pathname.startsWith("/horse-owner/jockeys")) return <HorseOwnerJockeys />;
  if (pathname.startsWith("/horse-owner/payments"))
    return <HorseOwnerPayments />;
  if (pathname.startsWith("/horse-owner/results")) return <HorseOwnerResults />;
  if (pathname.startsWith("/horse-owner/notifications"))
    return <HorseOwnerNotifications />;
  if (pathname.startsWith("/horse-owner/settings"))
    return <HorseOwnerSettings />;

  return <HorseOwnerDashboard />;
}
