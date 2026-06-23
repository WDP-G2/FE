import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CircleDollarSign,
  Gauge,
  History,
  LogOut,
  Trophy,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { notificationService } from "@/services/notificationService";

const NAV_ITEMS = [
  { to: "/spectator/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/spectator/tournaments", label: "Tournaments", icon: Trophy },
  { to: "/spectator/betting", label: "Betting", icon: CircleDollarSign },
  { to: "/spectator/bets", label: "My Bets", icon: History },
  { to: "/spectator/wallet", label: "Wallet", icon: Wallet },
  { to: "/spectator/notifications", label: "Notifications", icon: Bell },
];

export default function SpectatorLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let ignore = false;
    notificationService
      .getUnreadCount()
      .then((count) => {
        if (!ignore) setUnread(count);
      })
      .catch(() => {
        if (!ignore) setUnread(0);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đăng xuất thành công");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Không thể đăng xuất");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <header className="border-b border-white/10 bg-[#0A1628]/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/spectator/dashboard" className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[#D4A017]">
                Spectator Portal
              </p>
              <h1 className="truncate text-xl font-black text-white">
                {user?.fullName || user?.email || "Spectator"}
              </h1>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white/75 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>

          <nav className="flex gap-2 overflow-x-auto pb-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                    isActive
                      ? "border-[#D4A017]/60 bg-[#D4A017]/15 text-[#D4A017]"
                      : "border-white/10 bg-white/[0.04] text-white/62 hover:border-white/25 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {label === "Notifications" && unread > 0 && (
                  <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] leading-none text-white">
                    {unread}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}
