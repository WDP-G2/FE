import { Link } from 'react-router-dom'

const primaryClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#dda50e] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#d4a017]/30 transition hover:bg-[#c8940f] disabled:cursor-not-allowed disabled:opacity-50'

const primaryLgClass =
  'inline-flex h-14 items-center gap-3 rounded-2xl bg-[#dda50e] px-8 text-base font-semibold text-white shadow-xl shadow-[#d4a017]/25 transition hover:bg-[#c8940f] disabled:cursor-not-allowed disabled:opacity-50'

const ghostClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50'

export function PrimaryButton({ children, icon: Icon, size = 'md', className = '', ...props }) {
  const base = size === 'lg' ? primaryLgClass : primaryClass
  return (
    <button type="button" className={`${base} ${className}`} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}

export function PrimaryLink({ children, icon: Icon, size = 'md', className = '', ...props }) {
  const base = size === 'lg' ? primaryLgClass : primaryClass
  return (
    <Link className={`${base} ${className}`} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  )
}

export function GhostButton({ children, icon: Icon, className = '', ...props }) {
  return (
    <button type="button" className={`${ghostClass} ${className}`} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  )
}
