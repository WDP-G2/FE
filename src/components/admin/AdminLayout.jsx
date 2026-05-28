import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Search,
  Settings,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const ADMIN_NAV = [
  { label: "Tổng quan", to: "/admin", icon: LayoutDashboard },
  { label: "Giải đấu", to: "/admin/tournaments", icon: Trophy },
  { label: "Tin tức", to: "/admin/news", icon: Newspaper },
  { label: "Người dùng", to: "/admin/users", icon: Users },
  { label: "Thống kê", to: "/admin/statistics", icon: BarChart3 },
  { label: "Thông báo", to: "/admin/notifications", icon: Bell },
  { label: "Cài đặt", to: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
  action,
  heading = "Tổng quan",
  highlight = "Bảng điều khiển",
  subtitle = "Thống kê hệ thống quản lý giải đua ngựa",
  showPageHeader = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    try {
      useAuthStore.getState().clearSession();
    } catch {
      localStorage.removeItem("auth_user");
    }
    navigate("/login");
  };

  const isActive = (to) =>
    to === "/admin"
      ? location.pathname === to
      : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-[#071426] font-sans text-white">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col border-r border-white/10 bg-[#111f3b] transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <Link
          to="/admin"
          className="flex h-[90px] items-center gap-4 border-b border-white/10 px-7"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dda50e] shadow-lg shadow-[#d4a017]/30">
            <Trophy className="h-7 w-7 text-white" />
          </span>
          <span>
            <span className="block text-xl font-bold leading-tight">
              Horse Racing
            </span>
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#dda50e]">
              Admin Console
            </span>
          </span>
        </Link>

        <nav
          aria-label="Điều hướng quản trị"
          className="flex-1 space-y-3 px-4 pt-5"
        >
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`flex h-16 items-center gap-5 rounded-2xl border px-5 text-base font-semibold transition ${
                  active
                    ? "border-[#d4a017]/40 bg-[#d4a017]/15 text-white shadow-lg shadow-[#d4a017]/10"
                    : "border-transparent text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-[#dda50e]" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-4 py-6">
          <button
            type="button"
            onClick={logout}
            className="flex h-14 w-full items-center gap-5 rounded-2xl px-5 font-semibold text-white/60 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-[90px] items-center justify-between border-b border-white/10 bg-[#071426]/95 px-4 backdrop-blur-xl md:px-7">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
              className="rounded-lg p-2 hover:bg-white/5 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <label className="relative hidden md:block">
              <span className="sr-only">Tìm kiếm</span>
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/45" />
              <input
                type="search"
                placeholder="Tìm kiếm giải đấu, ngựa, jockey..."
                className="h-14 w-[430px] rounded-2xl border border-white/10 bg-white/[0.04] pl-14 pr-4 text-base text-white outline-none placeholder:text-white/30 focus:border-[#d4a017]/60"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dda50e] text-xl font-bold shadow-lg shadow-[#d4a017]/30">
                A
              </span>
              <span className="hidden sm:block">
                <span className="block text-lg font-bold leading-5">Admin</span>
                <span className="block text-sm text-white/45">Super Admin</span>
              </span>
              <ChevronDown className="hidden h-5 w-5 text-white/45 sm:block" />
            </div>
          </div>
        </header>

        <main
          className={`px-4 pb-10 md:px-10 ${showPageHeader ? "pt-9" : "pt-0"}`}
        >
          {showPageHeader && (
            <div className="mb-11 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div>
                <h1 className="text-4xl font-bold tracking-tight md:text-[44px]">
                  {heading} <span className="text-white/35">·</span>{" "}
                  <span className="text-[#dda50e]">{highlight}</span>
                </h1>
                <p className="mt-2 text-lg text-white/50">{subtitle}</p>
              </div>
              {action}
            </div>
          )}

          {children}
        </main>
      </div>

      {open && (
        <div
          role="presentation"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Đóng menu"
            className="absolute right-5 top-5 p-2"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}
