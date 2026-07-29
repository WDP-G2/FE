import { Link } from "react-router-dom";
import { GlassCard } from "../../../admin/AdminLayout";

export function HorseOwnerRegistrationNeedJockeyNotice({
  selectedTournament,
  selectedTournamentId,
}) {
  return (
    <GlassCard className="mb-6 border-[#D4A017]/25 bg-[#D4A017]/10 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold text-white">
            Bạn cần mời jockey và được chấp nhận trước khi đăng ký thi đấu.
          </h3>
          <p className="mt-1 text-sm text-white/55">
            {selectedTournament?.name
              ? `Giải ${selectedTournament.name} chưa có lời mời jockey đã nhận phù hợp.`
              : "Giải đấu này chưa có lời mời jockey đã nhận phù hợp."}
          </p>
        </div>
        <Link
          to={`/horse-owner/jockeys?tournamentId=${selectedTournamentId}`}
          className="inline-flex items-center justify-center rounded-xl bg-[#D4A017] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#D4A017]/30 transition-all hover:bg-[#B8941F]"
        >
          Mời jockey
        </Link>
      </div>
    </GlassCard>
  );
}
