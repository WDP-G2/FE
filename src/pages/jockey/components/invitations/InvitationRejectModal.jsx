import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { TextArea } from "@/components/ui/Input";

export function InvitationRejectModal({
  rejectTarget,
  savingId,
  onClose,
  onConfirm,
}) {
  const [note, setNote] = useState("");
  const [validationError, setValidationError] = useState("");
  const isSaving = Boolean(rejectTarget && savingId === rejectTarget.id);

  if (!rejectTarget) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedNote = note.trim();

    if (!normalizedNote) {
      setValidationError("Vui lòng nhập lý do từ chối.");
      return;
    }

    setValidationError("");
    onConfirm(normalizedNote);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-invitation-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/80 p-4 backdrop-blur-sm"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#101a2d] shadow-2xl shadow-black/50"
      >
        <div className="border-b border-white/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-400">
                Phản hồi lời mời
              </p>
              <h2 id="reject-invitation-title" className="mt-1 text-xl font-bold text-white">
                Từ chối lời mời này?
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              aria-label="Đóng"
              className="rounded-xl border border-white/10 p-2 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-red-300/20 bg-red-400/[0.06] p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-red-100">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Lý do sẽ được gửi cho chủ ngựa.
            </p>
            <p className="mt-2 text-xs text-white/55">
              {rejectTarget.horseName || "Ngựa chưa cập nhật"} ·{" "}
              {rejectTarget.raceName || "Cuộc đua chưa cập nhật"}
            </p>
          </div>

          <div>
            <label htmlFor="jockey-rejection-note" className="mb-2 block text-sm font-semibold text-white/75">
              Lý do từ chối <span className="text-red-400">*</span>
            </label>
            <TextArea
              id="jockey-rejection-note"
              autoFocus
              rows={4}
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                if (validationError && event.target.value.trim()) setValidationError("");
              }}
              disabled={isSaving}
              aria-invalid={Boolean(validationError)}
              aria-describedby={validationError ? "jockey-rejection-note-error" : undefined}
              placeholder="Ví dụ: Tôi không thể tham gia do trùng lịch thi đấu..."
              className={validationError ? "border-red-400/60 focus:border-red-400" : ""}
            />
            {validationError && (
              <p id="jockey-rejection-note-error" className="mt-2 text-xs font-medium text-red-400">
                {validationError}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-white/10 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/10 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl border border-red-400/30 bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Đang từ chối..." : "Xác nhận từ chối"}
          </button>
        </div>
      </form>
    </div>
  );
}
