import { useState } from "react";
import { Flag, Plus } from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import { primaryButton } from "@/components/ui/styles";
import { tournamentService } from "@/services/tournamentService";
import { getApiErrorMessage } from "@/utils/apiError";
import RaceHeader from "./RaceHeader";
import RaceInfo from "./RaceInfo";
import RaceList from "./RaceList";
import {
  RaceGates,
  RaceRegistrations,
  RaceResults,
} from "./RacePanels";
import RacePrizes from "./RacePrizes";
import { getRaceValidationError, mergeDraftRaces } from "./helpers";

export default function RacesTab({ tournament, setTournament }) {
  const [selectedId, setSelectedId] = useState(tournament.races[0]?.id);
  const [panel, setPanel] = useState("info");
  const [saving, setSaving] = useState(false);
  const selected =
    tournament.races.find((race) => race.id === selectedId) ??
    tournament.races[0];

  const addRace = () => {
    const no = tournament.races.length + 1;
    const race = {
      id: `${tournament.id}-r${no}`,
      no,
      name: "",
      description: "",
      date: "",
      time: "",
      distance: "",
      track: "",
      surface: "",
      category: "",
      minHorses: "",
      maxHorses: "",
      registered: 0,
      entryFee: "",
      checkIn: "",
      status: "Nháp",
      prizes: [],
      isNew: true,
    };
    setTournament({ ...tournament, races: [...tournament.races, race] });
    setSelectedId(race.id);
  };

  const removeRace = async () => {
    const nextRaces = tournament.races.filter(
      (race) => race.id !== selected.id,
    );

    if (selected.isNew) {
      setTournament({ ...tournament, races: nextRaces });
      setSelectedId(nextRaces[0]?.id);
      return;
    }

    try {
      setSaving(true);
      const response = await tournamentService.deleteTournamentRace(selected.id);
      const nextTournament = mergeDraftRaces(response.data, nextRaces);
      setTournament(nextTournament);
      setSelectedId(nextTournament.races[0]?.id);
      toast.success("Đã xóa cuộc đua");
    } catch (error) {
      console.error("Không thể xóa cuộc đua", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể xóa cuộc đua");
    } finally {
      setSaving(false);
    }
  };

  const saveRace = async (nextRace) => {
    const nextRaces = tournament.races.map((race) =>
      race.id === selected.id ? nextRace : race,
    );
    if (!["DRAFT", "PUBLISHED"].includes(tournament.statusCode)) {
      toast.error(
        "Chỉ có thể lưu cấu hình cuộc đua khi giải đấu ở trạng thái Nháp hoặc Đã công bố",
      );
      return;
    }

    const validationError = getRaceValidationError(nextRaces, tournament);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      const persistedIds = new Set(
        tournament.races.filter((race) => !race.isNew).map((race) => race.id),
      );
      const response = nextRace.isNew
        ? await tournamentService.addTournamentRace(tournament.id, nextRace)
        : await tournamentService.updateTournamentRace(nextRace.id, nextRace);
      const draftRaces = nextRaces.filter(
        (race) => race.isNew && race.id !== nextRace.id,
      );
      const nextTournament = mergeDraftRaces(response.data, draftRaces);
      const createdRace = nextRace.isNew
        ? response.data.races.find((race) => !persistedIds.has(race.id))
        : null;

      setTournament(nextTournament);
      setSelectedId(createdRace?.id ?? nextRace.id);
      toast.success("Đã lưu cấu hình cuộc đua");
    } catch (error) {
      console.error(
        "Không thể lưu cấu hình cuộc đua",
        error?.response?.data || error,
      );
      toast.error(
        getApiErrorMessage(error) || "Không thể lưu cấu hình cuộc đua",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!selected) {
    return (
      <Card className="p-16 text-center">
        <Flag className="mx-auto mb-5 h-14 w-14 text-[#dda50e]" />
        <h2 className="mb-3 text-2xl font-bold">Chưa có cuộc đua nào</h2>
        <button type="button" onClick={addRace} className={primaryButton}>
          <Plus className="h-5 w-5" />
          Tạo cuộc đua đầu tiên
        </button>
      </Card>
    );
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[360px_1fr]">
      <RaceList
        races={tournament.races}
        selectedId={selected.id}
        onAdd={addRace}
        onSelect={setSelectedId}
      />

      <div className="space-y-6">
        <RaceHeader
          race={selected}
          panel={panel}
          saving={saving}
          onPanelChange={setPanel}
          onRemove={removeRace}
        />

        {panel === "info" && (
          <RaceInfo
            key={selected.id}
            race={selected}
            tournament={tournament}
            saving={saving}
            onSave={(draft) => saveRace({ ...selected, ...draft })}
          />
        )}
        {panel === "prizes" && (
          <RacePrizes
            key={`${selected.id}-prizes`}
            race={selected}
            saving={saving}
            onSave={(prizes) => saveRace({ ...selected, prizes })}
          />
        )}
        {panel === "registrations" && <RaceRegistrations race={selected} />}
        {panel === "gates" && <RaceGates race={selected} />}
        {panel === "race-results" && <RaceResults race={selected} />}
      </div>
    </div>
  );
}
