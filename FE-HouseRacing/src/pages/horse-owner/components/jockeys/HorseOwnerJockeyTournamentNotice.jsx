import { GlassCard } from "../../../admin/AdminLayout";

export function HorseOwnerJockeyTournamentNotice({ tournamentName }) {
  return (
    <GlassCard className="mb-6 border-[#D4A017]/25 bg-[#D4A017]/10 p-4">
      <div className="text-sm font-semibold text-white">
        Đang mời jockey cho {tournamentName || "giải đấu đã chọn"}
      </div>
      <p className="mt-1 text-xs text-white/55">
        Danh sách cuộc đua trong form mời sẽ chỉ hiển thị các race thuộc giải này.
      </p>
    </GlassCard>
  );
}
