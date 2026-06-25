import { controlClass } from './styles'
import { formatMoneyInput, parseMoneyInput } from '@/utils/formatCurrency'

const compactClass =
  'h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none focus:border-[#dda50e]/65'

export function Input({ className = '', variant = 'compact', ...props }) {
  const base = variant === 'form' ? controlClass : compactClass
  return <input {...props} className={`${base} ${className}`} />
}

export function MoneyInput({ className = '', onChange, onValueChange, value, variant = 'compact', ...props }) {
  const handleChange = (event) => {
    const digits = parseMoneyInput(event.target.value)
    onValueChange?.(digits)
    onChange?.({
      ...event,
      target: {
        ...event.target,
        value: digits,
      },
    })
  }

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={formatMoneyInput(value)}
      onChange={handleChange}
      variant={variant}
      className={`tabular-nums ${className}`}
    />
  )
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
      ? `${controlClass} scrollbar-dark h-auto resize-none py-5 leading-7`
      : 'scrollbar-dark w-full resize-none rounded-xl border border-white/10 bg-[#162338] px-4 py-4 text-[15px] leading-7 text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/65'
  return <textarea {...props} rows={3} className={`${base} ${className}`} />
}
