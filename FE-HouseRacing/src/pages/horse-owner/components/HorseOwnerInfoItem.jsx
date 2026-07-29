export function HorseOwnerInfoItem({ label, value }) {
  return (
    <div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider">
        {label}
      </div>
      <div className="text-xs text-white font-semibold mt-0.5 truncate">
        {value}
      </div>
    </div>
  );
}
