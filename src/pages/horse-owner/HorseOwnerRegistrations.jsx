import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ClipboardList, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { jockeyService } from "@/services/jockeyService";
import {
  ACTIVE_RACE_REGISTRATION_STATUSES,
  RACE_REGISTRATION_STATUS_LABELS,
  raceRegistrationService,
} from "@/services/raceRegistrationService";
import { tournamentService } from "@/services/tournamentService";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDisplayDateTime } from "@/utils/dateFormat";
import { fmtVND } from "@/utils/formatCurrency";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { GlassCard, GhostButton, Pill, PrimaryButton } from "../admin/AdminLayout";

const FILTERS = ["Tất cả", "PENDING", "APPROVED", "REJECTED", "WITHDRAWN", "CANCELLED"];
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

function RegistrationCard({ registration, tournament, onWithdraw, saving }) {
  const race = findRace(tournament, registration.raceId);

  return (
    <GlassCard>
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Pill tone={registration.statusTone}>{registration.status}</Pill>
              {registration.rawId && (
                <span className="text-xs font-semibold text-white/35">#{registration.rawId}</span>
              )}
            </div>
            <h3 className="truncate text-base font-bold text-white">
              {tournament?.name || `Giải đấu #${registration.tournamentId}`}
            </h3>
            <p className="mt-1 text-xs text-white/55">
              {race?.name || registration.raceName || "Cuộc đua"} · {registration.horseName} ·
              Jockey: {registration.jockeyUsername || "Chưa cập nhật"}
            </p>
            <p className="mt-1 text-xs text-white/35">
              {formatDisplayDateTime(race?.scheduledStartAt, "Chưa cập nhật lịch")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-bold text-[#D4A017]">
              {fmtVND(registration.entryFeeAmount)}
            </div>
            <div className="mt-1 text-[11px] text-white/35">Lệ phí</div>
          </div>
        </div>

        {(registration.ownerNote || registration.reviewNote || registration.withdrawNote) && (
          <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/55">
            {registration.ownerNote && <div>Ghi chú: {registration.ownerNote}</div>}
            {registration.reviewNote && <div>Admin: {registration.reviewNote}</div>}
            {registration.withdrawNote && <div>Lý do rút: {registration.withdrawNote}</div>}
          </div>
        )}

        {registration.statusCode === "PENDING" && (
          <GhostButton disabled={saving} onClick={() => onWithdraw(registration)}>
            Rút đăng ký
          </GhostButton>
        )}
      </div>
    </GlassCard>
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
        horseId: Number(selectedOption.horseId),
        jockeyInvitationId: Number(selectedOption.rawId ?? selectedOption.id),
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
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition-all ${
              filterStatus === status
                ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30"
                : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {RACE_REGISTRATION_STATUS_LABELS[status] ?? status}
          </button>
        ))}
      </div>

      {!loading &&
        selectedTournamentId &&
        !selectedTournamentActiveRegistration &&
        scopedRegistrationOptions.length === 0 && (
          <GlassCard className="mb-6 border-[#D4A017]/25 bg-[#D4A017]/10 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-white">
                  Bạn cần mời jockey và được chấp nhận trước khi đăng ký thi đấu.
                </h3>
                <p className="mt-1 text-sm text-white/55">
                  {selectedTournament?.name
                    ? `Giải ${selectedTournament.name} chưa có lời mời jockey đã nhận phù hợp.`
                    : "Giải đấu này chưa có lời mời jockey đã nhận phù hợp."}
                </p>
              </div>
              <Link
                to={`/horse-owner/jockeys?tournamentId=${selectedTournamentId}`}
                className="inline-flex items-center justify-center rounded-xl bg-[#D4A017] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#D4A017]/30 transition-all hover:bg-[#B8941F]"
              >
                Mời jockey
              </Link>
            </div>
          </GlassCard>
        )}

      {loading ? (
        <GlassCard className="p-10 text-center text-sm text-white/60">
          Đang tải đăng ký thi đấu...
        </GlassCard>
      ) : filteredRegistrations.length > 0 ? (
        <div className="space-y-4">
          {filteredRegistrations.map((registration) => (
            <RegistrationCard
              key={registration.id}
              registration={registration}
              tournament={tournamentDetails[String(registration.tournamentId)]}
              onWithdraw={handleWithdraw}
              saving={saving}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="p-10 text-center text-sm text-white/55">
          <ClipboardList className="mx-auto mb-3 h-12 w-12 text-white/25" />
          <p>Chưa có đăng ký thi đấu nào</p>
          {scopedRegistrationOptions.length === 0 && (
            <p className="mt-2 text-xs text-white/35">
              Chưa có jockey đã nhận lời mời để đăng ký thi đấu.
            </p>
          )}
        </GlassCard>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="font-bold text-white">Đăng ký thi đấu</h2>
                <p className="mt-1 text-sm text-white/45">
                  Chọn team từ lời mời jockey đã nhận
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1.5 transition-all hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  Lời mời đã nhận
                </label>
                <select
                  value={selectedInvitationId}
                  onChange={(event) => setSelectedInvitationId(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#17191d] px-4 py-3 text-sm text-white focus:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20"
                >
                  {scopedRegistrationOptions.map((option) => (
                    <option key={option.id} value={option.id} className="bg-[#17191d] text-white">
                      {option.tournamentName} · {option.raceName} · {option.horseName} · Jockey:{" "}
                      {option.jockeyName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOption && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Giải đấu", selectedOption.tournamentName],
                    ["Cuộc đua", selectedOption.raceName],
                    ["Ngựa", selectedOption.horseName],
                    ["Jockey", selectedOption.jockeyName],
                    ["Lịch đua", formatDisplayDateTime(selectedOption.raceTime, "Chưa cập nhật")],
                    ["Lệ phí", fmtVND(selectedOption.entryFee)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                        {label}
                      </div>
                      <div className="mt-1 font-semibold text-white">{value || "Chưa cập nhật"}</div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-white/70">
                  Ghi chú đăng ký
                </label>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Ghi chú cho admin..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20"
                />
              </div>

              <div className="rounded-xl border border-[#D4A017]/25 bg-[#D4A017]/10 p-4 text-sm text-white/70">
                Backend sẽ tự trừ lệ phí đăng ký từ ví owner khi gửi thành công.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
              <GhostButton onClick={closeModal} disabled={saving}>
                Hủy
              </GhostButton>
              <PrimaryButton onClick={handleSubmit} disabled={saving || !selectedOption}>
                {saving ? "Đang gửi..." : "Xác nhận đăng ký"}
              </PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}
    </HorseOwnerLayout>
  );
}
