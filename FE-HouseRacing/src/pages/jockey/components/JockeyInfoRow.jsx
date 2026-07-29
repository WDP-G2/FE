export function JockeyInfoRow({ icon: Icon, text, highlight }) {
  return (
    <div className="flex items-center gap-2">
      <Icon
        className={`w-3.5 h-3.5 flex-shrink-0 ${highlight ? "text-[#D4A017]" : "text-white/40"}`}
      />
      <span
        className={`text-xs ${highlight ? "text-[#D4A017] font-semibold" : "text-white/60"}`}
      >
        {text}
      </span>
    </div>
  );
}
