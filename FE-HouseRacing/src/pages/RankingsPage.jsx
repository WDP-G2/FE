import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Crown,
  Medal,
  RefreshCcw,
  Trophy,
  UserRound,
} from "lucide-react";
import { rankingService } from "@/services/rankingService";
import { fmtVND } from "@/utils/formatCurrency";

const RANKING_LIMIT = 30;

export default function RankingsPage() {
  const [rankingData, setRankingData] = useState({
    generatedAt: null,
    horses: [],
    jockeys: [],
  });
  const [activeTab, setActiveTab] = useState("horses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRankings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await rankingService.getRankings(RANKING_LIMIT);
      setRankingData(data);
    } catch (err) {
      setRankingData({ generatedAt: null, horses: [], jockeys: [] });
      setError(err?.message || "Không thể tải bảng xếp hạng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRankings();
  }, []);

  const horseRows = useMemo(
    () => rankingData.horses.map(mapHorseRanking),
    [rankingData.horses],
  );
  const jockeyRows = useMemo(
    () => rankingData.jockeys.map(mapJockeyRanking),
    [rankingData.jockeys],
  );
  const activeRows = activeTab === "horses" ? horseRows : jockeyRows;
  const activeLabel = activeTab === "horses" ? "ngựa" : "nài ngựa";
  const topHorse = horseRows[0];
  const topJockey = jockeyRows[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA]" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #1E3A5F 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A017]/20 bg-gradient-to-r from-[#D4A017]/10 to-[#D4A017]/5 px-5 py-2.5 shadow-sm">
              <Trophy className="h-5 w-5 text-[#D4A017]" />
              <span className="font-semibold text-[#D4A017]">
                Bảng xếp hạng
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-[#1E3A5F] md:text-7xl">
              Bảng xếp hạng
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-[#1E3A5F]/60 md:text-2xl">
              Theo dõi thành tích ngựa và nài ngựa dựa trên kết quả các cuộc
              đua đã công bố, gồm số trận thắng, lượt vào top 3, tổng lượt đua
              và tiền thưởng.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryCard
                icon={Crown}
                label="Ngựa dẫn đầu"
                value={topHorse?.name || "Chưa có"}
              />
              <SummaryCard
                icon={UserRound}
                label="Nài ngựa dẫn đầu"
                value={topJockey?.name || "Chưa có"}
              />
              <SummaryCard
                icon={Award}
                label="Dữ liệu hiển thị"
                value={`${horseRows.length + jockeyRows.length} mục`}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-2 text-4xl font-bold text-[#1E3A5F]">
                Thành tích tổng hợp
              </h2>
              <p className="max-w-3xl text-[#1E3A5F]/60">
                Bảng được cập nhật từ API xếp hạng của hệ thống, sắp xếp theo
                số trận thắng và các chỉ số thi đấu đã ghi nhận.
              </p>
            </div>

            <div className="flex rounded-2xl border border-gray-200 bg-[#FAFAFA] p-1">
              <TabButton
                active={activeTab === "horses"}
                onClick={() => setActiveTab("horses")}
              >
                Ngựa
              </TabButton>
              <TabButton
                active={activeTab === "jockeys"}
                onClick={() => setActiveTab("jockeys")}
              >
                Nài ngựa
              </TabButton>
            </div>
          </div>

          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold">{error}</p>
              <button
                type="button"
                onClick={loadRankings}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white"
              >
                <RefreshCcw className="h-4 w-4" />
                Tải lại
              </button>
            </div>
          )}

          {loading ? (
            <LoadingTable />
          ) : activeRows.length === 0 ? (
            <EmptyRanking label={activeLabel} />
          ) : (
            <RankingTable rows={activeRows} entityLabel={activeLabel} />
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white/85 p-5 text-left shadow-sm">
      <Icon className="mb-3 h-7 w-7 text-[#D4A017]" />
      <p className="mb-1 text-sm font-semibold text-[#1E3A5F]/55">{label}</p>
      <p className="truncate text-xl font-bold text-[#1E3A5F]">{value}</p>
    </div>
  );
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-5 py-2.5 font-semibold transition ${
        active
          ? "bg-[#D4A017] text-white shadow-sm"
          : "text-[#1E3A5F]/60 hover:bg-white hover:text-[#1E3A5F]"
      }`}
    >
      {children}
    </button>
  );
}

function RankingTable({ rows, entityLabel }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr className="border-b border-gray-200 bg-[#FAFAFA] text-left text-xs font-bold uppercase text-[#1E3A5F]/50">
              <th className="px-6 py-4">Hạng</th>
              <th className="px-6 py-4">{entityLabel}</th>
              <th className="px-6 py-4 text-right">Thắng</th>
              <th className="px-6 py-4 text-right">Top 3</th>
              <th className="px-6 py-4 text-right">Lượt đua</th>
              <th className="px-6 py-4 text-right">Tỷ lệ thắng</th>
              <th className="px-6 py-4 text-right">Tiền thưởng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-gray-100 transition last:border-0 hover:bg-[#FFF8F0]"
              >
                <td className="px-6 py-5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#D4A017]/10 font-bold text-[#D4A017]">
                    #{row.rank}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="font-bold text-[#1E3A5F]">{row.name}</div>
                  <div className="mt-1 text-sm text-[#1E3A5F]/55">
                    {row.description}
                  </div>
                </td>
                <td className="px-6 py-5 text-right font-bold text-[#1E3A5F]">
                  {row.winCount}
                </td>
                <td className="px-6 py-5 text-right text-[#1E3A5F]/70">
                  {row.podiumCount}
                </td>
                <td className="px-6 py-5 text-right text-[#1E3A5F]/70">
                  {row.raceCount}
                </td>
                <td className="px-6 py-5 text-right font-semibold text-emerald-600">
                  {row.winRate}
                </td>
                <td className="px-6 py-5 text-right font-bold text-[#D4A017]">
                  {fmtVND(row.totalPrizeAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="mb-4 h-16 animate-pulse rounded-2xl bg-gray-100 last:mb-0"
        />
      ))}
    </div>
  );
}

function EmptyRanking({ label }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#1E3A5F]/15 bg-white p-10 text-center text-[#1E3A5F]/55 shadow-sm">
      <Medal className="mx-auto mb-4 h-12 w-12 text-[#D4A017]" />
      <h3 className="mb-2 text-2xl font-bold text-[#1E3A5F]">
        Chưa có dữ liệu xếp hạng {label}
      </h3>
      <p className="mx-auto max-w-xl leading-7">
        Khi các cuộc đua có kết quả chính thức, hệ thống sẽ tự động tổng hợp
        thành tích và hiển thị tại bảng xếp hạng này.
      </p>
    </div>
  );
}

function mapHorseRanking(entry, index) {
  const raceCount = toNumber(entry.raceCount);
  const winCount = toNumber(entry.winCount);

  return {
    key: `horse-${entry.horseId ?? index}`,
    rank: entry.rank ?? index + 1,
    name: entry.horseName || `Ngựa #${entry.horseId ?? index + 1}`,
    description: entry.ownerName
      ? `Chủ ngựa: ${entry.ownerName}`
      : "Chưa cập nhật chủ ngựa",
    winCount,
    podiumCount: toNumber(entry.podiumCount),
    raceCount,
    winRate: formatWinRate(winCount, raceCount),
    totalPrizeAmount: entry.totalPrizeAmount,
  };
}

function mapJockeyRanking(entry, index) {
  const raceCount = toNumber(entry.raceCount);
  const winCount = toNumber(entry.winCount);
  const displayName =
    entry.jockeyFullName ||
    entry.jockeyUsername ||
    `Nài ngựa #${entry.jockeyId ?? index + 1}`;

  return {
    key: `jockey-${entry.jockeyId ?? entry.jockeyUsername ?? index}`,
    rank: entry.rank ?? index + 1,
    name: displayName,
    description:
      entry.jockeyUsername && entry.jockeyFullName
        ? `Tài khoản: ${entry.jockeyUsername}`
        : "Chưa cập nhật tài khoản",
    winCount,
    podiumCount: toNumber(entry.podiumCount),
    raceCount,
    winRate: formatWinRate(winCount, raceCount),
    totalPrizeAmount: entry.totalPrizeAmount,
  };
}

function toNumber(value) {
  return Number(value || 0);
}

function formatWinRate(winCount, raceCount) {
  if (!raceCount) return "0%";
  return `${((winCount / raceCount) * 100).toFixed(1)}%`;
}
