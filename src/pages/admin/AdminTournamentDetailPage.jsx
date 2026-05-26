import { useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { Award, BarChart3, CalendarRange, Flag, Info, Settings, Users } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card } from "@/components/admin/tournament-detail/DetailUi";
import OverviewTab from "@/components/admin/tournament-detail/OverviewTab";
import ParticipantsTab from "@/components/admin/tournament-detail/ParticipantsTab";
import RacesTab from "@/components/admin/tournament-detail/RacesTab";
import { ResultsTab, ScheduleTab } from "@/components/admin/tournament-detail/ScheduleResultsTabs";
import { SettingsTab, StatisticsTab } from "@/components/admin/tournament-detail/StatisticsSettingsTabs";
import TournamentHero from "@/components/admin/tournament-detail/TournamentHero";
import {
  detailTournaments,
  getTotalPrize,
} from "@/components/admin/tournament-detail/detailData";

const tabs = [
  { key: "overview", label: "Tổng quan", icon: Info },
  { key: "races", label: "Cấu hình cuộc đua", icon: Flag },
  { key: "participants", label: "Người tham gia", icon: Users },
  { key: "schedule", label: "Lịch thi đấu", icon: CalendarRange },
  { key: "results", label: "Kết quả", icon: Award },
  { key: "stats", label: "Thống kê", icon: BarChart3 },
  { key: "settings", label: "Cài đặt", icon: Settings },
];

export default function AdminTournamentDetailPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const createdTournament = location.state?.tournament;
  const source =
    createdTournament?.id === id
      ? createdTournament
      : (detailTournaments[id] ?? detailTournaments["vietnam-grand-prix-2026"]);
  const [tournament, setTournament] = useState(source);
  const selectedTab = tabs.some((tab) => tab.key === searchParams.get("tab"))
    ? searchParams.get("tab")
    : "overview";
  const totalRegistered = tournament.races.reduce(
    (sum, race) => sum + race.registered,
    0,
  );
  const totalPrize = tournament.races.reduce(
    (sum, race) => sum + getTotalPrize(race),
    0,
  );

  const changeTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === "overview") next.delete("tab");
    else next.set("tab", tab);
    setSearchParams(next);
  };

  return (
    <AdminLayout showPageHeader={false}>
      <TournamentHero
        tournament={tournament}
        totalRegistered={totalRegistered}
      />

      <Card className="mb-9 flex flex-wrap gap-2 p-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              className={`inline-flex h-14 items-center gap-3 rounded-2xl px-6 text-base font-semibold transition ${
                selectedTab === tab.key
                  ? "bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/25"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </Card>

      {selectedTab === "overview" && (
        <OverviewTab
          tournament={tournament}
          totalPrize={totalPrize}
          totalRegistered={totalRegistered}
        />
      )}
      {selectedTab === "races" && (
        <RacesTab tournament={tournament} setTournament={setTournament} />
      )}
      {selectedTab === "participants" && (
        <ParticipantsTab tournament={tournament} />
      )}
      {selectedTab === "schedule" && <ScheduleTab tournament={tournament} />}
      {selectedTab === "results" && <ResultsTab tournament={tournament} />}
      {selectedTab === "stats" && (
        <StatisticsTab
          tournament={tournament}
          totalPrize={totalPrize}
          totalRegistered={totalRegistered}
        />
      )}
      {selectedTab === "settings" && (
        <SettingsTab tournament={tournament} setTournament={setTournament} />
      )}
    </AdminLayout>
  );
}
