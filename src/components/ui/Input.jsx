import { controlClass } from './styles'

const compactClass =
  'h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none focus:border-[#dda50e]/65'

export function Input({ className = '', variant = 'compact', ...props }) {
  const base = variant === 'form' ? controlClass : compactClass
  return <input {...props} className={`${base} ${className}`} />
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="h-12 w-full rounded-xl border border-white/10 bg-[#17243a] px-4 text-white outline-none focus:border-[#dda50e]/65"
    >
      {children}
    </select>
  )
}

export function TextArea({ variant = 'compact', className = '', ...props }) {
  const base =
    variant === 'form'
      ? `${controlClass} h-auto resize-none py-5 leading-7`
      : 'w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-4 text-white outline-none focus:border-[#dda50e]/65'
  return <textarea {...props} rows={3} className={`${base} ${className}`} />
}
