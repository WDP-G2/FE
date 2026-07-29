import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Ban,
  ArrowRight,
  Calendar,
  Bell,
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, Pill } from '@/pages/admin/AdminLayout';
import CheckInStatTile from '@/components/referee/CheckInStatTile';
import { useAuthStore } from '@/store/authStore';
import { refereeService } from '@/services/refereeService';
import {
  formatRaceDate,
  formatRaceTime,
  getRefereeRaceDisplayLabel,
  getRefereeRaceStatusTone,
  normalizeRaceStatusCode,
} from '@/utils/refereeRaceUtils';
import { getApiErrorMessage } from '@/utils/apiError';

function mapDashboardRaceItem(item, raceById) {
  const id = item?.id
  const fromApi = id != null ? raceById.get(String(id)) : null
  if (fromApi) return fromApi

  const status = normalizeRaceStatusCode(item?.status)
  return {
    id,
    name: item?.title || 'Cuộc đua',
    scheduledStartAt: item?.at,
    date: formatRaceDate(item?.at),
    time: formatRaceTime(item?.at),
    status,
    statusLabel: getRefereeRaceDisplayLabel({ status }),
    tournamentName: '—',
    distance: '—',
    track: '—',
    participantCount: 0,
    checkedInCount: 0,
    checkedInDisplay: 0,
    pendingCheckInCount: 0,
    absentCount: 0,
    no: id,
  }
}

function RaceRow({ race }) {
  const present = Number(race.checkedInDisplay ?? race.checkedInCount ?? 0)
  const pending = Number(race.pendingCheckInCount ?? 0)
  const absent = Number(race.absentCount ?? 0)

  return (
    <Link
      to={`/referee/races/${race.id}`}
      className="block p-4 bg-white/[0.04] border border-white/10 rounded-2xl hover:border-[#D4A017]/40 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="text-center shrink-0 w-16">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Giờ</div>
          <div className="text-xl font-bold text-[#D4A017]">{race.time}</div>
          <div className="text-[10px] text-white/40 mt-0.5">{race.date}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] font-bold text-[#D4A017] bg-[#D4A017]/15 px-2 py-0.5 rounded-md border border-[#D4A017]/30">
              {typeof race.no === 'number' ? `R${race.no}` : race.no}
            </span>
            <h3 className="font-bold text-white text-sm truncate">{race.name}</h3>
            <Pill tone={getRefereeRaceStatusTone(race)}>{race.statusLabel}</Pill>
          </div>
          <div className="text-[11px] text-white/50 truncate">
            {race.tournamentName} · {race.distance} · {race.track}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <CheckCircle2 className="w-3 h-3" /> Có mặt {present}
            </span>
            <span className="text-white/25">·</span>
            <span className="inline-flex items-center gap-1 text-[#D4A017]">
              <Clock className="w-3 h-3" /> Chờ {pending}
            </span>
            <span className="text-white/25">·</span>
            <span className="inline-flex items-center gap-1 text-white/50">
              <Ban className="w-3 h-3" /> Vắng {absent}
            </span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-[#D4A017] group-hover:translate-x-1 transition-all shrink-0" />
      </div>
    </Link>
  );
}

export function RefereeDashboard() {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.fullName || user?.username || 'Trọng tài';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [scheduleRaces, setScheduleRaces] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({ upcomingRaceCount: 0 });
  const [checkInStats, setCheckInStats] = useState({
    present: 0,
    pending: 0,
    absent: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const [dashboard, mappedRaces, checkInStats] = await Promise.all([
          refereeService.getDashboard(),
          refereeService.loadAssignedRacesMapped(),
          refereeService.getCheckInStatsAcrossAllRaces(),
        ]);

        if (cancelled) return;

        const business = dashboard?.businessSummary ?? {};
        setSummary({
          upcomingRaceCount: Number(business.upcomingRaceCount ?? 0),
        });
        setCheckInStats({
          present: checkInStats.present,
          pending: checkInStats.pending,
          absent: checkInStats.absent,
        });
        setAlerts(Array.isArray(dashboard?.alerts) ? dashboard.alerts : []);

        const raceById = new Map(mappedRaces.map((race) => [String(race.id), race]));

        const upcomingItems = Array.isArray(dashboard?.upcoming) ? dashboard.upcoming : [];
        let upcomingList = upcomingItems
          .map((item) => mapDashboardRaceItem(item, raceById))
          .filter((race) => race?.id != null);

        if (!upcomingList.length) {
          upcomingList = mappedRaces.filter((race) =>
            ['ONGOING', 'SCHEDULED'].includes(normalizeRaceStatusCode(race.status)),
          );
        }

        const enriched = await refereeService.enrichRacesCheckIn(upcomingList);
        if (!cancelled) setScheduleRaces(enriched);
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err) || 'Không tải được dữ liệu tổng quan');
          setScheduleRaces([]);
          setAlerts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const subtitle = useMemo(() => {
    if (loading) return 'Đang tải dữ liệu từ hệ thống...';
    const count = summary.upcomingRaceCount;
    return `Chào ${displayName} · Bạn có ${count} race sắp điều hành`;
  }, [loading, displayName, summary.upcomingRaceCount]);

  return (
    <RefereeLayout title="Trọng tài · Tổng quan" subtitle={subtitle}>
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((alert) => (
            <div
              key={`${alert.type}-${alert.title}`}
              className="flex items-center gap-3 rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/10 px-4 py-3 text-sm text-[#F5E6B8]"
            >
              <Bell className="h-4 w-4 shrink-0 text-[#D4A017]" />
              <span className="font-semibold">{alert.title}</span>
              {alert.status ? (
                <span className="ml-auto rounded-full bg-[#D4A017]/20 px-2 py-0.5 text-xs font-bold text-[#D4A017]">
                  {alert.status}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <CheckInStatTile
          label="Có mặt"
          value={loading ? '...' : String(checkInStats.present)}
          icon={CheckCircle2}
          tone="green"
        />
        <CheckInStatTile
          label="Chờ"
          value={loading ? '...' : String(checkInStats.pending)}
          icon={Clock}
          tone="gold"
        />
        <CheckInStatTile
          label="Vắng mặt"
          value={loading ? '...' : String(checkInStats.absent)}
          icon={Ban}
          tone="gray"
        />
      </div>

      <GlassCard>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cuộc đua đang và sắp điều hành</h2>
              <p className="text-xs text-white/50">
                {loading ? 'Đang tải...' : 'Có mặt / Chờ / Vắng theo từng cuộc đua'}
              </p>
            </div>
          </div>
          <Link
            to="/referee/races"
            className="text-xs text-[#D4A017] hover:underline font-semibold flex items-center gap-1"
          >
            Xem tất cả <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="p-5 space-y-3">
          {loading && (
            <div className="text-center text-white/40 py-8 text-sm">Đang tải danh sách cuộc đua...</div>
          )}

          {!loading && scheduleRaces.length === 0 && (
            <div className="text-center text-white/40 py-8 text-sm">
              Chưa có race đang diễn ra hoặc sắp tới được giao.
            </div>
          )}

          {!loading && scheduleRaces.map((race) => (
            <RaceRow key={race.id} race={race} />
          ))}
        </div>
      </GlassCard>
    </RefereeLayout>
  );
}
