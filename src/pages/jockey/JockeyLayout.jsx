import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import RoleWalletBadge from "@/components/wallet/RoleWalletBadge";
import { WALLET_PATHS } from "@/constants/walletPaths";
import { useAuthStore } from "@/store/authStore";
import { useJockeySidebarMeta } from "./hooks/useJockeySidebarMeta";
import { JockeySidebar } from "./components/JockeySidebar";

function splitTitle(title) {
  if (!title.includes("·")) return [title, ""];
  return title.split("·").map((part) => part.trim());
}

export function JockeyLayout({ children, title, subtitle, actions }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const { displayName, sidebarMeta } = useJockeySidebarMeta();
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const isActive = (to) =>
    to === "/jockey" ? location.pathname === "/jockey" : location.pathname.startsWith(to);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const [head, tail] = splitTitle(title);

  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <JockeySidebar
        open={open}
        onClose={() => setOpen(false)}
        isActive={isActive}
        displayName={displayName}
        sidebarMeta={sidebarMeta}
        onLogout={handleLogout}
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-[#0A1628]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                placeholder="Tìm giải đấu, ngựa..."
                className="pl-10 pr-4 py-2 w-72 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4A017]/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RoleWalletBadge to={WALLET_PATHS.JOCKEY} walletMode="user" theme="dark" />
            <div className="flex items-center gap-2 pl-2 ml-2 border-l border-white/10">
              <div className="w-9 h-9 bg-gradient-to-br from-[#D4A017] to-[#B8941F] rounded-xl flex items-center justify-center font-bold shadow-md shadow-[#D4A017]/30">
                {avatarLetter}
              </div>
              <div className="hidden md:block text-sm font-semibold leading-tight">
                Xin chào, {displayName}
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 md:px-8 pt-6 pb-2 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              <span className="text-white">{head}</span>
              {tail && (
                <>
                  <span className="text-white/30"> · </span>
                  <span className="bg-gradient-to-r from-[#D4A017] to-[#E5B82F] bg-clip-text text-transparent">
                    {tail}
                  </span>
                </>
              )}
            </h1>
            {subtitle && <p className="text-sm text-white/50 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
        </div>

        <main className="px-4 md:px-8 py-6">{children}</main>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        >
          <button type="button" className="absolute top-4 right-4 p-2 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
