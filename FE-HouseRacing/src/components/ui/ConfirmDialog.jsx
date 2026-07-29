import { AlertTriangle, X } from 'lucide-react'
import { GhostButton, PrimaryButton } from '@/components/ui/AdminButton'

/**
 * Dark-glass confirm modal replacing window.confirm() for admin flows.
 * `tone: 'danger'` tints the icon/confirm button red for destructive actions.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy',
  tone = 'default',
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111f3b] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3 border-b border-white/10 px-6 py-5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              tone === 'danger' ? 'bg-rose-500/15 text-rose-300' : 'bg-[#dda50e]/15 text-[#dda50e]'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="mt-1 flex-1 text-base font-bold text-white">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5 text-sm leading-relaxed text-white/75">{message}</div>
        <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-5">
          <GhostButton onClick={onCancel}>{cancelLabel}</GhostButton>
          <PrimaryButton
            onClick={onConfirm}
            className={tone === 'danger' ? '!bg-rose-500 !shadow-rose-500/30 hover:!bg-rose-600' : ''}
          >
            {confirmLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}
