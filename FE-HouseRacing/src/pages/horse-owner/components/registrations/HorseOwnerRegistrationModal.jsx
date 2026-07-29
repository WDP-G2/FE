import { X } from "lucide-react";
import { formatDisplayDateTime } from "@/utils/dateFormat";
import { fmtVND } from "@/utils/formatCurrency";
import { GlassCard, GhostButton, PrimaryButton } from "../../../admin/AdminLayout";

export function HorseOwnerRegistrationModal({
  note,
  onChangeNote,
  onChangeSelectedInvitationId,
  onClose,
  onSubmit,
  registrationOptions,
  saving,
  selectedInvitationId,
  selectedOption,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="font-bold text-white">Đăng ký thi đấu</h2>
            <p className="mt-1 text-sm text-white/45">
              Chọn team từ lời mời jockey đã nhận
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all hover:bg-white/10"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Lời mời đã nhận
            </label>
            <select
              value={selectedInvitationId}
              onChange={(event) => onChangeSelectedInvitationId(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#17191d] px-4 py-3 text-sm text-white focus:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20"
            >
              {registrationOptions.map((option) => (
                <option key={option.id} value={option.id} className="bg-[#17191d] text-white">
                  {option.tournamentName} · {option.raceName} · {option.horseName} · Jockey:{" "}
                  {option.jockeyName}
                </option>
              ))}
            </select>
          </div>

          {selectedOption && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Giải đấu", selectedOption.tournamentName],
                ["Cuộc đua", selectedOption.raceName],
                ["Ngựa", selectedOption.horseName],
                ["Jockey", selectedOption.jockeyName],
                ["Lịch đua", formatDisplayDateTime(selectedOption.raceTime, "Chưa cập nhật")],
                ["Lệ phí", fmtVND(selectedOption.entryFee)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                    {label}
                  </div>
                  <div className="mt-1 font-semibold text-white">{value || "Chưa cập nhật"}</div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-white/70">
              Ghi chú đăng ký
            </label>
            <textarea
              value={note}
              onChange={(event) => onChangeNote(event.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Ghi chú cho admin..."
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
          <GhostButton onClick={onClose} disabled={saving}>
            Hủy
          </GhostButton>
          <PrimaryButton onClick={onSubmit} disabled={saving || !selectedOption}>
            {saving ? "Đang gửi..." : "Xác nhận đăng ký"}
          </PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}
