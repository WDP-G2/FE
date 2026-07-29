export function HorseOwnerStatBox({ label, value, tone }) {
  const tones = {
    gold: "text-[#D4A017]",
    green: "text-emerald-300",
    blue: "text-sky-300",
    purple: "text-purple-300",
  };

  return (
    <div className="p-3 bg-white/[0.04] rounded-xl border border-white/10">
      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={`text-sm font-bold ${tones[tone] ?? "text-white"}`}>
        {value}
      </div>
    </div>
  );
}
