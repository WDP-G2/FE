import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { horseService } from "@/services/horseService";
import { jockeyService } from "@/services/jockeyService";
import { tournamentService } from "@/services/tournamentService";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDisplayDate, formatDisplayDateTime } from "@/utils/dateFormat";
import { createIdempotencyKey } from "@/utils/idempotency";

const INVITABLE_STATUSES = ["PUBLISHED", "OPEN_REGISTRATION"];
const emptyInviteForm = {
  horseId: "",
  raceId: "",
  remunerationAmount: "",
  message: "",
};

export function formatRaceDate(value) {
  return formatDisplayDateTime(value, "Chưa cập nhật");
}

function findInvitationsForJockey(invitations, jockey) {
  return invitations.filter((invitation) => String(invitation.jockeyId) === String(jockey.userId));
}

function mergeJockeyAccountsWithProfiles(accounts, approvedProfiles) {
  if (!accounts.length) {
    return approvedProfiles;
  }

  const profileByUserId = new Map(
    approvedProfiles.map((profile) => [String(profile.userId), profile]),
  );

  return accounts.map((account) => {
    const profile = profileByUserId.get(String(account.userId));
    if (!profile) return account;

    return {
      ...account,
      ...profile,
      id: account.id,
      userId: account.userId,
      profileId: profile.profileId,
      name: profile.name || account.name,
      username: profile.username || account.username,
      avatarUrl: profile.avatarUrl || account.avatarUrl,
      active: account.active,
      hasApprovedProfile: true,
      statusCode: account.active ? profile.statusCode : "INACTIVE",
      status: account.active ? profile.status : "Tài khoản bị khóa",
      statusTone: account.active ? profile.statusTone : "red",
      raw: { account: account.raw, profile: profile.raw },
    };
  });
}

function isUpcomingRace(scheduledStartAt) {
  const startAt = parseDate(scheduledStartAt);
  return !startAt || startAt.getTime() >= Date.now();
}

function buildRaceOptions(tournaments) {
  return tournaments.flatMap((tournament) =>
    (tournament.races ?? [])
      .filter(
        (race) =>
          race.id &&
          INVITABLE_STATUSES.includes(tournament.statusCode) &&
          INVITABLE_STATUSES.includes(race.statusCode ?? race.raw?.status) &&
          isUpcomingRace(race.scheduledStartAt),
      )
      .map((race) => ({
        id: String(race.id),
        tournamentId: String(tournament.id),
        label: `${tournament.name} · ${race.name}`,
        meta: `${formatDisplayDate(race.date, "Chưa cập nhật")} ${race.time || ""}`.trim(),
        scheduledStartAt: race.scheduledStartAt,
        scheduledEndAt: race.scheduledEndAt,
        venueName: race.venueName,
        venueAddress: race.venueAddress,
      })),
  );
}

function isActiveInvitation(invitation) {
  return ["PENDING", "ACCEPTED"].includes(invitation?.statusCode);
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function schedulesOverlap(firstStartAt, firstEndAt, secondStartAt, secondEndAt) {
  const firstStart = parseDate(firstStartAt);
  const firstEnd = parseDate(firstEndAt);
  const secondStart = parseDate(secondStartAt);
  const secondEnd = parseDate(secondEndAt);

  if (!firstStart || !firstEnd || !secondStart || !secondEnd) return false;
  return firstStart < secondEnd && firstEnd > secondStart;
}

function summarizeJockeyInvitations(invitations) {
  const pending = invitations.filter((invitation) => invitation.statusCode === "PENDING");
  const accepted = invitations.filter((invitation) => invitation.statusCode === "ACCEPTED");

  return {
    latest: invitations[0] ?? null,
    pending,
    accepted,
    pendingCount: pending.length,
    acceptedCount: accepted.length,
    totalCount: invitations.length,
    assigned: accepted.map((invitation) => invitation.horseName).filter(Boolean).join(", "),
  };
}

function jockeySortKey(jockey) {
  const usernameMatch = String(jockey?.username || "").match(/jockey0*(\d+)/i);
  if (usernameMatch) return Number(usernameMatch[1]);

  const licenseMatch = String(jockey?.license || "").match(/(\d+)/);
  if (licenseMatch) return Number(licenseMatch[1]);

  return Number.MAX_SAFE_INTEGER;
}

function compareJockeys(first, second) {
  const numberDiff = jockeySortKey(first) - jockeySortKey(second);
  if (numberDiff !== 0) return numberDiff;

  return String(first?.name || "").localeCompare(String(second?.name || ""), "vi");
}

async function loadInvitableTournaments() {
  const listResponse = await tournamentService.getPublicTournaments();
  const invitableSummaries = (listResponse.data ?? []).filter((tournament) =>
    INVITABLE_STATUSES.includes(tournament.statusCode),
  );

  const detailResponses = await Promise.all(
    invitableSummaries.map((tournament) =>
      tournamentService.getPublicTournament(tournament.id).catch((error) => {
        console.warn("Không thể tải chi tiết giải đấu", tournament.id, error?.response?.data || error);
        return { data: tournament };
      }),
    ),
  );

  return detailResponses
    .map((response) => response.data)
    .filter((tournament) => INVITABLE_STATUSES.includes(tournament?.statusCode));
}

export function useHorseOwnerJockeys() {
  const [searchParams] = useSearchParams();
  const selectedTournamentId = searchParams.get("tournamentId") || "";
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [jockeys, setJockeys] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [horses, setHorses] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const inviteIdempotencyKeyRef = useRef(null);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [invitationDetailTarget, setInvitationDetailTarget] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [inviteForm, setInviteForm] = useState(emptyInviteForm);
  const [acceptedRaceLocks, setAcceptedRaceLocks] = useState([]);

  const approvedHorses = useMemo(
    () => horses.filter((horse) => horse.statusCode === "APPROVED"),
    [horses],
  );

  const raceOptions = useMemo(() => buildRaceOptions(tournaments), [tournaments]);
  const scopedRaceOptions = useMemo(
    () =>
      selectedTournamentId
        ? raceOptions.filter((race) => String(race.tournamentId) === String(selectedTournamentId))
        : raceOptions,
    [raceOptions, selectedTournamentId],
  );
  const raceOptionById = useMemo(
    () => new Map(raceOptions.map((race) => [String(race.id), race])),
    [raceOptions],
  );
  const selectedTournament = useMemo(
    () =>
      selectedTournamentId
        ? tournaments.find((tournament) => String(tournament.id) === String(selectedTournamentId))
        : null,
    [selectedTournamentId, tournaments],
  );

  const activeInvitations = useMemo(
    () => invitations.filter(isActiveInvitation),
    [invitations],
  );

  const getHorseRaceBlockReason = (horseId, raceId) => {
    if (!horseId || !raceId) return null;

    const selectedRace = raceOptionById.get(String(raceId));
    const blockedInvitation = activeInvitations.find((invitation) => {
      if (String(invitation.horseId) !== String(horseId)) return false;
      if (String(invitation.raceId) === String(raceId)) return true;

      return schedulesOverlap(
        invitation.raceScheduledStartAt,
        invitation.raceScheduledEndAt,
        selectedRace?.scheduledStartAt,
        selectedRace?.scheduledEndAt,
      );
    });

    if (!blockedInvitation) return null;
    return String(blockedInvitation.raceId) === String(raceId)
      ? "Ngựa đã có lời mời trong race này"
      : "Ngựa đã có lời mời ở race trùng giờ";
  };

  const pendingJockeyRaceConflicts = useMemo(() => {
    if (!inviteTarget || !inviteForm.raceId) return [];

    const selectedRace = raceOptionById.get(String(inviteForm.raceId));
    return invitations
      .filter(
        (invitation) =>
          invitation.statusCode === "PENDING" &&
          String(invitation.jockeyId) === String(inviteTarget.userId) &&
          String(invitation.raceId) !== String(inviteForm.raceId) &&
          schedulesOverlap(
            invitation.raceScheduledStartAt,
            invitation.raceScheduledEndAt,
            selectedRace?.scheduledStartAt,
            selectedRace?.scheduledEndAt,
          ),
      );
  }, [invitations, inviteForm.raceId, inviteTarget, raceOptionById]);

  const acceptedRaceLockMap = useMemo(
    () => new Map(acceptedRaceLocks.map((lock) => [String(lock.raceId), lock])),
    [acceptedRaceLocks],
  );

  const getJockeyRaceLockReason = (raceId) => {
    if (!raceId || !acceptedRaceLockMap.has(String(raceId))) return null;
    return "Đã khóa (jockey bận)";
  };

  const isHorseRaceBlocked = (horseId, raceId) =>
    Boolean(getHorseRaceBlockReason(horseId, raceId)) || Boolean(getJockeyRaceLockReason(raceId));

  const isHorseDisabledForSelectedRace = (horseId) => isHorseRaceBlocked(horseId, inviteForm.raceId);

  const isRaceDisabledForSelectedHorse = (raceId) => isHorseRaceBlocked(inviteForm.horseId, raceId);

  const findFirstAvailableInvitePair = () => {
    for (const horse of approvedHorses) {
      for (const race of scopedRaceOptions) {
        if (!isHorseRaceBlocked(horse.id, race.id)) {
          return { horseId: String(horse.id), raceId: String(race.id) };
        }
      }
    }
    return null;
  };

  useEffect(() => {
    let ignore = false;

    Promise.all([
      jockeyService.getJockeyAccounts().catch((error) => {
        console.warn("Không thể tải tài khoản jockey", error?.response?.data || error);
        return [];
      }),
      jockeyService.getAvailableJockeys(),
      jockeyService.getOwnerInvitations(),
      horseService.getOwnerHorses(),
      loadInvitableTournaments().catch((error) => {
        console.warn("Không thể tải danh sách cuộc đua", error?.response?.data || error);
        return [];
      }),
    ])
      .then(([jockeyAccounts, availableJockeys, ownerInvitations, ownerHorses, publicTournaments]) => {
        if (ignore) return;
        setJockeys(mergeJockeyAccountsWithProfiles(jockeyAccounts, availableJockeys));
        setInvitations(ownerInvitations);
        setHorses(ownerHorses);
        setTournaments(publicTournaments);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("Không thể tải dữ liệu jockey", error?.response?.data || error);
        toast.error(getApiErrorMessage(error) || "Không thể tải dữ liệu jockey");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const enrichedJockeys = useMemo(
    () =>
      jockeys.map((jockey) => {
        const jockeyInvitations = findInvitationsForJockey(invitations, jockey);
        const invitationSummary = summarizeJockeyInvitations(jockeyInvitations);
        const status =
          invitationSummary.pendingCount > 0
            ? "Chờ phản hồi"
            : invitationSummary.acceptedCount > 0
              ? "Đã nhận"
              : jockey.status;
        const statusTone =
          invitationSummary.pendingCount > 0
            ? "gold"
            : invitationSummary.acceptedCount > 0
              ? "green"
              : jockey.statusTone;

        return {
          ...jockey,
          invitations: jockeyInvitations,
          invitationSummary,
          latestInvitation: invitationSummary.latest,
          status,
          statusTone,
          assigned: invitationSummary.assigned || null,
        };
      }),
    [invitations, jockeys],
  );

  const statusFilters = useMemo(
    () => [
      "Tất cả",
      ...new Set(enrichedJockeys.map((jockey) => jockey.status).filter(Boolean)),
    ],
    [enrichedJockeys],
  );

  const filteredJockeys = useMemo(
    () =>
      enrichedJockeys
        .filter((jockey) => {
          const normalized = search.trim().toLowerCase();
          const matchSearch =
            !normalized ||
            `${jockey.name} ${jockey.username} ${jockey.email ?? ""} ${jockey.license}`
              .toLowerCase()
              .includes(normalized);
          const matchStatus = filterStatus === "Tất cả" || jockey.status === filterStatus;
          return matchSearch && matchStatus;
        })
        .sort(compareJockeys),
    [enrichedJockeys, filterStatus, search],
  );

  const handleInviteHorseChange = (horseId) => {
    const currentRaceStillAvailable = inviteForm.raceId && !isHorseRaceBlocked(horseId, inviteForm.raceId);
    const nextRaceId = currentRaceStillAvailable
      ? inviteForm.raceId
      : scopedRaceOptions.find((race) => !isHorseRaceBlocked(horseId, race.id))?.id ?? "";

    setInviteForm((prev) => ({ ...prev, horseId, raceId: nextRaceId }));
  };

  const handleInviteRaceChange = (raceId) => {
    const currentHorseStillAvailable = inviteForm.horseId && !isHorseRaceBlocked(inviteForm.horseId, raceId);
    const nextHorseId = currentHorseStillAvailable
      ? inviteForm.horseId
      : approvedHorses.find((horse) => !isHorseRaceBlocked(horse.id, raceId))?.id ?? "";

    setInviteForm((prev) => ({ ...prev, horseId: String(nextHorseId), raceId }));
  };

  const openInvite = (jockey) => {
    if (!jockey.active) {
      toast.error("Tài khoản jockey này đang bị khóa");
      return;
    }
    if (!jockey.hasApprovedProfile) {
      toast.error("Jockey này chưa có hồ sơ đã duyệt nên chưa thể mời");
      return;
    }
    if (approvedHorses.length === 0) {
      toast.error("Bạn cần có ít nhất một ngựa đã duyệt để mời jockey");
      return;
    }
    if (scopedRaceOptions.length === 0) {
      toast.error("Chưa có cuộc đua nào đang mở để gửi lời mời");
      return;
    }
    const firstAvailablePair = findFirstAvailableInvitePair();
    if (!firstAvailablePair) {
      toast.error("Tất cả ngựa đã có lời mời hoặc đã nhận chạy trong các cuộc đua hiện có");
      return;
    }
    setInviteTarget(jockey);
    setInviteForm({
      horseId: firstAvailablePair.horseId,
      raceId: firstAvailablePair.raceId,
      remunerationAmount: "",
      message: "",
    });
    setAcceptedRaceLocks([]);
    jockeyService
      .getAcceptedRaceLocks(jockey.userId)
      .then(setAcceptedRaceLocks)
      .catch((error) => {
        console.warn("Không thể tải danh sách race đã khóa của jockey", error?.response?.data || error);
      });
  };

  const openDetail = async (jockey) => {
    if (!jockey.hasApprovedProfile) {
      toast.error("Jockey này chưa có hồ sơ đã duyệt");
      return;
    }

    try {
      setLoadingDetail(true);
      setDetailTarget(jockey);
      const detail = await jockeyService.getJockeyDetail(jockey.userId);
      setDetailTarget({
        ...jockey,
        ...detail,
        invitations: jockey.invitations,
        invitationSummary: jockey.invitationSummary,
        latestInvitation: jockey.latestInvitation,
        assigned: jockey.assigned,
      });
    } catch (error) {
      console.error("Không thể tải chi tiết jockey", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể tải chi tiết jockey");
      setDetailTarget(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setDetailTarget(null);
    setLoadingDetail(false);
  };

  const openInvitationDetail = (jockey) => {
    if (!jockey.invitations?.length) return;
    setInvitationDetailTarget({
      jockeyName: jockey.name,
      jockeyLicense: jockey.license,
      ...jockey.invitationSummary.latest,
      invitations: jockey.invitations,
      invitationSummary: jockey.invitationSummary,
    });
  };

  const closeInvitationDetail = () => {
    setInvitationDetailTarget(null);
  };

  const closeInvite = () => {
    setInviteTarget(null);
    setInviteForm(emptyInviteForm);
    setAcceptedRaceLocks([]);
  };

  useEffect(() => {
    if (!inviteTarget || !inviteForm.raceId) return;
    if (!isHorseRaceBlocked(inviteForm.horseId, inviteForm.raceId)) return;

    const fallback = findFirstAvailableInvitePair();
    if (!fallback) return;
    queueMicrotask(() => {
      setInviteForm((prev) => ({ ...prev, horseId: fallback.horseId, raceId: fallback.raceId }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedRaceLockMap, inviteTarget]);

  const submitInvite = async () => {
    if (!inviteTarget || !inviteForm.horseId) {
      toast.error("Vui lòng chọn ngựa để gửi lời mời");
      return;
    }
    if (!inviteForm.raceId) {
      toast.error("Vui lòng chọn cuộc đua để gửi lời mời");
      return;
    }
    if (isHorseRaceBlocked(inviteForm.horseId, inviteForm.raceId)) {
      toast.error("Ngựa này đã có lời mời hoặc đã nhận chạy trong cuộc đua đã chọn");
      return;
    }
    const remunerationAmount = Number(inviteForm.remunerationAmount);
    if (!Number.isFinite(remunerationAmount) || remunerationAmount < 0) {
      toast.error("Vui lòng nhập thù lao hợp lệ");
      return;
    }

    try {
      setSaving(true);
      if (!inviteIdempotencyKeyRef.current) inviteIdempotencyKeyRef.current = createIdempotencyKey();
      const invitation = await jockeyService.createInvitation({
        horseId: inviteForm.horseId,
        raceId: inviteForm.raceId,
        jockeyId: inviteTarget.userId,
        remunerationAmount,
        message: inviteForm.message,
      }, inviteIdempotencyKeyRef.current);
      inviteIdempotencyKeyRef.current = null;
      setInvitations((prev) => [invitation, ...prev]);
      toast.success(
        selectedTournamentId
          ? `Đã gửi lời mời đến jockey ${inviteTarget.name}. Chờ jockey chấp nhận rồi quay lại Đăng ký thi đấu.`
          : `Đã gửi lời mời đến jockey ${inviteTarget.name}`,
      );
      closeInvite();
    } catch (error) {
      console.error("Không thể gửi lời mời jockey", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể gửi lời mời jockey");
    } finally {
      setSaving(false);
    }
  };

  const cancelInvite = async (invitation) => {
    try {
      setSaving(true);
      const nextInvitation = await jockeyService.cancelInvitation(invitation.id);
      setInvitations((prev) =>
        prev.map((item) => (item.id === invitation.id ? nextInvitation : item)),
      );
      setInvitationDetailTarget((current) =>
        current
          ? {
              ...current,
              ...nextInvitation,
              invitations: (current.invitations ?? []).map((item) =>
                item.id === nextInvitation.id ? nextInvitation : item,
              ),
            }
          : current,
      );
      toast.success("Đã hủy lời mời jockey");
    } catch (error) {
      console.error("Không thể hủy lời mời jockey", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể hủy lời mời jockey");
    } finally {
      setSaving(false);
    }
  };

  return {
    approvedHorses,
    cancelInvite,
    closeDetail,
    closeInvitationDetail,
    closeInvite,
    detailTarget,
    filterStatus,
    filteredJockeys,
    formatRaceDate,
    handleInviteHorseChange,
    handleInviteRaceChange,
    invitations,
    inviteForm,
    inviteTarget,
    invitationDetailTarget,
    isHorseDisabledForSelectedRace,
    isRaceDisabledForSelectedHorse,
    getJockeyRaceLockReason,
    jockeys,
    loading,
    loadingDetail,
    openDetail,
    openInvitationDetail,
    openInvite,
    pendingJockeyRaceConflicts,
    saving,
    scopedRaceOptions,
    search,
    selectedTournament,
    selectedTournamentId,
    setFilterStatus,
    setInviteForm,
    setSearch,
    statusFilters,
    submitInvite,
  };
}
