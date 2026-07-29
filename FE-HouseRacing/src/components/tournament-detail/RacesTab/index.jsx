import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Flag, Plus } from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import { primaryButton } from "@/components/ui/styles";
import { tournamentService } from "@/services/tournamentService";
import { locationSettingsService } from "@/services/locationSettingsService";
import { systemSettingsService } from "@/services/systemSettingsService";
import { getApiErrorMessage } from "@/utils/apiError";
import RaceHeader from "./RaceHeader";
import RaceGates from "./RaceGates";
import RaceInfo from "./RaceInfo";
import RaceList from "./RaceList";
import RacePrizes from "./RacePrizes";
import RaceRegistrations from "./RaceRegistrations";
import RaceReferees from "./RaceReferees";
import RaceResults from "./RaceResults";
import {
  applyOptionDefaults,
  buildDefaultRace,
  getEffectiveProvinceId,
  getRaceValidationError,
  matchProvinceForTournament,
  mergeDraftRaces,
} from "./helpers";

export default function RacesTab({ tournament, setTournament, onChangeTab }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const autoCreateHandled = useRef(false);
  const [selectedId, setSelectedId] = useState(tournament.races[0]?.id);
  const [panel, setPanel] = useState("info");
  const [saving, setSaving] = useState(false);
  const [venues, setVenues] = useState([]);
  const [distanceOptions, setDistanceOptions] = useState([]);
  const [registrationFeeOptions, setRegistrationFeeOptions] = useState([]);
  const [defaultRegistrationFee, setDefaultRegistrationFee] = useState(0);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const selected =
    tournament.races.find((race) => race.id === selectedId) ??
    tournament.races[0];
  const provinceId = getEffectiveProvinceId(tournament, selected);

  useEffect(() => {
    if (provinceId) return;

    let cancelled = false;

    async function resolveProvince() {
      try {
        const response = await locationSettingsService.getProvinces();
        const match = matchProvinceForTournament(tournament, response.data);

        if (match && !cancelled) {
          setTournament((current) =>
            getEffectiveProvinceId(current)
              ? current
              : {
                  ...current,
                  provinceId: match.id,
                  provinceName: match.name,
                },
          );
        }
      } catch {
        // Ignore province auto-match errors.
      }
    }

    resolveProvince();
  }, [
    provinceId,
    setTournament,
    tournament.id,
    tournament.location,
    tournament.provinceName,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadVenues(resolvedProvinceId) {
      try {
        const response = await locationSettingsService.getTournamentVenues(tournament.id);
        return response.data.filter((venue) => venue.active);
      } catch {
        if (!resolvedProvinceId) return [];
        const fallback = await locationSettingsService.getVenuesByProvince(resolvedProvinceId);
        return fallback.data.filter((venue) => venue.active);
      }
    }

    async function loadOptions() {
      setLoadingOptions(true);

      try {
        const effectiveProvinceId =
          provinceId ||
          getEffectiveProvinceId(tournament) ||
          tournament.raw?.provinceId ||
          "";

        const [settingsResponse, nextVenues] = await Promise.all([
          systemSettingsService.getAdminSettings(),
          effectiveProvinceId
            ? loadVenues(String(effectiveProvinceId))
            : Promise.resolve([]),
        ]);

        if (cancelled) return;

        const nextDistances = settingsResponse.data.raceDistances;
        const nextDefaultFee = Number(settingsResponse.data.defaultRegistrationFee ?? 0);
        const nextFeeOptions = settingsResponse.data.registrationFeeOptions ?? [];

        setDistanceOptions(nextDistances);
        setDefaultRegistrationFee(nextDefaultFee);
        setRegistrationFeeOptions(nextFeeOptions);
        setVenues(nextVenues);

        setTournament((current) => {
          let changed = false;
          const nextRaces = current.races.map((race) => {
            if (!race.isNew) return race;
            const next = applyOptionDefaults(
              race,
              nextDistances,
              nextVenues,
              nextDefaultFee,
            );
            if (
              next.venueId !== race.venueId ||
              next.distance !== race.distance ||
              next.entryFee !== race.entryFee
            ) {
              changed = true;
            }
            return next;
          });

          return changed ? { ...current, races: nextRaces } : current;
        });
      } catch {
        if (!cancelled) {
          setVenues([]);
          setDistanceOptions([]);
        }
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }

    loadOptions();
    return () => {
      cancelled = true;
    };
  }, [provinceId, setTournament, tournament.id]);

  const addRace = () => {
    if (!provinceId) {
      toast.error("Vui lòng chọn tỉnh/thành phố ở tab Cài đặt trước khi tạo cuộc đua");
      onChangeTab?.("settings");
      return;
    }

    if (!venues.length && !loadingOptions) {
      toast.error("Chưa có địa điểm đua cho tỉnh này. Hãy thêm venue trong Cài đặt hệ thống.");
      return;
    }

    const race = buildDefaultRace(
      tournament,
      tournament.races.length + 1,
      distanceOptions,
      venues,
      defaultRegistrationFee,
    );

    setTournament((current) => ({
      ...current,
      races: [...current.races, race],
    }));
    setSelectedId(race.id);
    setPanel("info");
  };

  useEffect(() => {
    if (searchParams.get("new") !== "1" || autoCreateHandled.current) return;
    if (loadingOptions) return;

    autoCreateHandled.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete("new");
    setSearchParams(next, { replace: true });

    if (tournament.races.length > 0) return;

    if (!provinceId) {
      toast.message("Chọn tỉnh/thành phố ở tab Cài đặt, sau đó bấm Tạo cuộc đua");
      return;
    }
    if (!venues.length) {
      toast.message("Chưa có địa điểm đua cho tỉnh này. Hãy thêm venue trước.");
      return;
    }

    const race = buildDefaultRace(
      tournament,
      tournament.races.length + 1,
      distanceOptions,
      venues,
      defaultRegistrationFee,
    );
    setTournament((current) => ({
      ...current,
      races: [...current.races, race],
    }));
    queueMicrotask(() => {
      setSelectedId(race.id);
      setPanel("info");
    });
  }, [
    defaultRegistrationFee,
    distanceOptions,
    loadingOptions,
    provinceId,
    searchParams,
    setSearchParams,
    setTournament,
    tournament.id,
    tournament.races.length,
    venues,
  ]);

  const removeRace = async () => {
    if (!selected) return;

    const nextRaces = tournament.races.filter((race) => race.id !== selected.id);

    if (selected.isNew) {
      setTournament((current) => ({ ...current, races: nextRaces }));
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
    if (!["DRAFT", "PUBLISHED"].includes(tournament.statusCode)) {
      toast.error(
        "Chỉ có thể lưu cấu hình cuộc đua khi giải đấu ở trạng thái Nháp hoặc Đã công bố",
      );
      return;
    }
    if (!provinceId) {
      toast.error("Vui lòng lưu tỉnh/thành phố của giải ở tab Cài đặt trước");
      onChangeTab?.("settings");
      return;
    }
    if (
      nextRace.distance &&
      distanceOptions.length > 0 &&
      !distanceOptions.some((option) => option.value === nextRace.distance)
    ) {
      toast.error("Khoảng cách đã bị xóa khỏi cấu hình. Vui lòng chọn lại");
      return;
    }

    const nextRaces = tournament.races.map((race) =>
      race.id === selected.id ? nextRace : race,
    );
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
        {!provinceId ? (
          <p className="mx-auto mb-6 max-w-xl text-sm text-amber-200">
            Giải đấu chưa có tỉnh/thành phố. Vào tab <strong>Cài đặt</strong>, chọn tỉnh và
            bấm Lưu, sau đó quay lại để tạo cuộc đua.
          </p>
        ) : venues.length === 0 && !loadingOptions ? (
          <p className="mx-auto mb-6 max-w-xl text-sm text-amber-200">
            Tỉnh <strong>{tournament.provinceName || tournament.location}</strong> chưa có địa
            điểm đua. Hãy thêm venue trong phần cài đặt địa điểm hệ thống trước.
          </p>
        ) : (
          <p className="mx-auto mb-6 max-w-xl text-sm text-white/55">
            Bấm nút bên dưới để tạo cuộc đua đầu tiên cho giải này.
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!provinceId && (
            <button
              type="button"
              onClick={() => onChangeTab?.("settings")}
              className={primaryButton}
            >
              Mở tab Cài đặt
            </button>
          )}
          <button type="button" onClick={addRace} className={primaryButton}>
            <Plus className="h-5 w-5" />
            Tạo cuộc đua đầu tiên
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid min-w-0 gap-7 xl:grid-cols-[360px_minmax(0,1fr)]">
      {!provinceId && (
        <Card className="xl:col-span-2 border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          Giải đấu chưa có tỉnh/thành phố trên hệ thống. Vui lòng lưu tỉnh ở tab{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => onChangeTab?.("settings")}
          >
            Cài đặt
          </button>{" "}
          trước khi lưu cuộc đua lên server.
        </Card>
      )}

      <RaceList
        races={tournament.races}
        selectedId={selected.id}
        onAdd={addRace}
        onSelect={setSelectedId}
      />

      <div className="min-w-0 space-y-6">
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
            venues={venues}
            distanceOptions={distanceOptions}
            loadingOptions={loadingOptions}
            registrationFeeOptions={registrationFeeOptions}
            onGoToSettings={() => onChangeTab?.("settings")}
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
        {panel === "registrations" && (
          <RaceRegistrations race={selected} tournament={tournament} />
        )}
        {panel === "referees" && (
          <RaceReferees race={selected} tournament={tournament} />
        )}
        {panel === "gates" && <RaceGates race={selected} active={panel === "gates"} />}
        {panel === "race-results" && <RaceResults race={selected} />}
      </div>
    </div>
  );
}
