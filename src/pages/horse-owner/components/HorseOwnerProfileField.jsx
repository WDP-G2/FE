export function HorseOwnerProfileField({ label, children, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs text-white/50 font-semibold uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export function HorseOwnerProfileValue({ children }) {
  return (
    <div className="text-sm text-white py-2.5 px-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
      {children}
    </div>
  );
}
