import { AlertCircle, RefreshCw } from 'lucide-react'

export function LoadingState({ label = 'Dang tai du lieu...' }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-white/45">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4A017] border-t-transparent" />
      <span className="text-sm font-bold">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 p-5 text-rose-100">
      <div className="flex items-center gap-2 font-bold">
        <AlertCircle className="h-5 w-5" />
        {message}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/15"
        >
          <RefreshCw className="h-4 w-4" />
          Tai lai
        </button>
      )}
    </div>
  )
}

export function Panel({ title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.045] p-5 ${className}`}>
      {title && <h3 className="mb-4 text-lg font-black text-white">{title}</h3>}
      {children}
    </section>
  )
}

export function EmptyState({ children }) {
  return (
    <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/45">
      {children}
    </p>
  )
}