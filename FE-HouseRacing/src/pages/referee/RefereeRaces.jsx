import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flag,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Search,
  LayoutGrid,
  List as ListIcon,
  Trophy,
  Eye,
  Mail,
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, Pill, TextInput, Select } from '@/pages/admin/AdminLayout';
import { useRefereeRaces } from './useRefereeRaces';
import { getRefereeRaceStatusTone } from '@/utils/refereeRaceUtils';
import RefereeInvitationsPanel from '@/components/referee/RefereeInvitationsPanel';
import { useAuthStore } from '@/store/authStore';
import {
  getPendingInvitationCountForReferee,
  REFEREE_INVITATIONS_UPDATED_EVENT,
  fetchRefereeInvitations,
} from '@/services/refereeInvitationService';

const MAIN_TABS = [
  { key: 'operate', label: 'Điều hành cuộc đua', icon: Flag },
  { key: 'invitations', label: 'Lời mời làm trọng tài', icon: Mail },
];

const STATUS_TABS = [
  { key: 'upcoming', label: 'Sắp diễn ra' },
  { key: 'ongoing', label: 'Đang diễn ra' },
  { key: 'completed', label: 'Đã kết thúc' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export function RefereeRaces() {
  const user = useAuthStore((state) => state.user);
  const { races, loading, error } = useRefereeRaces();
  const [mainTab, setMainTab] = useState('operate');
  const [tab, setTab] = useState('upcoming');
  const [q, setQ] = useState('');
  const [view, setView] = useState('grid');
  const [pendingInvites, setPendingInvites] = useState(() =>
    getPendingInvitationCountForReferee(user),
  );

  useEffect(() => {
    let cancelled = false

    const refreshPending = async () => {
      try {
        await fetchRefereeInvitations({ notify: false })
        if (!cancelled) {
          setPendingInvites(getPendingInvitationCountForReferee(user))
        }
      } catch {
        if (!cancelled) setPendingInvites(0)
      }
    }

    refreshPending()

    const timer = setInterval(refreshPending, 12_000)
    const onFocus = () => refreshPending()
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshPending()
    }

    window.addEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, refreshPending)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener(REFEREE_INVITATIONS_UPDATED_EVENT, refreshPending)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [user])

  useEffect(() => {
    if (loading || !races.length) return;
    if (races.some((race) => race.tabBucket === tab)) return;
    const nextTab = ['ongoing', 'upcoming', 'completed', 'cancelled']
      .find((bucket) => races.some((race) => race.tabBucket === bucket));
    if (nextTab) queueMicrotask(() => setTab(nextTab));
  }, [loading, races, tab]);

  const filtered = useMemo(
    () =>
      races.filter(
        (r) =>
          r.tabBucket === tab &&
          (!q || `${r.name} ${r.tournamentName} ${r.track}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [tab, q, races]
  );

  const subtitle =
    mainTab === 'invitations'
      ? `${pendingInvites} lời mời đang chờ phản hồi`
      : loading
        ? 'Đang tải...'
        : `Cuộc đua đã chấp nhận lời mời · Tổng cộng ${races.length} cuộc đua`;

  return (
    <RefereeLayout
      title="Trọng tài · Cuộc đua được giao"
      subtitle={subtitle}
    >
      {error && mainTab === 'operate' && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <GlassCard className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-white/10 p-5">
          {MAIN_TABS.map((item) => {
            const Icon = item.icon;
            const active = mainTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setMainTab(item.key)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#D4A017] text-white shadow-md shadow-[#D4A017]/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.key === 'invitations' && pendingInvites > 0 ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      active ? 'bg-white/20' : 'bg-[#D4A017]/20 text-[#D4A017]'
                    }`}
                  >
                    {pendingInvites}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {mainTab === 'invitations' ? (
        <RefereeInvitationsPanel />
      ) : (
        <>
      <GlassCard className="mb-6">
        <div className="p-5 border-b border-white/10 flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => {
            const count = races.filter((r) => r.tabBucket === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  tab === t.key
                    ? 'bg-[#D4A017] text-white shadow-md shadow-[#D4A017]/30'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {t.label}
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-white/10'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="p-5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <TextInput
              className="pl-11"
              placeholder="Tìm theo tên cuộc đua, giải đấu hoặc sân..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value="newest" onChange={() => {}} className="md:w-48">
            <option value="newest">Gần nhất trước</option>
            <option value="oldest">Xa nhất trước</option>
          </Select>
          <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === 'grid' ? 'bg-[#D4A017] text-white' : 'text-white/60'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('table')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                view === 'table' ? 'bg-[#D4A017] text-white' : 'text-white/60'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="text-center py-20 text-white/40 text-sm">Đang tải danh sách cuộc đua...</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => (
              <GlassCard key={r.id} className="overflow-hidden hover:border-[#D4A017]/40 transition-all">
                <div className="p-5 border-b border-white/10 bg-gradient-to-br from-[#D4A017]/10 to-transparent">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#D4A017] bg-[#D4A017]/15 px-2 py-1 rounded-md border border-[#D4A017]/30">
                      {typeof r.no === 'number' ? `R${r.no}` : r.no}
                    </span>
                    <Pill tone={getRefereeRaceStatusTone(r)}>{r.statusLabel}</Pill>
                  </div>
                  <h3 className="font-bold text-white text-base leading-tight">{r.name}</h3>
                  <p className="text-[11px] text-[#D4A017]/80 mt-1">{r.tournamentName}</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Meta icon={Calendar} text={`${r.date} · ${r.time}`} />
                    <Meta icon={Flag} text={r.distance} />
                    <Meta icon={MapPin} text={r.track} />
                    <Meta icon={Users} text={`${r.totalHorses} ngựa`} />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-white/50">Xác nhận có mặt</span>
                      <span className="text-white font-mono">{r.checkedInDisplay} / {r.participantCount}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4A017] to-[#E5B82F] transition-all duration-300"
                        style={{
                          width: r.participantCount
                            ? `${Math.min(100, Math.round((r.checkedInCount / r.participantCount) * 100))}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/referee/races/${r.id}`}
                    className="w-full px-4 py-2.5 bg-[#D4A017] hover:bg-[#B8941F] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#D4A017]/30 flex items-center justify-center gap-2"
                  >
                    Vào điều hành cuộc đua <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </GlassCard>
            ))}
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-white/40 border-b border-white/10">
                  <th className="px-6 py-3">Cuộc đua</th>
                  <th className="px-6 py-3">Giải đấu</th>
                  <th className="px-6 py-3">Thời gian</th>
                  <th className="px-6 py-3">Sân</th>
                  <th className="px-6 py-3 text-center">Ngựa</th>
                  <th className="px-6 py-3 text-center">Xác nhận có mặt</th>
                  <th className="px-6 py-3 text-center">Trạng thái</th>
                  <th className="px-6 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#D4A017] bg-[#D4A017]/15 px-2 py-0.5 rounded-md border border-[#D4A017]/30">
                          {typeof r.no === 'number' ? `R${r.no}` : r.no}
                        </span>
                        <span className="font-semibold text-white text-sm">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-white/70">{r.tournamentName}</td>
                    <td className="px-6 py-3 text-sm text-white/70">
                      {r.date} · <span className="text-[#D4A017]">{r.time}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-white/70">{r.track}</td>
                    <td className="px-6 py-3 text-center text-white font-semibold">{r.totalHorses}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="font-mono text-xs text-white">
                        {r.checkedInDisplay} / {r.participantCount}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Pill tone={getRefereeRaceStatusTone(r)}>{r.statusLabel}</Pill>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Link
                        to={`/referee/races/${r.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#D4A017] hover:bg-[#D4A017]/10 rounded-lg"
                      >
                        <Eye className="w-3.5 h-3.5" /> Mở
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20 text-white/40">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Chưa có cuộc đua nào trong mục này.</p>
          <p className="mt-2 text-sm text-white/35">
            Hãy chấp nhận lời mời tại tab &quot;Lời mời làm trọng tài&quot; — admin cần gửi phân công sau đó.
          </p>
        </div>
      )}
        </>
      )}
    </RefereeLayout>
  );
}

function Meta({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-white/60 truncate">
      <Icon className="w-3.5 h-3.5 text-[#D4A017] shrink-0" />
      <span className="truncate">{text}</span>
    </div>
  );
}
