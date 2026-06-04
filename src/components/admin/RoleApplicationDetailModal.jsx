import { useMemo, useState } from 'react'
import { Check, ExternalLink, Shield, X, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { GhostButton, PrimaryButton } from '@/components/ui/AdminButton'
import { adminUserService } from '@/services/adminUserService'
import { getApiErrorMessage } from '@/utils/apiError'
import { buildRoleApplicationDetailRows } from '@/utils/roleApplicationDetails'

function DetailRow({ label, value, isUrl }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/45">{label}</p>
      {isUrl ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#dda50e] hover:underline"
        >
          Xem tài liệu / ảnh
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ) : (
        <p className="mt-1 whitespace-pre-wrap text-sm text-white/85">{value}</p>
      )}
    </div>
  )
}

export default function RoleApplicationDetailModal({ request, onClose, onResolved }) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [processing, setProcessing] = useState(false)

  const raw = request?.raw ?? {}
  const detailRows = useMemo(() => buildRoleApplicationDetailRows(raw), [raw])
  const isPending = request?.statusCode === 'PENDING'

  if (!request) return null

  const handleApprove = async () => {
    try {
      setProcessing(true)
      await adminUserService.approveRoleApplication(request.profileId, request.roleCode)
      toast.success(`Đã duyệt quyền ${request.to} cho ${request.user}`)
      onResolved?.()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Không thể duyệt yêu cầu')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    const reason = rejectReason.trim()
    if (!reason) {
      toast.error('Vui lòng nhập lý do từ chối')
      return
    }
    try {
      setProcessing(true)
      await adminUserService.rejectRoleApplication(request.profileId, reason, request.roleCode)
      toast.success('Đã từ chối yêu cầu cấp quyền')
      onResolved?.()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Không thể từ chối yêu cầu')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-white/10 bg-[#111f3b] shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#dda50e]">
              REQ-{request.id}
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">Chi tiết yêu cầu cấp quyền</h2>
            <p className="mt-1 text-sm text-white/50">
              {request.user}
              {request.email
                ? ` · ${request.email}`
                : request.username
                  ? ` · @${request.username}`
                  : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white/70">
              {request.from}
            </span>
            <Shield className="h-4 w-4 text-white/35" />
            <span className="rounded-full border border-[#dda50e]/35 bg-[#dda50e]/15 px-3 py-1 text-sm font-semibold text-[#dda50e]">
              {request.to}
            </span>
            <span className="ml-auto text-sm text-white/45">Gửi lúc: {request.submittedAt}</span>
          </div>

          <div>
            <p className="mb-1 text-xs uppercase tracking-wide text-white/45">Trạng thái</p>
            <p className="text-sm font-semibold text-white">{request.status}</p>
            {request.reviewReason && (
              <p className="mt-2 text-sm text-rose-300/90">Lý do: {request.reviewReason}</p>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-white/80">Thông tin người xin cấp quyền</h3>
            {detailRows.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {detailRows.map((row) => (
                  <DetailRow key={row.key} label={row.label} value={row.value} isUrl={row.isUrl} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/50">Không có thông tin bổ sung.</p>
            )}
          </div>

          {showRejectForm && isPending && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/70">
                Lý do từ chối *
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do để gửi cho người dùng..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-rose-400/50"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 px-6 py-5">
          <GhostButton onClick={onClose} disabled={processing}>
            Đóng
          </GhostButton>
          {isPending && !showRejectForm && (
            <>
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 px-5 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/25 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Từ chối
              </button>
              <PrimaryButton icon={Check} disabled={processing} onClick={handleApprove}>
                Xác nhận
              </PrimaryButton>
            </>
          )}
          {isPending && showRejectForm && (
            <>
              <GhostButton
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectReason('')
                }}
                disabled={processing}
              >
                Hủy
              </GhostButton>
              <button
                type="button"
                onClick={handleReject}
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-400/40 bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
              >
                Gửi từ chối
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
