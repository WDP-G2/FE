import { Children, isValidElement, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { controlClass } from './styles'

const compactClass =
  'h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none focus:border-[#dda50e]/65'

export function Input({ className = '', variant = 'compact', ...props }) {
  const base = variant === 'form' ? controlClass : compactClass
  return <input {...props} className={`${base} ${className}`} />
}

export function Select({
  children,
  className = '',
  disabled = false,
  name,
  onChange,
  value,
  variant = 'compact',
}) {
  const [open, setOpen] = useState(false)
  const base = variant === 'form' ? controlClass : compactClass
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => ({
      disabled: Boolean(child.props.disabled),
      label: child.props.children,
      value: child.props.value ?? child.props.children,
    }))
  const selected = options.find((option) => option.value === value) ?? options[0]

  const choose = (option) => {
    if (option.disabled) return
    onChange?.({ target: { name, value: option.value } })
    setOpen(false)
  }

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false)
        }
      }}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`${base} flex items-center justify-between bg-[#17243a] text-left disabled:cursor-not-allowed disabled:text-white/35 ${className}`}
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <ChevronDown className="ml-3 h-5 w-5 shrink-0 text-white/70" />
      </button>
      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-auto rounded-2xl border border-[#dda50e]/35 bg-[#17243a] py-2 shadow-2xl shadow-black/45">
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              disabled={option.disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
              className={`block w-full px-5 py-3 text-left text-lg transition disabled:cursor-not-allowed disabled:text-white/30 ${
                option.value === value
                  ? 'bg-[#dda50e]/15 text-[#ffe09a]'
                  : 'text-white hover:bg-white/[0.08]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function TextArea({ variant = 'compact', className = '', ...props }) {
  const base =
    variant === 'form'
      ? `${controlClass} h-auto resize-none py-5 leading-7`
      : 'w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-4 text-white outline-none focus:border-[#dda50e]/65'
  return <textarea {...props} rows={3} className={`${base} ${className}`} />
}
