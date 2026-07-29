import { INVITATION_FILTERS } from "../../utils/jockeyInvitationUtils";

export function InvitationFilterBar({ filter, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {INVITATION_FILTERS.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onChange(item.key)}
          className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition-all ${
            filter === item.key
              ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30"
              : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
