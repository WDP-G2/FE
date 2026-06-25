import { AlertTriangle } from "lucide-react";

export function ConflictBadge({ type = "warning", children }) {
  const classes =
    type === "danger"
      ? "border-red-400/40 bg-red-500/15 text-red-100"
      : "border-amber-300/45 bg-amber-400/15 text-amber-100";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${classes}`}
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}
