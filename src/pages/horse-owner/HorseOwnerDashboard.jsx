import { Link } from 'react-router';
import {
  PawPrint,
  Trophy,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Bell,
  Sparkles,
  Medal,
} from 'lucide-react';
import { HorseOwnerLayout } from './HorseOwnerLayout';
import { GlassCard, StatCard, Pill, PrimaryButton, GhostButton } from '../admin/AdminLayout';
import { horses, registrations, ownerNotifications, raceResults, fmt } from './data';

export function HorseOwnerDashboard() {
  const unread = ownerNotifications.filter((n) => !n.read).length;
  const upcoming = registrations.filter((r) => r.status === 'Approved' || r.status === 'Pending');
  const totalPrize = raceResults.reduce((s, r) => s + r.prize, 0);

  return (
    <HorseOwnerLayout
      title="Horse Owner · Dashboard"
      subtitle="Chào Nguyễn Chủ Ngựa · Bạn có 2 giải đấu sắp diễn ra"
      actions={
        <>
          <Link to="/horse-owner/registrations">
            <GhostButton icon={ClipboardList}>Đăng ký mới</GhostButton>
          </Link>
          <Link to="/horse-owner/horses">
            <PrimaryButton icon={PawPrint}>Quản lý ngựa</PrimaryButton>
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard label="Tổng số ngựa" value={String(horses.length)} icon={PawPrint} tone="gold" />
        <StatCard label="Giải đang tham gia" value="2" icon={Trophy} tone="green" />
        <StatCard label="Trận sắp tới" value={String(upcoming.length)} icon={Calendar} tone="blue" />
        <StatCard label="Tổng tiền thưởng" value={fmt(totalPrize).replace('₫', '')} icon={DollarSign} tone="purple" />
        <StatCard label="Check-in hôm nay" value="0 / 1" icon={CheckCircle2} tone="gold" />
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
                  <h2 className="text-base font-bold text-white">Lịch thi đấu sắp tới</h2>
                  <p className="text-xs text-white/50">Các race đã đăng ký và được duyệt</p>
                </div>
              </div>
              <Link to="/horse-owner/registrations" className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {upcoming.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-[#D4A017]/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center shrink-0 w-16">
                      <div className="text-[10px] text-white/40 uppercase tracking-wider">Giờ</div>
                      <div className="text-xl font-bold text-[#D4A017]">{reg.raceTime}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold text-[#D4A017] bg-[#D4A017]/15 px-2 py-0.5 rounded-md border border-[#D4A017]/30">
                          {reg.raceNo}
                        </span>
                        <h3 className="font-bold text-white text-sm truncate">{reg.tournament}</h3>
                        <Pill tone={reg.statusTone}>{reg.status}</Pill>
                      </div>
                      <div className="text-[11px] text-white/50">
                        {reg.horse} · Jockey: {reg.jockey ?? 'Chưa chọn'} · {reg.raceDate}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 shrink-0" />
                  </div>
                </div>
              ))}
              {upcoming.length === 0 && (
                <div className="text-center text-white/40 py-8 text-sm">Không có race nào sắp tới.</div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
                  <Medal className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Kết quả gần đây</h2>
                  <p className="text-xs text-white/50">Thành tích thi đấu mới nhất</p>
                </div>
              </div>
              <Link to="/horse-owner/results" className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-5 space-y-3">
              {raceResults.map((res) => (
                <div key={res.id} className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl border border-white/8">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    res.position === 1 ? 'bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/40' :
                    res.position === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/40' :
                    'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                  }`}>
                    #{res.position}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{res.horse}</div>
                    <div className="text-[11px] text-white/50">{res.race} · {res.tournament}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-emerald-300">+{fmt(res.prize)}</div>
                    <div className="text-[11px] text-white/40">{res.date}</div>
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
              <QuickAction to="/horse-owner/horses" icon={PawPrint} label="Thêm ngựa mới" sub="Đăng ký ngựa thi đấu" />
              <QuickAction to="/horse-owner/tournaments" icon={Trophy} label="Xem giải đấu" sub="Giải đấu đang mở" />
              <QuickAction to="/horse-owner/registrations" icon={ClipboardList} label="Đăng ký thi đấu" sub="Chọn ngựa & jockey" />
              <QuickAction to="/horse-owner/payments" icon={DollarSign} label="Thanh toán" sub="Entry fee & tiền thưởng" />
            </div>
          </GlassCard>

          <GlassCard>
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-[#D4A017]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tình trạng ngựa</h3>
                  <p className="text-[11px] text-white/50">{horses.length} ngựa trong đội</p>
                </div>
              </div>
              <Link to="/horse-owner/horses" className="text-xs text-[#D4A017] hover:underline font-semibold">
                Quản lý
              </Link>
            </div>
            <div className="p-3 space-y-2">
              {horses.map((h) => (
                <div key={h.id} className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl">
                  <div className="w-9 h-9 bg-[#D4A017]/10 rounded-lg flex items-center justify-center shrink-0">
                    <PawPrint className="w-4 h-4 text-[#D4A017]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{h.name}</div>
                    <div className="text-[11px] text-white/40">{h.breed} · {h.age} tuổi</div>
                  </div>
                  <Pill tone={h.healthTone}>{h.health}</Pill>
                </div>
              ))}
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
              <Link to="/horse-owner/notifications" className="text-xs text-[#D4A017] hover:underline font-semibold">Tất cả</Link>
            </div>
            <div className="p-3 space-y-1 max-h-72 overflow-y-auto">
              {ownerNotifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl transition-all ${
                    n.read ? 'hover:bg-white/5' : 'bg-[#D4A017]/5 border border-[#D4A017]/20'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && <span className="w-1.5 h-1.5 bg-[#D4A017] rounded-full mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{n.title}</div>
                      <div className="text-[11px] text-white/50 line-clamp-2">{n.body}</div>
                      <div className="text-[10px] text-white/40 mt-1">{n.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </HorseOwnerLayout>
  );
}

function ClipboardList({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function QuickAction({ to, icon: Icon, label, sub }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 p-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl transition-all group"
    >
      <div className="w-9 h-9 bg-[#D4A017]/15 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#D4A017]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-white truncate">{label}</div>
        <div className="text-[11px] text-white/50 truncate">{sub}</div>
      </div>
      <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#D4A017] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}
