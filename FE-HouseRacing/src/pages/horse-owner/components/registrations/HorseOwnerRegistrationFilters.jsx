import { RACE_REGISTRATION_STATUS_LABELS } from "@/services/raceRegistrationService";

const FILTERS = ["Tất cả", "PENDING", "APPROVED", "REJECTED", "WITHDRAWN", "CANCELLED"];

export function HorseOwnerRegistrationFilters({ filterStatus, onChangeFilterStatus }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {FILTERS.map((status) => (
        <button
          key={status}
          onClick={() => onChangeFilterStatus(status)}
          className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition-all ${
            filterStatus === status
              ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30"
              : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
          }`}
        >
          {RACE_REGISTRATION_STATUS_LABELS[status] ?? status}
        </button>
      ))}
    </div>
  );
}
