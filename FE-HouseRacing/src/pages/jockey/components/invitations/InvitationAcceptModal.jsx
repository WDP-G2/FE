import { AlertTriangle, Check, X } from "lucide-react";
import { PrimaryButton } from "../../../admin/AdminLayout";
import { MiniInvitationRow } from "./MiniInvitationRow";
import { formatRaceWindow } from "../../utils/jockeyInvitationUtils";

export function InvitationAcceptModal({
  acceptTarget,
  conflictMap,
  savingId,
  onClose,
  onConfirm,
}) {
  if (!acceptTarget) return null;

  const pendingConflicts = conflictMap[acceptTarget.id]?.pending ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#101a2d] shadow-2xl shadow-black/50">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#D4A017]">
                Xác nhận lịch thi đấu
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">Chấp nhận lời mời này?</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div className="rounded-xl border border-emerald-300/25 bg-emerald-400/[0.06] p-4">
            <p className="mb-2 text-xs font-bold text-emerald-100">Sẽ được chấp nhận</p>
            <div className="grid gap-2 text-sm text-white/70 sm:grid-cols-2">
              <span>Ngựa: {acceptTarget.horseName || "Chưa cập nhật"}</span>
              <span>Race: {acceptTarget.raceName || "Chưa cập nhật"}</span>
              <span>Lịch: {formatRaceWindow(acceptTarget)}</span>
              <span>Thù lao: {acceptTarget.remunerationText}</span>
            </div>
          </div>

          {pendingConflicts.length > 0 ? (
            <div className="rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold text-amber-100">
                <AlertTriangle className="h-4 w-4" />
                Những lời mời pending này sẽ bị backend tự hủy
              </p>
              <div className="space-y-2">
                {pendingConflicts.map((item) => (
                  <MiniInvitationRow key={item.invitation.id} item={item} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/55">
              Không có lời mời pending nào bị hủy khi chấp nhận lời mời này.
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-white/10 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10"
          >
            Xem lại
          </button>
          <PrimaryButton
            icon={Check}
            disabled={savingId === acceptTarget.id}
            onClick={onConfirm}
          >
            Xác nhận chấp nhận
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
