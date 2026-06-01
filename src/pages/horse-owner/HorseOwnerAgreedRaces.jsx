import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle,
  MapPin,
  PawPrint,
  Search,
  Trophy,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  GhostButton,
  PrimaryButton,
} from "../admin/AdminLayout";
import { invitationService } from "@/services/invitationService";

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function statusTone(status) {
  if (status === "Đã chấp nhận") return "green";
  if (status === "Đã từ chối") return "red";
  if (status === "Chờ xử lý") return "gold";
  return "gray";
}

function buildRegisterLink(invitation) {
  if (!invitation?.tournamentId) return "";
  const params = new URLSearchParams();
  if (invitation.raceId) params.set("raceId", invitation.raceId);
  if (invitation.horseId) params.set("horseId", invitation.horseId);
  if (invitation.jockeyId) params.set("jockeyId", invitation.jockeyId);
  params.set("fromAgreement", "1");
  const query = params.toString();
  return `/horse-owner/tournaments/${invitation.tournamentId}/register${
    query ? `?${query}` : ""
  }`;
}

export function HorseOwnerAgreedRaces() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [invitations, setInvitations] = useState([]);

  const tournamentFilter = useMemo(() => {
    const params = new URLSearchParams(search);
    return params.get("tournamentId") || "";
  }, [search]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const list = await invitationService.listSent();
        if (!active) return;
        setInvitations(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error loading agreed races:", err);
        toast.error("Không thể tải danh sách race đã chốt");
        if (active) setInvitations([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const accepted = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return invitations
      .filter((item) => item.status === "Đã chấp nhận")
      .filter((item) => {
        if (!tournamentFilter) return true;
        return String(item.tournamentId || "") === tournamentFilter;
      })
      .filter((item) => {
        if (!query) return true;
        return [item.tournament, item.raceNo, item.horseName, item.jockeyName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
  }, [invitations, searchText, tournamentFilter]);

  return (
    <HorseOwnerLayout
      title="Horse Owner · Race đã chốt"
      subtitle="Chỉ hiển thị race đã được jockey chấp nhận"
      actions={
        <GhostButton onClick={() => navigate("/horse-owner/tournaments")}>
          Quay lại
        </GhostButton>
      }
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Tìm giải, race, ngựa, jockey..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D4A017]/50"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-white/50">
          <CheckCircle className="h-4 w-4 text-emerald-300" />
          {accepted.length} race đã chốt
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {loading ? (
          <GlassCard className="col-span-full p-10 text-center text-white/50">
            Đang tải danh sách race đã chốt...
          </GlassCard>
        ) : accepted.length ? (
          accepted.map((invitation) => {
            const registerLink = buildRegisterLink(invitation);
            const disabled = !invitation.raceId || !invitation.tournamentId;
            return (
              <GlassCard key={invitation.id} className="p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      <Pill tone={statusTone(invitation.status)}>
                        {invitation.status}
                      </Pill>
                      <Pill tone="gold">Đã chấp nhận</Pill>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {invitation.tournament || "Giải đấu chưa đặt tên"}
                    </h3>
                    <p className="mt-1 text-sm text-white/55">
                      {invitation.raceNo || "Chưa chọn race"}
                    </p>
                  </div>
                  <div className="text-right text-xs text-white/50">
                    {formatDate(invitation.raceDate)}
                    {invitation.raceTime ? ` · ${invitation.raceTime}` : ""}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow
                    icon={PawPrint}
                    label="Ngựa"
                    value={invitation.horseName || "Chưa chốt"}
                  />
                  <InfoRow
                    icon={User}
                    label="Jockey"
                    value={invitation.jockeyName || "Chưa chốt"}
                  />
                  <InfoRow
                    icon={MapPin}
                    label="Địa điểm"
                    value={invitation.location || "Chưa cập nhật"}
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Thưởng dự kiến"
                    value={`${formatMoney(invitation.reward)} VND`}
                  />
                </div>

                <div className="mt-4 flex gap-2">
                  <GhostButton
                    icon={Trophy}
                    className="flex-1"
                    onClick={() => navigate("/horse-owner/jockeys")}
                  >
                    Lời mời
                  </GhostButton>
                  <PrimaryButton
                    className="flex-1"
                    disabled={disabled}
                    onClick={() => !disabled && navigate(registerLink)}
                  >
                    Đăng ký
                  </PrimaryButton>
                </div>

                {disabled ? (
                  <div className="mt-3 text-xs text-red-300">
                    Lời mời chưa xác định race, không thể đăng ký.
                  </div>
                ) : null}
              </GlassCard>
            );
          })
        ) : (
          <GlassCard className="col-span-full p-10 text-center text-white/50">
            Chưa có race nào được jockey chấp nhận.
          </GlassCard>
        )}
      </div>
    </HorseOwnerLayout>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
