import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, RefreshCcw, XCircle, Users } from "lucide-react";
import { toast } from "sonner";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { PanelHeader } from "@/components/ui/Panel";
import { raceRegistrationService } from "@/services/raceRegistrationService";
import { useApiCacheStore } from "@/store/apiCacheStore";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDisplayDateTime } from "@/utils/dateFormat";
import { fmtVND } from "@/utils/formatCurrency";

function actionPayloadId(registration) {
  return registration.rawId ?? registration.id;
}

function invalidateTournamentCaches(tournamentId) {
  const cache = useApiCacheStore.getState();
  cache.removeCache(`admin:tournament:${tournamentId}`);
  cache.removeCache("admin:tournaments");
}

function ActionButton({ children, icon: Icon, tone = "gold", disabled, onClick }) {
  const tones = {
    gold: "border-[#dda50e]/40 bg-[#dda50e]/15 text-[#fff4c2] hover:bg-[#dda50e]/25",
    red: "border-rose-400/40 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25",
    gray: "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function Notes({ registration }) {
  const notes = [
    registration.ownerNote,
    registration.reviewNote,
    registration.withdrawNote,
  ].filter(Boolean);

  if (!notes.length) return <span className="text-white/35">-</span>;

  return (
    <div className="max-w-[260px] space-y-1 text-xs text-white/55">
      {notes.map((note) => (
        <div key={note} className="line-clamp-2">
          {note}
        </div>
      ))}
    </div>
  );
}

export default function RaceRegistrations({ race, tournament }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const tournamentId = tournament?.id ?? race?.tournamentId;
  const raceRegistrations = useMemo(
    () => registrations.filter((registration) => String(registration.raceId) === String(race?.id)),
    [race?.id, registrations],
  );

  useEffect(() => {
    if (!tournamentId) {
      return undefined;
    }

    let cancelled = false;

    async function loadRegistrations() {
      setLoading(true);
      setError("");

      try {
        const data = await raceRegistrationService.getAdminTournamentRegistrations(tournamentId);
        if (!cancelled) setRegistrations(data);
      } catch (requestError) {
        if (!cancelled) {
          setError(getApiErrorMessage(requestError) || "Không thể tải hồ sơ đăng ký");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRegistrations();

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  const updateRegistration = (nextRegistration) => {
    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === nextRegistration.id ? nextRegistration : registration,
      ),
    );
    if (tournamentId) invalidateTournamentCaches(tournamentId);
  };

  const approveRegistration = async (registration) => {
    const id = actionPayloadId(registration);
    setSavingId(String(id));

    try {
      const nextRegistration = await raceRegistrationService.approveRegistration(id);
      updateRegistration(nextRegistration);
      toast.success("Đã duyệt đăng ký thi đấu");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError) || "Không thể duyệt đăng ký");
    } finally {
      setSavingId("");
    }
  };

  const rejectRegistration = async (registration) => {
    const promptedNote = window.prompt("Lý do từ chối đăng ký", "Không đạt điều kiện duyệt");
    if (promptedNote === null) return;

    const note = promptedNote || "Không đạt điều kiện duyệt";
    const id = actionPayloadId(registration);
    setSavingId(String(id));

    try {
      const nextRegistration = await raceRegistrationService.rejectRegistration(id, note);
      updateRegistration(nextRegistration);
      toast.success("Đã từ chối đăng ký thi đấu");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError) || "Không thể từ chối đăng ký");
    } finally {
      setSavingId("");
    }
  };

  return (
    <Card>
      <PanelHeader
        icon={Users}
        title="Đăng ký cuộc đua"
        subtitle={
          loading
            ? "Đang tải hồ sơ đăng ký"
            : `${raceRegistrations.length} hồ sơ đăng ký thật`
        }
      />

      {error && (
        <div className="border-b border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1040px]">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
              {["Mã", "Ngựa", "Chủ ngựa", "Jockey", "Phí", "Trạng thái", "Ghi chú", "Ngày tạo", "Thao tác"].map(
                (header) => (
                  <th key={header} className="px-5 py-4">
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-white/45">
                  Đang tải hồ sơ đăng ký...
                </td>
              </tr>
            )}

            {!loading && !raceRegistrations.length && (
              <tr>
                <td colSpan={9} className="px-5 py-10 text-center text-sm text-white/45">
                  Chưa có hồ sơ đăng ký cho cuộc đua này
                </td>
              </tr>
            )}

            {!loading &&
              raceRegistrations.map((registration) => {
                const isPending = registration.statusCode === "PENDING";
                const disabled = savingId === String(actionPayloadId(registration));

                return (
                  <tr
                    key={registration.id}
                    className="border-b border-white/5 text-sm text-white/70 last:border-0"
                  >
                    <td className="px-5 py-4 font-semibold text-white">#{registration.rawId}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{registration.horseName}</div>
                    </td>
                    <td className="px-5 py-4">
                      {registration.ownerUsername || "Chưa cập nhật"}
                    </td>
                    <td className="px-5 py-4">
                      {registration.jockeyUsername || "Chưa cập nhật"}
                    </td>
                    <td className="px-5 py-4 font-semibold text-white/85">
                      {fmtVND(registration.entryFeeAmount)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={registration.statusTone}>{registration.status}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Notes registration={registration} />
                    </td>
                    <td className="px-5 py-4 text-white/55">
                      {formatDisplayDateTime(registration.createdAt, "Chưa cập nhật")}
                    </td>
                    <td className="px-5 py-4">
                      {isPending ? (
                        <div className="flex flex-wrap gap-2">
                          <ActionButton
                            icon={CheckCircle2}
                            disabled={disabled}
                            onClick={() => approveRegistration(registration)}
                          >
                            Duyệt
                          </ActionButton>
                          <ActionButton
                            icon={XCircle}
                            tone="red"
                            disabled={disabled}
                            onClick={() => rejectRegistration(registration)}
                          >
                            Từ chối
                          </ActionButton>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/35">
                          <RefreshCcw className="h-4 w-4" />
                          Lịch sử
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
