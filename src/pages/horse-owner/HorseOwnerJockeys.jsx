import { useEffect, useMemo, useState } from "react";
import { CheckCircle, Send, Search, Trophy, Users, X } from "lucide-react";
import { toast } from "sonner";
import { horseService } from "@/services/horseService";
import { jockeyService } from "@/services/jockeyService";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  GlassCard,
  GhostButton,
  Pill,
  PrimaryButton,
  TextInput,
} from "../admin/AdminLayout";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { HorseOwnerFormField } from "./components/HorseOwnerFormField";

function findInvitationForJockey(invitations, jockey) {
  return invitations.find((invitation) => String(invitation.jockeyId) === String(jockey.userId));
}

function mergeJockeyAccountsWithProfiles(accounts, approvedProfiles) {
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
      hasApprovedProfile: account.active,
      statusCode: account.active ? profile.statusCode : "INACTIVE",
      status: account.active ? profile.status : "Tài khoản bị khóa",
      statusTone: account.active ? profile.statusTone : "red",
      raw: { account: account.raw, profile: profile.raw },
    };
  });
}

export function HorseOwnerJockeys() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [jockeys, setJockeys] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviteTarget, setInviteTarget] = useState(null);
  const [inviteForm, setInviteForm] = useState({ horseId: "", message: "" });

  const approvedHorses = useMemo(
    () => horses.filter((horse) => horse.statusCode === "APPROVED"),
    [horses],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [jockeyAccounts, availableJockeys, ownerInvitations, ownerHorses] = await Promise.all([
        jockeyService.getJockeyAccounts(),
        jockeyService.getAvailableJockeys(),
        jockeyService.getOwnerInvitations(),
        horseService.getOwnerHorses(),
      ]);
      setJockeys(mergeJockeyAccountsWithProfiles(jockeyAccounts, availableJockeys));
      setInvitations(ownerInvitations);
      setHorses(ownerHorses);
    } catch (error) {
      console.error("Không thể tải dữ liệu jockey", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể tải dữ liệu jockey");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const enrichedJockeys = useMemo(
    () =>
      jockeys.map((jockey) => {
        const invitation = findInvitationForJockey(invitations, jockey);
        const acceptedHorse = invitations.find(
          (item) => String(item.jockeyId) === String(jockey.userId) && item.statusCode === "ACCEPTED",
        );

        return {
          ...jockey,
          invitation,
          status: invitation?.status ?? jockey.status,
          statusTone: invitation?.statusTone ?? jockey.statusTone,
          assigned: acceptedHorse?.horseName ?? null,
        };
      }),
    [invitations, jockeys],
  );

  const filtered = enrichedJockeys.filter((jockey) => {
    const normalized = search.trim().toLowerCase();
    const matchSearch =
      !normalized ||
      `${jockey.name} ${jockey.username} ${jockey.email ?? ""} ${jockey.license}`
        .toLowerCase()
        .includes(normalized);
    const matchStatus = filterStatus === "Tất cả" || jockey.status === filterStatus;
    return matchSearch && matchStatus;
  });

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
    setInviteTarget(jockey);
    setInviteForm({ horseId: approvedHorses[0]?.id ?? "", message: "" });
  };

  const closeInvite = () => {
    setInviteTarget(null);
    setInviteForm({ horseId: "", message: "" });
  };

  const submitInvite = async () => {
    if (!inviteTarget || !inviteForm.horseId) {
      toast.error("Vui lòng chọn ngựa để gửi lời mời");
      return;
    }

    try {
      setSaving(true);
      const invitation = await jockeyService.createInvitation({
        horseId: Number(inviteForm.horseId),
        jockeyId: Number(inviteTarget.userId),
        message: inviteForm.message,
      });
      setInvitations((prev) => [invitation, ...prev]);
      toast.success(`Đã gửi lời mời đến jockey ${inviteTarget.name}`);
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
      toast.success("Đã hủy lời mời jockey");
    } catch (error) {
      console.error("Không thể hủy lời mời jockey", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể hủy lời mời jockey");
    } finally {
      setSaving(false);
    }
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Jockey"
      subtitle="Tìm kiếm tất cả account jockey, gửi lời mời theo ngựa và theo dõi trạng thái phản hồi"
    >
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, username, mã giấy phép..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-[#D4A017]/50 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            "Tất cả",
            "Sẵn sàng",
            "Chưa có hồ sơ duyệt",
            "Tài khoản bị khóa",
            "Chờ phản hồi",
            "Đã nhận",
            "Từ chối",
            "Đã hủy",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                filterStatus === status
                  ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30"
                  : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {status}
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
            <div className="text-xl font-bold text-white">
              {invitations.filter((invitation) => invitation.statusCode === "ACCEPTED").length}
            </div>
            <div className="text-xs text-white/50">Đã nhận lời</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15">
            <Trophy className="h-5 w-5 text-sky-300" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {invitations.filter((invitation) => invitation.statusCode === "PENDING").length}
            </div>
            <div className="text-xs text-white/50">Đang chờ phản hồi</div>
          </div>
        </GlassCard>
      </div>

      {loading ? (
        <GlassCard className="p-10 text-center text-sm text-white/60">
          Đang tải danh sách jockey...
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((jockey) => (
            <GlassCard key={jockey.id} className="p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#D4A017]/20 bg-gradient-to-br from-[#D4A017]/20 to-[#0F1E3A] text-2xl font-bold text-[#D4A017]">
                  {jockey.avatarUrl ? (
                    <img src={jockey.avatarUrl} alt={jockey.name} className="h-full w-full object-cover" />
                  ) : (
                    jockey.name.charAt(0)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold text-white">{jockey.name}</h3>
                  <p className="text-xs text-white/50">{jockey.license}</p>
                  <div className="mt-1">
                    <Pill tone={jockey.statusTone}>{jockey.status}</Pill>
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  <div className="text-lg font-bold text-[#D4A017]">{jockey.hirePriceText}</div>
                  <div className="text-[10px] text-white/40">Giá thuê</div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-white/[0.04] p-3">
                <div className="text-center">
                  <div className="text-base font-bold text-[#D4A017]">{jockey.wins}</div>
                  <div className="text-[10px] text-white/40">Thắng</div>
                </div>
                <div className="border-x border-white/10 text-center">
                  <div className="text-base font-bold text-white">{jockey.races}</div>
                  <div className="text-[10px] text-white/40">Race</div>
                </div>
                <div className="text-center">
                  <div className="text-base font-bold text-emerald-300">{jockey.winRate}%</div>
                  <div className="text-[10px] text-white/40">Tỷ lệ</div>
                </div>
              </div>

              <div className="mb-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Kinh nghiệm</span>
                  <span className="font-semibold text-white">{jockey.experience} năm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Chiều cao / cân nặng</span>
                  <span className="font-semibold text-white">
                    {jockey.height || 0} cm · {jockey.weight || 0} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Ngựa đã nhận</span>
                  <span className="font-semibold text-white">{jockey.assigned ?? "Chưa có"}</span>
                </div>
              </div>

              {jockey.specialties && (
                <p className="mb-4 line-clamp-2 text-xs text-white/45">{jockey.specialties}</p>
              )}

              <div className="flex gap-2">
                {jockey.invitation?.statusCode === "PENDING" ? (
                  <GhostButton
                    className="flex-1"
                    icon={X}
                    disabled={saving}
                    onClick={() => cancelInvite(jockey.invitation)}
                  >
                    Hủy lời mời
                  </GhostButton>
                ) : (
                  <GhostButton className="flex-1" icon={Send} onClick={() => openInvite(jockey)}>
                    Mời
                  </GhostButton>
                )}
                {jockey.invitation && (
                  <PrimaryButton className="flex-1" disabled>
                    {jockey.invitation.horseName || "Đã gửi"}
                  </PrimaryButton>
                )}
              </div>
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

      {inviteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="font-bold text-white">Mời jockey</h2>
                <p className="mt-1 text-sm text-white/45">{inviteTarget.name}</p>
              </div>
              <button
                type="button"
                onClick={closeInvite}
                className="rounded-lg p-1.5 transition-all hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <HorseOwnerFormField label="Chọn ngựa đã duyệt">
                <select
                  value={inviteForm.horseId}
                  onChange={(event) => setInviteForm({ ...inviteForm, horseId: event.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#17191d] px-4 py-2.5 text-sm text-white focus:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20"
                >
                  {approvedHorses.map((horse) => (
                    <option key={horse.id} value={horse.id} className="bg-[#17191d] text-white">
                      {horse.name}
                    </option>
                  ))}
                </select>
              </HorseOwnerFormField>

              <HorseOwnerFormField label="Lời nhắn">
                <TextInput
                  value={inviteForm.message}
                  onChange={(event) => setInviteForm({ ...inviteForm, message: event.target.value })}
                  placeholder="Gửi lời mời tham gia đội..."
                />
              </HorseOwnerFormField>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
              <GhostButton onClick={closeInvite} disabled={saving}>
                Hủy
              </GhostButton>
              <PrimaryButton onClick={submitInvite} disabled={saving} icon={Send}>
                {saving ? "Đang gửi..." : "Gửi lời mời"}
              </PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}
    </HorseOwnerLayout>
  );
}
