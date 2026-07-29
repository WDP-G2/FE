import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { jockeyService } from "@/services/jockeyService";
import {
  ACTIVE_RACE_REGISTRATION_STATUSES,
  raceRegistrationService,
} from "@/services/raceRegistrationService";
import { tournamentService } from "@/services/tournamentService";
import { getApiErrorMessage } from "@/utils/apiError";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { GlassCard, PrimaryButton } from "../admin/AdminLayout";
import { HorseOwnerRegistrationCard } from "./components/registrations/HorseOwnerRegistrationCard";
import { HorseOwnerRegistrationEmptyState } from "./components/registrations/HorseOwnerRegistrationEmptyState";
import { HorseOwnerRegistrationFilters } from "./components/registrations/HorseOwnerRegistrationFilters";
import { HorseOwnerRegistrationModal } from "./components/registrations/HorseOwnerRegistrationModal";
import { HorseOwnerRegistrationNeedJockeyNotice } from "./components/registrations/HorseOwnerRegistrationNeedJockeyNotice";

const INVITABLE_STATUSES = ["PUBLISHED", "OPEN_REGISTRATION"];

function isActiveRegistration(registration) {
  return ACTIVE_RACE_REGISTRATION_STATUSES.includes(registration?.statusCode);
}

function comboKey(horseId, raceId) {
  return `${horseId ?? ""}:${raceId ?? ""}`;
}

function findRace(tournament, raceId) {
  return tournament?.races?.find((race) => String(race.id) === String(raceId));
}

async function loadTournamentDetails(tournamentIds) {
  const uniqueIds = [...new Set(tournamentIds.filter(Boolean).map(String))];
  const entries = await Promise.all(
    uniqueIds.map((id) =>
      tournamentService.getPublicTournament(id).catch((error) => {
        console.warn("Không thể tải chi tiết giải đấu", id, error?.response?.data || error);
        return null;
      }),
    ),
  );

  return entries.reduce((map, response) => {
    if (response?.data?.id) {
      map[String(response.data.id)] = response.data;
    }
    return map;
  }, {});
}

function mapAcceptedInvitationOption(invitation, tournament) {
  const race = findRace(tournament, invitation.raceId);

  return {
    id: invitation.id,
    rawId: invitation.rawId,
    horseId: invitation.horseId,
    horseName: invitation.horseName,
    jockeyId: invitation.jockeyId,
    jockeyName: invitation.jockeyUsername,
    raceId: invitation.raceId,
    raceName: race?.name || invitation.raceName,
    tournamentId: invitation.tournamentId,
    tournamentName: tournament?.name || invitation.tournamentName,
    raceTime: race?.scheduledStartAt,
    entryFee: Number(race?.entryFee ?? 0),
    tournamentStatusCode: tournament?.statusCode,
    raceStatusCode: race?.statusCode,
    race,
  };
}

function isEligibleInvitationOption(option) {
  return (
    option?.raceId &&
    option?.horseId &&
    option?.id &&
    option.tournamentStatusCode === "OPEN_REGISTRATION" &&
    INVITABLE_STATUSES.includes(option.raceStatusCode)
  );
}

export function HorseOwnerRegistrations() {
  const [searchParams] = useSearchParams();
  const autoOpenHandled = useRef(false);
  const [registrations, setRegistrations] = useState([]);
  const [acceptedInvitations, setAcceptedInvitations] = useState([]);
  const [tournamentDetails, setTournamentDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvitationId, setSelectedInvitationId] = useState("");
  const [note, setNote] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const selectedTournamentId = searchParams.get("tournamentId") || "";
  const shouldAutoOpen = searchParams.get("open") === "1";

  useEffect(() => {
    autoOpenHandled.current = false;
  }, [selectedTournamentId, shouldAutoOpen]);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      raceRegistrationService.getOwnerRegistrations(),
      jockeyService.getOwnerInvitations(),
    ])
      .then(async ([ownerRegistrations, ownerInvitations]) => {
        const accepted = ownerInvitations.filter((invitation) => invitation.statusCode === "ACCEPTED");
        const tournamentIds = [
          selectedTournamentId,
          ...ownerRegistrations.map((registration) => registration.tournamentId),
          ...accepted.map((invitation) => invitation.tournamentId),
        ];
        const details = await loadTournamentDetails(tournamentIds);
        if (ignore) return;
        setRegistrations(ownerRegistrations);
        setAcceptedInvitations(accepted);
        setTournamentDetails(details);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("Không thể tải đăng ký thi đấu", error?.response?.data || error);
        toast.error(getApiErrorMessage(error) || "Không thể tải đăng ký thi đấu");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [selectedTournamentId]);

  const activeRegisteredInvitationIds = useMemo(() => {
    const ids = new Set();
    registrations.filter(isActiveRegistration).forEach((registration) => {
      if (registration.jockeyInvitationId) ids.add(String(registration.jockeyInvitationId));
    });
    return ids;
  }, [registrations]);

  const activeHorseRaceKeys = useMemo(() => {
    const keys = new Set();
    registrations.filter(isActiveRegistration).forEach((registration) => {
      keys.add(comboKey(registration.horseId, registration.raceId));
    });
    return keys;
  }, [registrations]);

  const registrationOptions = useMemo(
    () =>
      acceptedInvitations
        .map((invitation) =>
          mapAcceptedInvitationOption(invitation, tournamentDetails[String(invitation.tournamentId)]),
        )
        .filter(isEligibleInvitationOption)
        .filter((option) => !activeRegisteredInvitationIds.has(String(option.rawId ?? option.id)))
        .filter((option) => !activeHorseRaceKeys.has(comboKey(option.horseId, option.raceId))),
    [acceptedInvitations, activeHorseRaceKeys, activeRegisteredInvitationIds, tournamentDetails],
  );

  const scopedRegistrationOptions = useMemo(
    () =>
      selectedTournamentId
        ? registrationOptions.filter(
            (option) => String(option.tournamentId) === String(selectedTournamentId),
          )
        : registrationOptions,
    [registrationOptions, selectedTournamentId],
  );

  const selectedTournament = selectedTournamentId
    ? tournamentDetails[String(selectedTournamentId)]
    : null;

  const selectedTournamentActiveRegistration = useMemo(
    () =>
      selectedTournamentId
        ? registrations
            .filter(isActiveRegistration)
            .find((registration) => String(registration.tournamentId) === String(selectedTournamentId))
        : null,
    [registrations, selectedTournamentId],
  );

  const filteredRegistrations = useMemo(
    () =>
      filterStatus === "Tất cả"
        ? registrations
        : registrations.filter((registration) => registration.statusCode === filterStatus),
    [filterStatus, registrations],
  );

  const selectedOption = scopedRegistrationOptions.find((option) => option.id === selectedInvitationId);

  const openModal = () => {
    if (scopedRegistrationOptions.length === 0) {
      toast.error("Chưa có jockey đã nhận lời mời để đăng ký thi đấu");
      return;
    }
    setSelectedInvitationId(scopedRegistrationOptions[0].id);
    setNote("");
    setShowModal(true);
  };

  useEffect(() => {
    if (loading || !shouldAutoOpen || autoOpenHandled.current) return;

    autoOpenHandled.current = true;
    if (scopedRegistrationOptions.length === 0) return;

    queueMicrotask(() => {
      setSelectedInvitationId(scopedRegistrationOptions[0].id);
      setNote("");
      setShowModal(true);
    });
  }, [loading, scopedRegistrationOptions, shouldAutoOpen]);

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvitationId("");
    setNote("");
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      toast.error("Vui lòng chọn lời mời jockey đã nhận");
      return;
    }

    setSaving(true);
    try {
      const registration = await raceRegistrationService.registerForRace(selectedOption.raceId, {
        horseId: selectedOption.horseId,
        jockeyInvitationId: selectedOption.rawId ?? selectedOption.id,
        note: note.trim() || undefined,
      });
      setRegistrations((prev) => [registration, ...prev]);
      toast.success("Đã gửi đăng ký thi đấu, chờ admin duyệt");
      closeModal();
    } catch (error) {
      console.error("Không thể đăng ký thi đấu", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể đăng ký thi đấu");
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async (registration) => {
    setSaving(true);
    try {
      const nextRegistration = await raceRegistrationService.withdrawOwnerRegistration(registration.id);
      setRegistrations((prev) =>
        prev.map((item) => (item.id === registration.id ? nextRegistration : item)),
      );
      toast.success("Đã rút đăng ký");
    } catch (error) {
      console.error("Không thể rút đăng ký", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể rút đăng ký");
    } finally {
      setSaving(false);
    }
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Đăng ký thi đấu"
      subtitle={`${registrations.length} lượt đăng ký`}
      actions={
        <PrimaryButton icon={Plus} onClick={openModal} disabled={loading}>
          Đăng ký mới
        </PrimaryButton>
      }
    >
      <HorseOwnerRegistrationFilters
        filterStatus={filterStatus}
        onChangeFilterStatus={setFilterStatus}
      />

      {!loading &&
        selectedTournamentId &&
        !selectedTournamentActiveRegistration &&
        scopedRegistrationOptions.length === 0 && (
          <HorseOwnerRegistrationNeedJockeyNotice
            selectedTournament={selectedTournament}
            selectedTournamentId={selectedTournamentId}
          />
        )}

      {loading ? (
        <GlassCard className="p-10 text-center text-sm text-white/60">
          Đang tải đăng ký thi đấu...
        </GlassCard>
      ) : filteredRegistrations.length > 0 ? (
        <div className="space-y-4">
          {filteredRegistrations.map((registration) => (
            <HorseOwnerRegistrationCard
              key={registration.id}
              race={findRace(
                tournamentDetails[String(registration.tournamentId)],
                registration.raceId,
              )}
              registration={registration}
              tournament={tournamentDetails[String(registration.tournamentId)]}
              onWithdraw={handleWithdraw}
              saving={saving}
            />
          ))}
        </div>
      ) : (
        <HorseOwnerRegistrationEmptyState
          hasRegistrationOptions={scopedRegistrationOptions.length > 0}
        />
      )}

      {showModal && (
        <HorseOwnerRegistrationModal
          note={note}
          onChangeNote={setNote}
          onChangeSelectedInvitationId={setSelectedInvitationId}
          onClose={closeModal}
          onSubmit={handleSubmit}
          registrationOptions={scopedRegistrationOptions}
          saving={saving}
          selectedInvitationId={selectedInvitationId}
          selectedOption={selectedOption}
        />
      )}
    </HorseOwnerLayout>
  );
}
