import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { GlassCard } from "../../../admin/AdminLayout";

export function PendingInvitationsCard({ invitations }) {
  if (invitations.length === 0) return null;

  return (
    <GlassCard className="border-[#D4A017]/20">
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Lời mời chờ xử lý</h2>
            <p className="text-xs text-white/50">{invitations.length} lời mời cần phản hồi</p>
          </div>
        </div>
        <Link
          to="/jockey/invitations"
          className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1"
        >
          Xem tất cả <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="p-5 space-y-3">
        {invitations.slice(0, 2).map((inv) => (
          <div
            key={inv.id}
            className="p-4 bg-[#D4A017]/5 border border-[#D4A017]/20 rounded-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">
                  {inv.horseName || "Ngựa chưa cập nhật"}
                </div>
                <div className="text-xs text-white/50">
                  Từ chủ ngựa: {inv.ownerUsername || `Owner #${inv.ownerId}`}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {inv.message || "Không có lời nhắn"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-[#D4A017]">{inv.remunerationText}</div>
                <div className="text-[10px] text-white/40">Thù lao</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
