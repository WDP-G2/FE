export default function Field({ label, children, full = false, icon: Icon }) {
  return (
    <label className={full ? 'md:col-span-2' : ''}>
      <span
        className={`mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55 ${
          Icon ? 'flex items-center gap-2' : ''
        }`}
      >
        {Icon && <Icon className="h-4 w-4 text-[#dda50e]" />}
        {label}
      </span>
      {children}
    </label>
  )
}
