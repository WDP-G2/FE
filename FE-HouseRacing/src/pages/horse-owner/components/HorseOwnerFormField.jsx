export function HorseOwnerFormField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-white/60 font-semibold">{label}</label>
      {children}
    </div>
  );
}
