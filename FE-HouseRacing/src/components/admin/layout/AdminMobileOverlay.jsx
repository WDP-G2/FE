import { X } from 'lucide-react'

export default function AdminMobileOverlay({ open, onClose }) {
  if (!open) return null

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-30 bg-black/50 lg:hidden"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Đóng menu"
        className="absolute right-4 top-4 p-2 text-white"
        onClick={onClose}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
