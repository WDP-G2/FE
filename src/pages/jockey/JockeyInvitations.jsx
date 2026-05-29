import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Check,
  X,
  PawPrint,
  Calendar,
  MapPin,
  DollarSign,
  Trophy,
} from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { GlassCard, Pill, PrimaryButton } from "../admin/AdminLayout";
import { fmt } from "./data";
import { toast } from "sonner";
import { JockeyInfoRow } from "./components/JockeyInfoRow";
import { invitationService } from "@/services/invitationService";
import { getApiErrorMessage } from "@/utils/apiError";

export function JockeyInvitations() {
  const [invs, setInvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Tất cả");
  const [respondingId, setRespondingId] = useState("");

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const list = await invitationService.listMine();
      setInvs(list);
    } catch (err) {
      setInvs([]);
      toast.error(getApiErrorMessage(err) || "Không tải được lời mời");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const pending = useMemo(
    () => invs.filter((i) => i.status === "Chờ xử lý").length,
    [invs],
  );

  const filtered = useMemo(
    () => (filter === "Tất cả" ? invs : invs.filter((i) => i.status === filter)),
    [filter, invs],
  );

  const respond = async (id, action) => {
    setRespondingId(id);
    try {
      const updated = await invitationService.respond(id, action);
      setInvs((prev) => prev.map((i) => (i.id === id ? updated : i)));
      toast.success(
        action === "accept"
          ? "Chấp nhận lời mời thành công!"
          : "Đã từ chối lời mời",
      );
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Không cập nhật được lời mời");
    } finally {
      setRespondingId("");
    }
  };

  return (
    <JockeyLayout
      title="Jockey · Lời mời thi đấu"
      subtitle={`${pending} lời mời đang chờ phản hồi`}
    >
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {["Tất cả", "Chờ xử lý", "Đã chấp nhận", "Đã từ chối"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${filter === f ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30" : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/50">Đang tải lời mời...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((inv) => (
            <GlassCard
              key={inv.id}
              className={inv.status === "Chờ xử lý" ? "border-[#D4A017]/20" : ""}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A017]/20 to-[#0F1E3A] flex items-center justify-center border border-[#D4A017]/20">
                      <PawPrint className="w-6 h-6 text-[#D4A017]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {inv.horse}
                      </h3>
                      <p className="text-xs text-white/50">{inv.horseBread}</p>
                    </div>
                  </div>
                  <Pill tone={inv.statusTone}>{inv.status}</Pill>
                </div>
                <div className="space-y-2.5 mb-4">
                  <JockeyInfoRow icon={Trophy} text={inv.tournament} />
                  <JockeyInfoRow
                    icon={Calendar}
                    text={`${inv.raceDate} · ${inv.raceTime} · ${inv.raceNo}`}
                  />
                  <JockeyInfoRow icon={MapPin} text={inv.location} />
                  <JockeyInfoRow
                    icon={DollarSign}
                    text={`Thù lao: ${fmt(inv.reward)}`}
                    highlight
                  />
                  <div className="text-[11px] text-white/40">
                    Từ chủ ngựa: {inv.owner} · Gửi ngày {inv.sentAt}
                  </div>
                </div>
                {inv.status === "Chờ xử lý" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(inv.id, "reject")}
                      disabled={respondingId === inv.id}
                      className="flex-1 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Từ chối
                    </button>
                    <PrimaryButton
                      icon={Check}
                      className="flex-1"
                      disabled={respondingId === inv.id}
                      onClick={() => respond(inv.id, "accept")}
                    >
                      Chấp nhận
                    </PrimaryButton>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-white/40">
              <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không có lời mời nào</p>
            </div>
          )}
        </div>
      )}
    </JockeyLayout>
  );
}
