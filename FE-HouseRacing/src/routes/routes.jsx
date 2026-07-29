import { Navigate, createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import RoleProtectedRoute from "@/auth/RoleProtectedRoute";

import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import RankingsPage from "@/pages/RankingsPage";
import NewsPage from "@/pages/news/NewsPage";
import NewsDetailPage from "@/pages/news/NewsDetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import VerifyOtpPage from "@/pages/auth/VerifyOtpPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import HorseOwnerPage from "@/pages/horse-owner/HorseOwnerPage";
import JockeyPage from "@/pages/jockey/JockeyPage";
import RefereePage from "@/pages/referee/RefereePage";
import DashboardWalletRedirectPage from "@/pages/dashboard/DashboardWalletRedirectPage";
import SpectatorLayout from "@/pages/spectator/SpectatorLayout";
import SpectatorDashboard from "@/pages/spectator/SpectatorDashboard";
import SpectatorTournaments from "@/pages/spectator/SpectatorTournaments";
import SpectatorTournamentDetail from "@/pages/spectator/SpectatorTournamentDetail";
import SpectatorBetting from "@/pages/spectator/SpectatorBetting";
import SpectatorBets from "@/pages/spectator/SpectatorBets";
import SpectatorWallet from "@/pages/spectator/SpectatorWallet";
import SpectatorNotifications from "@/pages/spectator/SpectatorNotifications";
import TournamentsPage from "@/pages/TournamentsPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import UnauthorizedPage from "@/pages/errors/UnauthorizedPage";
import { adminRoutes } from "./adminRoutes";
import { withAuth } from "./guards";
export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", Component: HomePage },
      { path: "/about", Component: AboutPage },
      { path: "/news", Component: NewsPage },
      { path: "/news/:id", Component: NewsDetailPage },
      { path: "/tournaments", Component: TournamentsPage },
      { path: "/rankings", Component: RankingsPage },
      { path: "/dashboard", element: withAuth(<DashboardPage />) },
      {
        path: "/dashboard/wallet",
        element: withAuth(<DashboardWalletRedirectPage />),
      },
      { path: "/profile", element: withAuth(<ProfilePage />) },
      { path: "/unauthorized", element: withAuth(<UnauthorizedPage />) },
    ],
  },
  {
    path: "/spectator",
    element: withAuth(
      <RoleProtectedRoute allowedRoles={["SPECTATOR"]}>
        <SpectatorLayout />
      </RoleProtectedRoute>,
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <SpectatorDashboard /> },
      { path: "tournaments", element: <SpectatorTournaments /> },
      { path: "tournaments/:id", element: <SpectatorTournamentDetail /> },
      { path: "betting", element: <SpectatorBetting /> },
      { path: "bets", element: <SpectatorBets /> },
      { path: "wallet", element: <SpectatorWallet /> },
      { path: "notifications", element: <SpectatorNotifications /> },
    ],
  },
  {
    path: "/referee/*",
    element: withAuth(
      <RoleProtectedRoute allowedRoles={["REFEREE"]}>
        <RefereePage />
      </RoleProtectedRoute>,
    ),
  },
  {
    path: "/jockey/*",
    element: withAuth(
      <RoleProtectedRoute allowedRoles={["JOCKEY"]}>
        <JockeyPage />
      </RoleProtectedRoute>,
    ),
  },
  {
    path: "/horse-owner/*",
    element: withAuth(
      <RoleProtectedRoute allowedRoles={["OWNER"]}>
        <HorseOwnerPage />
      </RoleProtectedRoute>,
    ),
  },
  ...adminRoutes,
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  { path: "/forgot-password", Component: ForgotPasswordPage },
  { path: "/verify-otp", Component: VerifyOtpPage },
  { path: "/reset-password", Component: ResetPasswordPage },
  { path: "*", Component: NotFoundPage },
]);
