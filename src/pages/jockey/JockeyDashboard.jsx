import { Link } from "react-router-dom";
import {
  Calendar,
  PawPrint,
  Trophy,
  TrendingUp,
  ArrowRight,
  Bell,
  Sparkles,
  Medal,
  Mail,
} from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import {
  GlassCard,
  StatCard,
  Pill,
  PrimaryButton,
  GhostButton,
} from "../admin/AdminLayout";
import {
  jockeyProfile,
  invitations,
  schedules,
  jockeyResults,
  jockeyNotifications,
  assignedHorses,
  fmt,
} from "./data";
import { JockeyQuickAction } from "./components/JockeyQuickAction";
import { JockeyStatRow } from "./components/JockeyStatRow";

export function JockeyDashboard() {
  const unread = jockeyNotifications.filter((n) => !n.read).length;
  const pendingInvitations = invitations.filter(
    (i) => i.status === "Chờ xử lý",
  );
  const totalPrize = jockeyResults.reduce((s, r) => s + r.prize, 0);

  return (
    <JockeyLayout
      title="Jockey · Dashboard"
      subtitle={`Chào ${jockeyProfile.name} · Rank #${jockeyProfile.ranking} · ${pendingInvitations.length} lời mời đang chờ`}
      actions={
        <>
          <Link to="/jockey/invitations">
            <GhostButton icon={Mail}>
              Lời mời ({pendingInvitations.length})
            </GhostButton>
          </Link>
          <Link to="/jockey/schedules">
            <PrimaryButton icon={Calendar}>Lịch race</PrimaryButton>
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Xếp hạng"
          value={`#${jockeyProfile.ranking}`}
          icon={Trophy}
          tone="gold"
          delta="Top 5%"
        />
        <StatCard
          label="Tổng chiến thắng"
          value={String(jockeyProfile.wins)}
          icon={Medal}
          tone="green"
        />
        <StatCard
          label="Tỷ lệ thắng"
          value={`${jockeyProfile.winRate}%`}
          icon={TrendingUp}
          tone="blue"
        />
        <StatCard
          label="Tổng thưởng"
          value={fmt(totalPrize).replace("₫", "")}
          icon={Trophy}
          tone="purple"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Lịch race sắp tới
                  </h2>
                  <p className="text-xs text-white/50">
                    Các race đã xác nhận tham gia
                  </p>
                </div>
              </div>
              <Link
                to="/jockey/schedules"
                className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1"
              >
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {schedules.map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-[#D4A017]/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center shrink-0 w-16">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">
                        Giờ
                      </div>
                      <div className="text-xl font-bold text-[#D4A017]">
                        {s.time}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Pill tone={s.statusTone}>{s.status}</Pill>
                        <h3 className="font-bold text-white text-sm truncate">
                          {s.tournament}
                        </h3>
                      </div>
                      <div className="text-[11px] text-white/50">
                        {s.race} · Ngựa: {s.horse} · Lane #{s.laneNo}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5">
                        {s.date} · {s.location}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
          {pendingInvitations.length > 0 && (
            <GlassCard className="border-[#D4A017]/20">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Lời mời chờ xử lý
                    </h2>
                    <p className="text-xs text-white/50">
                      {pendingInvitations.length} lời mời cần phản hồi
                    </p>
                  </div>
                </div>
                <Link
                  to="/jockey/invitations"
                  className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1"
                >
                  Xem tất cả <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="p-5 space-y-3">
                {pendingInvitations.slice(0, 2).map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 bg-[#D4A017]/5 border border-[#D4A017]/20 rounded-xl"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {inv.horse}
                        </div>
                        <div className="text-xs text-white/50">
                          {inv.tournament} · {inv.raceNo}
                        </div>
                        <div className="text-xs text-white/40 mt-1">
                          {inv.raceDate} · {inv.raceTime} · {inv.owner}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-[#D4A017]">
                          {fmt(inv.reward)}
                        </div>
                        <div className="text-[10px] text-white/40">Thù lao</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                  <Medal className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Kết quả gần đây
                  </h2>
                  <p className="text-xs text-white/50">
                    Thành tích thi đấu mới nhất
                  </p>
                </div>
              </div>
              <Link
                to="/jockey/results"
                className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1"
              >
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {jockeyResults.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                      r.position === 1
                        ? "bg-[#D4A017]/20 text-[#D4A017] border-[#D4A017]/40"
                        : r.position === 2
                          ? "bg-slate-400/20 text-slate-300 border-slate-400/40"
                          : "bg-amber-700/20 text-amber-600 border-amber-700/40"
                    }`}
                  >
                    #{r.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">
                      {r.horse}
                    </div>
                    <div className="text-[11px] text-white/50">
                      {r.race} · {r.tournament}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-emerald-300">
                      +{fmt(r.prize)}
                    </div>
                    <div className="text-[11px] text-white/40">{r.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
        <div className="space-y-6">
          <GlassCard className="p-5 bg-gradient-to-br from-[#D4A017]/15 to-transparent border-[#D4A017]/30">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#D4A017]" />
              <h3 className="text-sm font-bold text-white">Thao tác nhanh</h3>
            </div>
            <div className="space-y-2">
              <JockeyQuickAction
                to="/jockey/invitations"
                icon={Mail}
                label="Xem lời mời"
                sub={`${pendingInvitations.length} chờ phản hồi`}
              />
              <JockeyQuickAction
                to="/jockey/schedules"
                icon={Calendar}
                label="Lịch thi đấu"
                sub={`${schedules.length} race sắp tới`}
              />
              <JockeyQuickAction
                to="/jockey/horses"
                icon={PawPrint}
                label="Ngựa của tôi"
                sub={`${assignedHorses.length} ngựa được assign`}
              />
              <JockeyQuickAction
                to="/jockey/rankings"
                icon={Trophy}
                label="Bảng xếp hạng"
                sub={`Rank hiện tại: #${jockeyProfile.ranking}`}
              />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center relative">
                  <Bell className="w-5 h-5 text-red-300" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Thông báo</h3>
                  <p className="text-[11px] text-white/50">{unread} chưa đọc</p>
                </div>
              </div>
              <Link
                to="/jockey/notifications"
                className="text-xs text-[#D4A017] hover:underline font-semibold"
              >
                Tất cả
              </Link>
            </div>
            <div className="p-3 space-y-1">
              {jockeyNotifications.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl ${!n.read ? "bg-[#D4A017]/5 border border-[#D4A017]/20" : "hover:bg-white/5"}`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="w-1.5 h-1.5 bg-[#D4A017] rounded-full mt-1.5 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">
                        {n.title}
                      </div>
                      <div className="text-[11px] text-white/50 line-clamp-2">
                        {n.body}
                      </div>
                      <div className="text-[10px] text-white/40 mt-1">
                        {n.time}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#D4A017]/30 to-[#0F1E3A] flex items-center justify-center text-3xl font-bold text-[#D4A017] border-2 border-[#D4A017]/30 mb-3">
                A
              </div>
              <h3 className="font-bold text-white">{jockeyProfile.name}</h3>
              <p className="text-xs text-[#D4A017] font-semibold">
                Rank #{jockeyProfile.ranking}
              </p>
            </div>
            <div className="space-y-2 text-xs">
              <JockeyStatRow
                k="Kinh nghiệm"
                v={`${jockeyProfile.experience} năm`}
              />
              <JockeyStatRow k="Giấy phép" v={jockeyProfile.license} />
              <JockeyStatRow k="Tổng race" v={String(jockeyProfile.races)} />
              <JockeyStatRow k="Tổng thắng" v={String(jockeyProfile.wins)} />
              <JockeyStatRow k="Tỷ lệ thắng" v={`${jockeyProfile.winRate}%`} />
            </div>
          </GlassCard>
        </div>
      </div>
    </JockeyLayout>
  );
}
