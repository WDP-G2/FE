import { useMemo, useState } from 'react';
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
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, Pill, TextInput, Select } from '@/pages/admin/AdminLayout';
import { assignedRaces, raceStatusTone } from './data';


const TABS = [
  { key: 'Sắp diễn ra', label: 'Sắp diễn ra', match: ['Sắp diễn ra', 'Đang check-in'] },
  { key: 'Đang đua', label: 'Đang diễn ra', match: ['Đang đua'] },
  { key: 'Đã kết thúc', label: 'Đã kết thúc', match: ['Đã kết thúc'] },
];

export function RefereeRaces() {
  const [tab, setTab] = useState('Sắp diễn ra');
  const [q, setQ] = useState('');
  const [view, setView] = useState('grid');

  const active = TABS.find((t) => t.key === tab);

  const filtered = useMemo(
    () =>
      assignedRaces.filter(
        (r) =>
          active.match.includes(r.status) &&
          (!q || `${r.name} ${r.tournamentName} ${r.track}`.toLowerCase().includes(q.toLowerCase()))
      ),
    [tab, q, active]
  );

  return (
    <RefereeLayout
      title="Trọng tài · Cuộc đua được giao"
      subtitle="Chỉ hiển thị race được phân công cho bạn · Tổng cộng 6 race"
    >
      <GlassCard className="mb-6">
        <div className="p-5 border-b border-white/10 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const count = assignedRaces.filter((r) => t.match.includes(r.status)).length;
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
              placeholder="Tìm theo tên race, giải đấu hoặc sân..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value="newest" onChange={() => {}} className="md:w-48">
            <option value="newest">Sắp nhất trước</option>
            <option value="oldest">Cũ nhất trước</option>
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

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => {
            const pct = Math.round((r.checkedIn / r.totalHorses) * 100);
            return (
              <GlassCard key={r.id} className="overflow-hidden hover:border-[#D4A017]/40 transition-all">
                <div className="p-5 border-b border-white/10 bg-gradient-to-br from-[#D4A017]/10 to-transparent">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-[#D4A017] bg-[#D4A017]/15 px-2 py-1 rounded-md border border-[#D4A017]/30">
                      R{r.no}
                    </span>
                    <Pill tone={raceStatusTone(r.status)}>{r.status}</Pill>
                  </div>
                  <h3 className="font-bold text-white text-base leading-tight">{r.name}</h3>
                  <p className="text-[11px] text-[#D4A017]/80 mt-1">{r.tournamentName}</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Meta icon={Calendar} text={`${r.date} · ${r.time}`} />
                    <Meta icon={Flag} text={`${r.distance} · ${r.surface}`} />
                    <Meta icon={MapPin} text={r.track} />
                    <Meta icon={Users} text={`${r.totalHorses} ngựa`} />
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-white/50">Check-in</span>
                      <span className="text-white font-mono">{r.checkedIn}/{r.totalHorses} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4A017] to-[#E5B82F]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    to={`/referee/races/${r.id}`}
                    className="w-full px-4 py-2.5 bg-[#D4A017] hover:bg-[#B8941F] text-white rounded-xl font-semibold text-sm transition-all shadow-md shadow-[#D4A017]/30 flex items-center justify-center gap-2"
                  >
                    Vào điều hành race <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-white/40 border-b border-white/10">
                  <th className="px-6 py-3">Race</th>
                  <th className="px-6 py-3">Giải đấu</th>
                  <th className="px-6 py-3">Thời gian</th>
                  <th className="px-6 py-3">Sân</th>
                  <th className="px-6 py-3 text-center">Ngựa</th>
                  <th className="px-6 py-3 text-center">Check-in</th>
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
                          R{r.no}
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
                        {r.checkedIn}/{r.totalHorses}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <Pill tone={raceStatusTone(r.status)}>{r.status}</Pill>
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

      {filtered.length === 0 && (
        <div className="text-center py-20 text-white/40">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          Không có race nào trong mục này.
        </div>
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
