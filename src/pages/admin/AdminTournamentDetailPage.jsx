import { useEffect, useState } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import Card from "@/components/admin/ui/Card";
import {
  OverviewTab,
  ParticipantsTab,
  RacesTab,
  ResultsTab,
  ScheduleTab,
  SettingsTab,
  TournamentHero,
  detailTabs,
} from "@/components/admin/tournament-detail";
import { getTotalPrize } from "@/components/admin/tournament-detail/utils";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { tournamentService } from "@/services/tournamentService";

export default function AdminTournamentDetailPage() {
  const { id = "" } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const createdTournament = location.state?.tournament;
  const [tournament, setTournament] = useState(createdTournament || null);
  const [loading, setLoading] = useState(!createdTournament);
  const [saving, setSaving] = useState(false);
  const [savingRace, setSavingRace] = useState(false);
  const [updatingRegistrationId, setUpdatingRegistrationId] = useState("");
  const selectedTab = detailTabs.some(
    (tab) => tab.key === searchParams.get("tab"),
  )
    ? searchParams.get("tab")
    : "overview";
  const totalRegistered =
    tournament?.races?.reduce((sum, race) => sum + (race.registered || 0), 0) ||
    0;
  const totalPrize =
    tournament?.races?.reduce((sum, race) => sum + getTotalPrize(race), 0) || 0;

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tournamentService.getById(id);
        if (alive) setTournament(data);
      } catch (err) {
        toast.error(getApiErrorMessage(err) || "Không tải được giải đấu");
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => {
      alive = false;
    };
  }, [id]);

  const handleSaveSettings = async (payload) => {
    if (!tournament) return;
    setSaving(true);
    try {
      const updated = await tournamentService.update(tournament.id, payload);
      setTournament(updated);
      toast.success("Đã cập nhật giải đấu");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Không thể cập nhật giải đấu");
    } finally {
      setSaving(false);
    }
  };

  const handleAddRace = async (draft) => {
    if (!tournament) return null;
    setSavingRace(true);
    try {
      const updated = await tournamentService.createRace(tournament.id, draft);
      setTournament(updated);
      toast.success("Đã thêm cuộc đua");
      return updated.races[updated.races.length - 1]?.id;
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Không thể thêm cuộc đua");
      return null;
    } finally {
      setSavingRace(false);
    }
  };

  const handleSaveRace = async (race) => {
    if (!tournament || !race?.id) return;
    setSavingRace(true);
    try {
      const updated = await tournamentService.updateRace(
        tournament.id,
        race.id,
        race,
      );
      setTournament(updated);
      toast.success("Đã cập nhật cuộc đua");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Không thể cập nhật cuộc đua");
    } finally {
      setSavingRace(false);
    }
  };

  const handleUpdateRegistrationStatus = async (registrationId, status) => {
    if (!tournament || !registrationId) return;
    setUpdatingRegistrationId(registrationId);
    try {
      const updated = await tournamentService.updateRegistrationStatus(
        tournament.id,
        registrationId,
        status,
      );
      setTournament(updated);
      toast.success(
        status === "Đã duyệt"
          ? "Đã duyệt đăng ký — chủ ngựa sẽ thấy trạng thái mới"
          : "Đã cập nhật trạng thái đăng ký",
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Không thể cập nhật trạng thái");
    } finally {
      setUpdatingRegistrationId("");
    }
  };

  const handleRemoveRace = async (race) => {
    if (!tournament || !race?.id) return;
    setSavingRace(true);
    try {
      const updated = await tournamentService.deleteRace(tournament.id, race.id);
      setTournament(updated);
      toast.success("Đã xóa cuộc đua");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Không thể xóa cuộc đua");
    } finally {
      setSavingRace(false);
    }
  };

  const changeTab = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === "overview") next.delete("tab");
    else next.set("tab", tab);
    setSearchParams(next);
  };

  if (!tournament) {
    return (
      <AdminLayout showPageHeader={false}>
        <Card className="p-10 text-center text-white/60">
          {loading ? "Đang tải giải đấu..." : "Không tìm thấy giải đấu."}
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout showPageHeader={false}>
      <TournamentHero
        tournament={tournament}
        totalRegistered={totalRegistered}
      />

      <Card className="mb-9 flex flex-wrap gap-2 p-3">
        {detailTabs.map((tab) => {
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
        <RacesTab
          tournament={tournament}
          setTournament={setTournament}
          onAddRace={handleAddRace}
          onSaveRace={handleSaveRace}
          onRemoveRace={handleRemoveRace}
          onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
          updatingRegistrationId={updatingRegistrationId}
          savingRace={savingRace}
        />
      )}
      {selectedTab === "participants" && (
        <ParticipantsTab
          tournament={tournament}
          onUpdateRegistrationStatus={handleUpdateRegistrationStatus}
          updatingRegistrationId={updatingRegistrationId}
        />
      )}
      {selectedTab === "schedule" && <ScheduleTab tournament={tournament} />}
      {selectedTab === "results" && <ResultsTab tournament={tournament} />}
      {selectedTab === "settings" && (
        <SettingsTab
          tournament={tournament}
          setTournament={setTournament}
          onSave={handleSaveSettings}
          saving={saving}
        />
      )}
    </AdminLayout>
  );
}
