import { Eye, Send, X } from "lucide-react";
import { GlassCard, GhostButton, Pill, PrimaryButton } from "../../../admin/AdminLayout";

export function HorseOwnerJockeyCard({
  jockey,
  onCancelInvite,
  onOpenDetail,
  onOpenInvitationDetail,
  onOpenInvite,
  saving,
}) {
  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#D4A017]/20 bg-gradient-to-br from-[#D4A017]/20 to-[#0F1E3A] text-2xl font-bold text-[#D4A017]">
          {jockey.avatarUrl ? (
            <img src={jockey.avatarUrl} alt={jockey.name} className="h-full w-full object-cover" />
          ) : (
            jockey.name.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-white">{jockey.name}</h3>
          <p className="text-xs text-white/50">{jockey.license}</p>
          <div className="mt-1">
            <Pill tone={jockey.statusTone}>{jockey.status}</Pill>
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-white/[0.04] p-3">
        <div className="text-center">
          <div className="text-base font-bold text-[#D4A017]">{jockey.wins}</div>
          <div className="text-[10px] text-white/40">Thắng</div>
        </div>
        <div className="border-x border-white/10 text-center">
          <div className="text-base font-bold text-white">{jockey.races}</div>
          <div className="text-[10px] text-white/40">Race</div>
        </div>
        <div className="text-center">
          <div className="text-base font-bold text-emerald-300">{jockey.winRate}%</div>
          <div className="text-[10px] text-white/40">Tỷ lệ</div>
        </div>
      </div>

      <div className="mb-4 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-white/50">Kinh nghiệm</span>
          <span className="font-semibold text-white">{jockey.experience} năm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Chiều cao / cân nặng</span>
          <span className="font-semibold text-white">
            {jockey.height || 0} cm · {jockey.weight || 0} kg
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Ngựa đã nhận</span>
          <span className="font-semibold text-white">{jockey.assigned ?? "Chưa có"}</span>
        </div>
      </div>

      {jockey.invitationSummary?.totalCount > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-xl border border-[#D4A017]/20 bg-[#D4A017]/10 p-3">
            <div className="text-lg font-bold text-[#D4A017]">
              {jockey.invitationSummary.pendingCount}
            </div>
            <div className="text-white/50">Lời mời đang chờ</div>
          </div>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
            <div className="text-lg font-bold text-emerald-300">
              {jockey.invitationSummary.acceptedCount}
            </div>
            <div className="text-white/50">Lời mời đã nhận</div>
          </div>
        </div>
      )}

      {jockey.specialties && (
        <p className="mb-4 line-clamp-2 text-xs text-white/45">{jockey.specialties}</p>
      )}

      <div className="flex gap-2">
        <GhostButton className="flex-1" icon={Eye} onClick={() => onOpenDetail(jockey)}>
          Xem chi tiết
        </GhostButton>
        {jockey.invitations?.length < 0 ? (
          <GhostButton
            className="flex-1"
            icon={X}
            disabled={saving}
            onClick={() => onCancelInvite(jockey.invitation)}
          >
            Hủy lời mời
          </GhostButton>
        ) : (
          <GhostButton
            className="flex-1"
            icon={Send}
            disabled={!jockey.active || !jockey.hasApprovedProfile}
            onClick={() => onOpenInvite(jockey)}
          >
            Mời
          </GhostButton>
        )}
        {jockey.invitations?.length > 0 && (
          <PrimaryButton
            className="flex-1"
            icon={Eye}
            onClick={() => onOpenInvitationDetail(jockey)}
          >
            Chi tiết lời mời
          </PrimaryButton>
        )}
      </div>
    </GlassCard>
  );
}
