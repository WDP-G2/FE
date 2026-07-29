import { Link } from "react-router-dom";
import { LogOut, Zap } from "lucide-react";
import { JOCKEY_NAV } from "../constants/jockeyNavConfig";

export function JockeySidebar({
  open,
  onClose,
  isActive,
  displayName,
  sidebarMeta,
  onLogout,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0F1E3A]/95 backdrop-blur-xl border-r border-white/10 transition-transform ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
        <div className="w-9 h-9 bg-gradient-to-br from-[#D4A017] to-[#B8941F] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4A017]/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold leading-tight">Horse Racing</div>
          <div className="text-[10px] text-[#D4A017] uppercase tracking-wider font-semibold">
            Jockey Portal
          </div>
        </div>
      </div>

      <nav
        className="p-3 space-y-0.5 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 160px)" }}
      >
        {JOCKEY_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-[#D4A017]/15 text-white border border-[#D4A017]/30 shadow-md shadow-[#D4A017]/10" : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#D4A017]" : ""}`} />
              <span className="font-semibold truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10">
        <div className="mb-2 p-3 bg-white/[0.04] rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold">
              Sẵn sàng
            </span>
          </div>
          <div className="text-[11px] text-white/60">
            {displayName}
            {sidebarMeta.rank != null ? ` · Hạng #${sidebarMeta.rank}` : ""}
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">{sidebarMeta.status}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-semibold">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
