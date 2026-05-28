export function JockeyToggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-sm font-semibold text-white">{label}</div>
      <button
        onClick={onChange}
        className={`relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? "bg-[#D4A017]" : "bg-white/20"}`}
      >
        <span
          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-6" : "left-1"}`}
        />
      </button>
    </div>
  );
}
