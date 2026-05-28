const tones = {
  gold: 'border-[#dda50e]/40 bg-[#dda50e]/15 text-[#efbb2c]',
  green: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-300',
  blue: 'border-sky-400/35 bg-sky-500/15 text-sky-300',
  purple: 'border-purple-400/35 bg-purple-500/15 text-purple-300',
  red: 'border-rose-400/35 bg-rose-500/15 text-rose-300',
  gray: 'border-white/15 bg-white/10 text-white/65',
}

export default function Badge({ children, tone = 'gray' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
