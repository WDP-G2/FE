import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function JockeyQuickAction({ to, icon: Icon, label, sub }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all group"
    >
      <div className="w-9 h-9 bg-[#D4A017]/15 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#D4A017]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{label}</div>
        <div className="text-[11px] text-white/50 truncate">{sub}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#D4A017] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
