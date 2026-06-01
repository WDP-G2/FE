import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Search, Trophy, Send, CheckCircle } from "lucide-react";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { GlassCard, Pill, GhostButton } from "../admin/AdminLayout";
import { jockeyService } from "@/services/jockeyService";
import { getApiErrorMessage } from "@/utils/apiError";
import { toast } from "sonner";
import { InviteJockeyModal } from "./components/InviteJockeyModal";

function invitationTone(status) {
  if (status === "Đã chấp nhận") return "green";
  if (status === "Đã từ chối") return "red";
  if (status === "Chờ xử lý") return "gold";
  return "gray";
}

function invitationSummary(invitation) {
  if (!invitation) return "";
  const parts = [
    invitation.horseName,
    invitation.tournamentName,
    invitation.raceLabel,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function HorseOwnerJockeys() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [jockeys, setJockeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteTarget, setInviteTarget] = useState(null);

  const loadJockeys = useCallback(async () => {
    setLoading(true);
    try {
      const list = await jockeyService.listForOwner();
      setJockeys(Array.isArray(list) ? list : []);
    } catch (err) {
      setJockeys([]);
      toast.error(getApiErrorMessage(err) || "Không tải được danh sách jockey");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJockeys();
  }, [loadJockeys]);

  useEffect(() => {
    const onFocus = () => loadJockeys();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadJockeys]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return jockeys.filter((j) => {
      const matchSearch =
        !query ||
        j.name.toLowerCase().includes(query) ||
        j.license.toLowerCase().includes(query) ||
        (j.email || "").toLowerCase().includes(query);
      const matchStatus =
        filterStatus === "Tất cả" || j.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [filterStatus, jockeys, search]);

  const readyCount = useMemo(
    () => jockeys.filter((j) => j.status === "Sẵn sàng").length,
    [jockeys],
  );

  const pendingInviteCount = useMemo(
    () => jockeys.filter((j) => j.invitationStatus === "Chờ xử lý").length,
    [jockeys],
  );

  const acceptedInviteCount = useMemo(
    () => jockeys.filter((j) => j.invitationStatus === "Đã chấp nhận").length,
    [jockeys],
  );

  return (
    <HorseOwnerLayout
      title="Horse Owner · Jockey"
      subtitle="Mời jockey thi đấu và theo dõi phản hồi lời mời"
    >
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã giấy phép..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-[#D4A017]/50 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {["Tất cả", "Sẵn sàng", "Bận"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                filterStatus === s
                  ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <GlassCard className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A017]/15">
            <Users className="h-5 w-5 text-[#D4A017]" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{jockeys.length}</div>
            <div className="text-xs text-white/50">Tổng jockey</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
            <CheckCircle className="h-5 w-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{readyCount}</div>
            <div className="text-xs text-white/50">Sẵn sàng thi đấu</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15">
            <Trophy className="h-5 w-5 text-sky-300" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {pendingInviteCount}/{acceptedInviteCount}
            </div>
            <div className="text-xs text-white/50">
              Chờ phản hồi / Đã nhận lời mời
            </div>
          </div>
        </GlassCard>
      </div>

      {loading ? (
        <div className="py-16 text-center text-white/50">
          Đang tải danh sách jockey...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((j) => (
            <GlassCard key={j.id} className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4A017]/20 bg-gradient-to-br from-[#D4A017]/20 to-[#0F1E3A] text-2xl font-bold text-[#D4A017]">
                  {j.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-white">
                    {j.name}
                  </h3>
                  <p className="text-xs text-white/50">{j.license}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Pill tone={j.statusTone}>{j.status}</Pill>
                    {j.invitationStatus ? (
                      <Pill tone={invitationTone(j.invitationStatus)}>
                        {j.invitationStatus}
                      </Pill>
                    ) : null}
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <div className="text-lg font-bold text-[#D4A017]">
                    #{j.ranking}
                  </div>
                  <div className="text-[10px] text-white/40">Rank</div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-white/[0.04] p-3">
                <div className="text-center">
                  <div className="text-base font-bold text-[#D4A017]">
                    {j.wins}
                  </div>
                  <div className="text-[10px] text-white/40">Thắng</div>
                </div>
                <div className="border-x border-white/10 text-center">
                  <div className="text-base font-bold text-white">
                    {j.races}
                  </div>
                  <div className="text-[10px] text-white/40">Race</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-emerald-300">
                    {j.winRate}%
                  </div>
                  <div className="text-[10px] text-white/40">Tỷ lệ</div>
                </div>
              </div>

              <div className="mb-4 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-white/50">Lời mời gần nhất</span>
                  <span className="text-right font-semibold text-white">
                    {j.invitationStatus || "Chưa mời"}
                  </span>
                </div>
                {j.invitation ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] leading-5 text-white/65">
                    {invitationSummary(j.invitation)}
                  </div>
                ) : null}
                <div className="flex justify-between gap-2">
                  <span className="text-white/50">Ngựa của bạn (đã duyệt)</span>
                  <span className="text-right font-semibold text-white">
                    {j.assigned ?? "Chưa có"}
                  </span>
                </div>
                {j.assignedOther ? (
                  <div className="flex justify-between gap-2">
                    <span className="text-white/50">Đang cưỡi (giải khác)</span>
                    <span className="text-right font-semibold text-amber-200/90">
                      {j.assignedOther}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between gap-2">
                  <span className="text-white/50">Email</span>
                  <span className="max-w-[55%] truncate text-right font-semibold text-white">
                    {j.email || "—"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="mb-1 flex justify-between text-[10px] text-white/40">
                  <span>Tỷ lệ thắng</span>
                  <span>{j.winRate}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-[#D4A017] to-[#E5B82F]"
                    style={{ width: `${Math.min(j.winRate, 100)}%` }}
                  />
                </div>
              </div>

              <GhostButton
                className="w-full"
                icon={Send}
                onClick={() => setInviteTarget(j)}
              >
                {j.invitationStatus === "Chờ xử lý"
                  ? "Mời thêm"
                  : j.invitationStatus === "Đã từ chối"
                    ? "Mời lại"
                    : j.invitationStatus === "Đã chấp nhận"
                      ? "Mời thêm"
                      : "Mời thi đấu"}
              </GhostButton>
            </GlassCard>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-white/40">
              <Users className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Không tìm thấy jockey nào</p>
            </div>
          )}
        </div>
      )}

      <InviteJockeyModal
        jockey={inviteTarget}
        open={Boolean(inviteTarget)}
        onClose={() => setInviteTarget(null)}
        onSent={loadJockeys}
      />
    </HorseOwnerLayout>
  );
}
