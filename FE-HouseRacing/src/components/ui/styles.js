export const controlClass =
  'h-16 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-6 text-lg text-white outline-none placeholder:text-white/32 focus:border-[#dda50e]/60 disabled:text-white/35'

export const inputClass =
  'h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/60'

/** Select trên nền tối — tránh option chữ trắng trên nền trắng (Windows/Chrome) */
export const selectClass = `${inputClass} bg-[#162338] [color-scheme:dark]`

export const selectOptionClass = 'bg-[#162338] text-white'

export const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#dda50e] px-6 py-3 font-semibold text-white shadow-lg shadow-[#d4a017]/20 transition hover:bg-[#c8940f]'

export const primaryButtonLg =
  'inline-flex h-16 items-center gap-3 rounded-2xl bg-[#dda50e] px-8 text-lg font-semibold text-white shadow-xl shadow-[#d4a017]/25 transition hover:bg-[#c8940f]'

export const secondaryButton =
  'inline-flex h-16 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-8 text-lg font-semibold text-white transition hover:bg-white/[0.08]'
