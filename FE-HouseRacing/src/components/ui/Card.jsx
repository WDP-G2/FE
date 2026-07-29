export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-white/[0.045] ${className}`}>
      {children}
    </div>
  )
}

export function FormCard({ children, className = '' }) {
  return (
    <section
      className={`overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045] ${className}`}
    >
      {children}
    </section>
  )
}

export function FormCardHeader({ icon: Icon, title, subtitle }) {
  return (
    <header className="flex items-center gap-5 border-b border-white/10 p-8">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dda50e]/15 text-[#dda50e]">
        <Icon className="h-8 w-8" />
      </span>
      <span>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="mt-1 text-base text-white/48">{subtitle}</p>
      </span>
    </header>
  )
}
