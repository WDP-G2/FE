export default function JudgeMetric({ label, value, tone = 'default' }) {
  const color =
    tone === 'green' ? 'text-emerald-300' : tone === 'gold' ? 'text-[#D4A017]' : 'text-white'

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center">
      <div className={`text-base font-bold ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
    </div>
  )
}
