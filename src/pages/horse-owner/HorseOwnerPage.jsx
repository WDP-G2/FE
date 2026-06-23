import { useLocation } from "react-router-dom";
import { HorseOwnerDashboard } from "./HorseOwnerDashboard";
import { HorseOwnerProfile } from "./HorseOwnerProfile";
import { HorseOwnerHorses } from "./HorseOwnerHorses";
import { HorseOwnerTournaments } from "./HorseOwnerTournaments";
import { HorseOwnerTournamentDetailPage } from "./HorseOwnerTournamentDetailPage";
import { HorseOwnerRegistrations } from "./HorseOwnerRegistrations";
import { HorseOwnerJockeys } from "./HorseOwnerJockeys";
import { HorseOwnerPayments } from "./HorseOwnerPayments";
import { HorseOwnerResults } from "./HorseOwnerResults";
import { HorseOwnerSettings } from "./HorseOwnerSettings";
import { HorseOwnerWallet } from "./HorseOwnerWallet";

export default function HorseOwnerPage() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/horse-owner/profile")) return <HorseOwnerProfile />;
  if (pathname.startsWith("/horse-owner/horses")) return <HorseOwnerHorses />;
  if (/^\/horse-owner\/tournaments\/[^/]+/.test(pathname))
    return <HorseOwnerTournamentDetailPage />;
  if (pathname.startsWith("/horse-owner/tournaments"))
    return <HorseOwnerTournaments />;
  if (pathname.startsWith("/horse-owner/registrations"))
    return <HorseOwnerRegistrations />;
  if (pathname.startsWith("/horse-owner/jockeys")) return <HorseOwnerJockeys />;
  if (pathname.startsWith("/horse-owner/wallet")) return <HorseOwnerWallet />;
  if (pathname.startsWith("/horse-owner/payments"))
    return <HorseOwnerPayments />;
  if (pathname.startsWith("/horse-owner/results")) return <HorseOwnerResults />;
  if (pathname.startsWith("/horse-owner/settings"))
    return <HorseOwnerSettings />;

  return <HorseOwnerDashboard />;
}
