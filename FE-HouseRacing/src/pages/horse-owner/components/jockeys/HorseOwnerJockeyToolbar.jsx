import { Search } from "lucide-react";

export function HorseOwnerJockeyToolbar({
  filterStatus,
  onChangeFilterStatus,
  onChangeSearch,
  search,
  statusFilters,
}) {
  return (
    <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={search}
          onChange={(event) => onChangeSearch(event.target.value)}
          placeholder="Tìm theo tên, username, mã giấy phép..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-[#D4A017]/50 focus:outline-none"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => onChangeFilterStatus(status)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              filterStatus === status
                ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30"
                : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>
  );
}
