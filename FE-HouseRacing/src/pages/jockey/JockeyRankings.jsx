import { useEffect, useMemo, useState } from "react";
import { Trophy, Medal, Star, TrendingUp } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { GlassCard, StatCard } from "../admin/AdminLayout";
import { rankingService } from "@/services/rankingService";
import { jockeyService } from "@/services/jockeyService";
import { mapRankingEntry } from "@/utils/jockeyViewUtils";
import { useAuthStore } from "@/store/authStore";
import { getApiErrorMessage } from "@/utils/apiError";

export function JockeyRankings() {
  const userId = useAuthStore((state) => state.user?.id ?? state.user?.userId);
  const [rankings, setRankings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const [rankingData, profileData] = await Promise.all([
          rankingService.getRankings(50),
          jockeyService.getMyProfile().catch(() => null),
        ]);
        if (!active) return;
        setRankings(rankingData.jockeys.map((entry) => mapRankingEntry(entry, userId)));
        setProfile(profileData);
      } catch (err) {
        if (!active) return;
        setError(getApiErrorMessage(err) || "Không thể tải bảng xếp hạng");
        setRankings([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  const myRank = useMemo(() => rankings.find((item) => item.isMe), [rankings]);

  return (
    <JockeyLayout
      title="Jockey · Bảng xếp hạng"
      subtitle="Xếp hạng jockey theo số trận thắng"
    >
      {error && (
        <GlassCard className="mb-6 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </GlassCard>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Xếp hạng hiện tại"
          value={`#${myRank?.rank ?? "—"}`}
          icon={Trophy}
          tone="gold"
        />
        <StatCard
          label="Tổng thưởng"
          value={String(myRank?.points ?? 0)}
          icon={Star}
          tone="blue"
        />
        <StatCard
          label="Tỷ lệ thắng"
          value={`${myRank?.winRate ?? profile?.winRate ?? 0}%`}
          icon={TrendingUp}
          tone="green"
        />
        <StatCard label="Tổng jockey" value={String(rankings.length)} icon={Medal} tone="purple" />
      </div>

      <GlassCard>
        <div className="p-5 border-b border-white/10">
          <h2 className="font-bold text-white">Bảng xếp hạng</h2>
        </div>
        {loading ? (
          <div className="p-10 text-center text-white/50">Đang tải bảng xếp hạng...</div>
        ) : rankings.length === 0 ? (
          <div className="p-10 text-center text-white/50">Chưa có dữ liệu bảng xếp hạng.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-[11px] text-white/40">Hạng</th>
                  <th className="text-left px-5 py-3 text-[11px] text-white/40">Jockey</th>
                  <th className="text-right px-5 py-3 text-[11px] text-white/40">Thắng</th>
                  <th className="text-right px-5 py-3 text-[11px] text-white/40">Race</th>
                  <th className="text-right px-5 py-3 text-[11px] text-white/40">Tỷ lệ</th>
                  <th className="text-right px-5 py-3 text-[11px] text-white/40">Thưởng</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr
                    key={`${r.rank}-${r.name}`}
                    className={`border-b border-white/[0.06] ${r.isMe ? "bg-[#D4A017]/5" : "hover:bg-white/[0.03]"}`}
                  >
                    <td className="px-5 py-4">#{r.rank}</td>
                    <td className="px-5 py-4 text-white">{r.name}</td>
                    <td className="px-5 py-4 text-right text-[#D4A017] font-bold">{r.wins}</td>
                    <td className="px-5 py-4 text-right text-white/70">{r.races}</td>
                    <td className="px-5 py-4 text-right text-emerald-300 font-bold">{r.winRate}%</td>
                    <td className="px-5 py-4 text-right text-white font-bold">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </JockeyLayout>
  );
}
