import { Search } from "lucide-react";

export function HorseOwnerHorseSearch({ value, onChange }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Tìm theo tên, giống ngựa..."
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-[#D4A017]/50 focus:outline-none"
        />
      </div>
    </div>
  );
}
