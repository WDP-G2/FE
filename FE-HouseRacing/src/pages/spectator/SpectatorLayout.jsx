import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  CircleDollarSign,
  Gauge,
  History,
  LogOut,
  Trophy,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { notificationService } from "@/services/notificationService";

const NAV_ITEMS = [
  { to: "/spectator/dashboard", label: "Tổng quan", icon: Gauge },
  { to: "/spectator/tournaments", label: "Giải đấu", icon: Trophy },
  { to: "/spectator/betting", label: "Đặt cược", icon: CircleDollarSign },
  { to: "/spectator/bets", label: "Lịch sử cược", icon: History },
  { to: "/spectator/wallet", label: "Ví", icon: Wallet },
  { to: "/spectator/notifications", label: "Thông báo", icon: Bell },
];

export default function SpectatorLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const displayName = user?.fullName || user?.username || user?.email || "Khán giả";
  const avatarLetter = displayName.charAt(0).toUpperCase();

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

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
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
    <div className="relative min-h-screen bg-[#060D19] text-white overflow-x-hidden">
      {/* Decorative Ambient Background Orbs */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-[#D4A017]/8 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 -z-10 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 -z-10 h-[300px] w-[300px] rounded-full bg-purple-600/5 blur-[100px] pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] pointer-events-none" />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0A1628]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-4 py-4 md:flex-nowrap md:px-8 gap-4">
          
          {/* Logo / Branding */}
          <Link to="/spectator/dashboard" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4A017] blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              <Trophy className="w-8 h-8 text-[#D4A017] relative z-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white tracking-tight leading-none mb-1">HORSE RACING</span>
              <span className="text-[9px] text-[#D4A017] tracking-widest font-semibold uppercase leading-none">
                Cổng khán giả
              </span>
            </div>
          </Link>

          {/* User Profile Dropdown Menu */}
          <div className="flex items-center gap-3 shrink-0 md:order-last" ref={userMenuRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 pr-3 text-sm font-bold text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#D4A017] to-[#B8941F] rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-md shadow-[#D4A017]/30">
                    {avatarLetter}
                  </div>
                )}
                <span className="hidden sm:inline-block max-w-[120px] truncate">
                  {displayName}
                </span>
                <ChevronDown className={`h-4 w-4 text-white/60 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#0F1E3A]/95 p-1 backdrop-blur-xl shadow-2xl z-50">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-[10px] font-semibold text-[#D4A017] uppercase tracking-wider">Tài khoản</p>
                    <p className="text-sm font-bold truncate text-white">{displayName}</p>
                    <p className="text-xs text-white/50 truncate">{user?.email}</p>
                  </div>
                  <div className="p-1 space-y-0.5">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white transition"
                    >
                      <User className="h-4 w-4 text-[#D4A017]" />
                      <span>Hồ sơ của tôi</span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex gap-2 overflow-x-auto pb-1 order-3 md:order-2 w-full md:w-auto justify-start md:justify-center">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${isActive
                    ? "border-[#D4A017]/60 bg-[#D4A017]/15 text-[#D4A017]"
                    : "border-white/10 bg-white/[0.04] text-white/60 hover:border-white/25 hover:text-white"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
                {to === "/spectator/notifications" && unread > 0 && (
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
