export function JockeyStatRow({ k, v }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-white/50">{k}</span>
      <span className="text-white font-semibold">{v}</span>
    </div>
  );
}
