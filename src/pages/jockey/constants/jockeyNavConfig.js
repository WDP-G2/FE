import {
  LayoutDashboard,
  User,
  Mail,
  Calendar,
  Flag,
  PawPrint,
  BarChart3,
  Trophy,
  Wallet,
} from "lucide-react";

export const JOCKEY_NAV = [
  { label: "Dashboard", to: "/jockey", icon: LayoutDashboard },
  { label: "Hồ sơ cá nhân", to: "/jockey/profile", icon: User },
  { label: "Lời mời thi đấu", to: "/jockey/invitations", icon: Mail },
  { label: "Giải đấu", to: "/jockey/tournaments", icon: Flag },
  { label: "Lịch thi đấu", to: "/jockey/schedules", icon: Calendar },
  { label: "Ngựa được giao", to: "/jockey/horses", icon: PawPrint },
  { label: "Kết quả thi đấu", to: "/jockey/results", icon: BarChart3 },
  { label: "Bảng xếp hạng", to: "/jockey/rankings", icon: Trophy },
  { label: "Ví của tôi", to: "/jockey/wallet", icon: Wallet },
];
