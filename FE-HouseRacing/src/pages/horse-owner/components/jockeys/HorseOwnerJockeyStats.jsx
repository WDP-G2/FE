import { CheckCircle, Trophy, Users } from "lucide-react";
import { GlassCard } from "../../../admin/AdminLayout";

export function HorseOwnerJockeyStats({ invitations, jockeyCount }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <GlassCard className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A017]/15">
          <Users className="h-5 w-5 text-[#D4A017]" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">{jockeyCount}</div>
          <div className="text-xs text-white/50">Tổng jockey</div>
        </div>
      </GlassCard>
      <GlassCard className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
          <CheckCircle className="h-5 w-5 text-emerald-300" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">
            {invitations.filter((invitation) => invitation.statusCode === "ACCEPTED").length}
          </div>
          <div className="text-xs text-white/50">Đã nhận lời</div>
        </div>
      </GlassCard>
      <GlassCard className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15">
          <Trophy className="h-5 w-5 text-sky-300" />
        </div>
        <div>
          <div className="text-xl font-bold text-white">
            {invitations.filter((invitation) => invitation.statusCode === "PENDING").length}
          </div>
          <div className="text-xs text-white/50">Đang chờ phản hồi</div>
        </div>
      </GlassCard>
    </div>
  );
}
