import { AlertCircle, RefreshCw } from 'lucide-react'

export function LoadingState({ label = 'Đang tải dữ liệu...' }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-white/45">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4A017] border-t-transparent shadow-[0_0_15px_rgba(212,160,23,0.3)]" />
      </div>
      <span className="text-sm font-bold tracking-wide text-white/60">{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-rose-200 backdrop-blur-md shadow-xl shadow-rose-950/10">
      <div className="flex items-center gap-3 font-bold text-rose-300">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wide">Đã xảy ra lỗi</h4>
          <p className="mt-0.5 text-xs text-rose-200/70 font-semibold">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500/15 border border-rose-500/25 px-4 py-2 text-xs font-black text-rose-200 hover:bg-rose-500/25 hover:text-white transition-all active:scale-95 shadow-lg shadow-rose-950/20"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Tải lại dữ liệu
        </button>
      )}
    </div>
  )
}

export function Panel({ title, icon: Icon, actions, children, className = '' }) {
  return (
    <section className={`bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/20 hover:border-white/15 transition-all duration-300 p-5 ${className}`}>
      {title && (
        <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4.5 w-4.5 text-[#D4A017]" />}
            <h3 className="text-base font-black text-white tracking-wide">{title}</h3>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function EmptyState({ children }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-white/[0.015] p-6 text-center text-white/40">
      <p className="text-xs font-semibold">{children}</p>
    </div>
  )
}