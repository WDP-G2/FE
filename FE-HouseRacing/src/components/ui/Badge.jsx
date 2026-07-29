const tones = {
  gold: 'border-[#f2c94c]/70 bg-[#dda50e]/35 text-[#fff4c2]',
  green: 'border-emerald-300/65 bg-emerald-500/30 text-emerald-100',
  blue: 'border-sky-300/65 bg-sky-500/30 text-sky-100',
  purple: 'border-purple-300/65 bg-purple-500/30 text-purple-100',
  red: 'border-rose-300/65 bg-rose-500/30 text-rose-100',
  gray: 'border-white/35 bg-white/18 text-white',
}

export default function Badge({ children, tone = 'gray' }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm shadow-black/30 backdrop-blur-md ${tones[tone]}`}
    >
      {children}
    </span>
  )
}
