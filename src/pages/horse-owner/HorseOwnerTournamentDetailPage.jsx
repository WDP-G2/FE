import { useEffect, useState } from "react";
import { RefreshCw, Trophy } from "lucide-react";
import { useLocation } from "react-router-dom";
import { TournamentPublicDetailContent } from "@/components/tournament-detail";
import { GlassCard } from "@/pages/admin/AdminLayout";
import { tournamentService } from "@/services/tournamentService";
import { HorseOwnerLayout } from "./HorseOwnerLayout";

export function HorseOwnerTournamentDetailPage() {
  const { pathname } = useLocation();
  const id = pathname.split("/").filter(Boolean)[2];
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTournament() {
      try {
        setLoading(true);
        setError("");
        const response = await tournamentService.getPublicTournament(id);
        if (!cancelled) setTournament(response.data);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Không thể tải chi tiết giải đấu.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTournament();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <HorseOwnerLayout
      title="Horse Owner · Chi tiết giải đấu"
      subtitle={tournament?.name || "Thông tin giải đấu và từng cuộc đua"}
    >
      {loading ? (
        <GlassCard className="flex items-center justify-center gap-3 p-10 text-white/60">
          <RefreshCw className="h-5 w-5 animate-spin text-[#D4A017]" />
          Đang tải chi tiết giải đấu...
        </GlassCard>
      ) : error ? (
        <GlassCard className="border-red-500/20 bg-red-500/10 p-10 text-center text-red-200">
          {error}
        </GlassCard>
      ) : tournament ? (
        <TournamentPublicDetailContent
          tournament={tournament}
          backTo="/horse-owner/tournaments"
        />
      ) : (
        <GlassCard className="p-10 text-center text-white/50">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-white/30" />
          Không tìm thấy giải đấu.
        </GlassCard>
      )}
    </HorseOwnerLayout>
  );
}
