import { useEffect, useMemo, useState } from "react";
import { jockeyService } from "@/services/jockeyService";
import { rankingService } from "@/services/rankingService";
import {
  buildJockeyResults,
  buildJockeySchedules,
  mapRankingEntry,
} from "@/utils/jockeyViewUtils";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/utils/apiError";

export function useJockeyDashboard() {
  const userId = useAuthStore((state) => state.user?.id ?? state.user?.userId);
  const [profile, setProfile] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [results, setResults] = useState([]);
  const [ranking, setRanking] = useState(null);
  const [totalPrize, setTotalPrize] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [
          profileData,
          invitationData,
          raceData,
          performanceData,
          rankingData,
        ] = await Promise.all([
          jockeyService.getMyProfile(),
          jockeyService.getJockeyInvitations(),
          jockeyService.getRaces(),
          jockeyService.getPerformance(),
          rankingService.getRankings(50),
        ]);

        if (!active) return;

        const myRank = rankingData.jockeys
          .map((entry) => mapRankingEntry(entry, userId))
          .find((entry) => entry.isMe);

        setProfile({
          ...profileData,
          wins: Number(performanceData?.firstPlaces ?? profileData?.wins ?? 0),
          races: Number(performanceData?.raceCount ?? profileData?.races ?? 0),
          winRate:
            profileData?.winRate ??
            (Number(performanceData?.raceCount) > 0
              ? (
                  (Number(performanceData?.firstPlaces ?? 0) /
                    Number(performanceData?.raceCount)) *
                  100
                ).toFixed(1)
              : 0),
          ranking: myRank?.rank ?? profileData?.ranking ?? "—",
        });
        setInvitations(invitationData);
        setSchedules(buildJockeySchedules(raceData, invitationData));
        setResults(buildJockeyResults(profileData?.raceHistory ?? []));
        setRanking(myRank ?? null);
        setTotalPrize(
          Number(performanceData?.totalJockeyPayout ?? 0) +
            Number(performanceData?.totalPrizePayout ?? 0),
        );
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err) || "Không thể tải dashboard jockey");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  const pendingInvitations = useMemo(
    () => invitations.filter((item) => item.statusCode === "PENDING"),
    [invitations],
  );

  const displayName = profile?.name || "Jockey";

  return {
    profile,
    schedules,
    results,
    ranking,
    totalPrize,
    loading,
    error,
    pendingInvitations,
    displayName,
  };
}
