import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { jockeyService } from "@/services/jockeyService";
import { rankingService } from "@/services/rankingService";
import { mapRankingEntry } from "@/utils/jockeyViewUtils";

export function useJockeySidebarMeta() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id ?? user?.userId;
  const displayName = user?.fullName || user?.username || "Jockey";
  const [sidebarMeta, setSidebarMeta] = useState({ status: "Đang tải...", rank: null });

  useEffect(() => {
    let active = true;

    async function loadSidebarMeta() {
      try {
        const [profile, rankingData] = await Promise.all([
          jockeyService.getMyProfile().catch(() => null),
          rankingService.getRankings(50).catch(() => ({ jockeys: [] })),
        ]);
        if (!active) return;

        const myRank = rankingData.jockeys
          .map((entry) => mapRankingEntry(entry, userId))
          .find((item) => item.isMe);

        setSidebarMeta({
          status: profile?.status || "Sẵn sàng",
          rank: myRank?.rank ?? null,
        });
      } catch {
        if (!active) return;
        setSidebarMeta({ status: "Sẵn sàng", rank: null });
      }
    }

    loadSidebarMeta();
    return () => {
      active = false;
    };
  }, [userId]);

  return { displayName, sidebarMeta };
}
