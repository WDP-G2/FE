import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Flag,
  Clock,
  Users,
  ClipboardCheck,
  AlertTriangle,
  Award,
  CheckCircle2,
  XCircle,
  Ban,
  Upload,
  Camera,
  Plus,
  Play,
  Send,
  Crown,
  Medal,
  Lock,
  Activity,
  Gavel,
  ShieldCheck,
  Info,
  Save,
  Hash,
  Shuffle,
  LayoutGrid,
  Trash2,
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import CheckInStatTile from '@/components/referee/CheckInStatTile';
import { GlassCard, Pill, PrimaryButton, GhostButton, TextInput, Select } from '@/pages/admin/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { refereeService } from '@/services/refereeService';
import { systemSettingsService } from '@/services/systemSettingsService';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  checkinTone,
  checkInDisplayLabel,
  canRefereeCheckIn,
  getRefereeCheckInBlockedMessage,
  findHorseByGate,
  getAssignedGate,
  mapParticipantFromApi,
  buildRaceFinalizePayload,
  buildResultRowsFromHorses,
  buildResultRowsFromDraft,
  clearResultsDraft,
  loadResultsDraft,
  getRefereeRaceDisplayLabel,
  getRefereeRaceStatusTone,
  canRefereeEditRaceResults,
  formatRaceTimeOnBlur,
  isValidRaceTime,
  isCompleteRaceTime,
  sanitizeRaceTimeInput,
  recompactFinishedRanks,
  assignRanksByFinishTime,
  isValidParticipantId,
  needsRefereeStartRace,
  sortResultRowsForDisplay,
  normalizeRaceStatusCode,
  normalizeTournamentStatusCode,
  randomizeGateMap,
  fetchRaceRules,
  parseRulesLines,
  severityTone,
} from '@/utils/refereeRaceUtils';
import { useRefereeRaces } from './useRefereeRaces';
import { buildViolationTimestamp, formatViolationDisplayId, formatViolationTimestamp, mapActiveViolationTypeLabels } from '@/utils/violationUtils';
import { ViolationEvidencePreviewModal, ViolationEvidenceThumbnail } from './ViolationEvidencePreview';
import { ViolationEditModal } from './ViolationEditModal';
import { RaceSimulationTrack } from '@/components/race-simulation/RaceSimulationTrack';


const TABS = [
  { k: 'overview', label: 'Tổng quan', icon: Info },
  { k: 'management', label: 'Quản lý cuộc đua', icon: LayoutGrid },
];

const MGMT_TABS = [
  { k: 'checkin', label: 'Xác nhận có mặt', icon: ClipboardCheck, desc: 'Xác nhận có mặt & điều kiện' },
  { k: 'positions', label: 'Vị trí xuất phát', icon: Hash, desc: 'Phân chia cổng xuất phát' },
  { k: 'violations', label: 'Vi phạm', icon: AlertTriangle, desc: 'Ghi nhận & theo dõi vi phạm' },
  { k: 'results', label: 'Ghi kết quả', icon: Award, desc: 'Nhập thứ hạng & thời gian' },
];

export function RefereeRaceDetail() {
  const { pathname } = useLocation();
  const id = pathname.split('/').filter(Boolean)[2];
  const navigate = useNavigate();
  const {
    races,
    loading: racesLoading,
    error: racesError,
    reload: reloadRaces,
    applyRaceResponse,
  } = useRefereeRaces();
  const race = races.find((r) => String(r.id) === String(id));
  const [tab, setTab] = useState('overview');
  const [mgmtTab, setMgmtTab] = useState('checkin');
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [startingRace, setStartingRace] = useState(false);

  const reloadRacesQuiet = useCallback(() => reloadRaces({ silent: true }), [reloadRaces]);

  const loadParticipants = useCallback(async () => {
    if (!id) return;
    setParticipantsLoading(true);
    try {
      const data = await refereeService.getRaceParticipants(id);
      setParticipants(data.map(mapParticipantFromApi));
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không tải được danh sách ngựa');
      setParticipants([]);
    } finally {
      setParticipantsLoading(false);
    }
  }, [id]);

  const handleStartRace = async () => {
    if (!id || startingRace) return;
    setStartingRace(true);
    try {
      const startedRace = await refereeService.startRace(id);
      applyRaceResponse(startedRace);
      await Promise.all([
        reloadRaces({ silent: true }),
        loadParticipants(),
      ]);
      toast.success('Cuộc đua đã bắt đầu — bạn có thể ghi và sửa kết quả');
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không thể bắt đầu cuộc đua');
    } finally {
      setStartingRace(false);
    }
  };

  useEffect(() => {
    if (race) queueMicrotask(loadParticipants);
  }, [race, loadParticipants]);

  const goManagement = (sub) => {
    setTab('management');
    setMgmtTab(sub);
  };

  if (racesLoading && races.length === 0) {
    return (
      <RefereeLayout title="Đang tải..." subtitle="Cuộc đua được phân công">
        <div className="text-center py-20 text-white/50 text-sm">Đang tải thông tin cuộc đua...</div>
      </RefereeLayout>
    );
  }

  if (!race) {
    return (
      <RefereeLayout title="Không tìm thấy" subtitle="Cuộc đua không tồn tại hoặc bạn không được phân công">
        <div className="text-center py-20 text-white/50">
          <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Cuộc đua mã &quot;{id}&quot; không có trong danh sách của bạn.</p>
          <button onClick={() => navigate('/referee/races')} className="mt-4 text-[#D4A017] hover:underline">
            ← Quay lại danh sách cuộc đua
          </button>
        </div>
      </RefereeLayout>
    );
  }

  return (
    <RefereeLayout
      title={`Cuộc đua · ${race.name}`}
      subtitle={`${race.tournamentName} · ${typeof race.no === 'number' ? `R${race.no}` : race.no} · ${race.date} ${race.time}`}
      actions={
        <Link to="/referee/races">
          <GhostButton icon={ArrowLeft}>Trở về</GhostButton>
        </Link>
      }
    >
      {racesError && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {racesError}
        </div>
      )}
      {/* Hero context bar */}
      <GlassCard className="mb-6 overflow-hidden">
        <div className="relative bg-gradient-to-br from-[#0F1E3A] via-[#1E3A5F] to-[#0A1628] p-6 border-b border-white/10">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,#D4A017,transparent_60%)]" />
          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#D4A017] to-[#B8941F] rounded-2xl flex items-center justify-center shadow-lg shadow-[#D4A017]/40">
                <span className="text-2xl font-bold text-white">{typeof race.no === 'number' ? `R${race.no}` : race.no}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Pill tone={getRefereeRaceStatusTone(race)}>{getRefereeRaceDisplayLabel(race)}</Pill>
                  <span className="text-[11px] text-white/40 font-mono">{race.id}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{race.name}</h2>
                <p className="text-sm text-[#D4A017]/80 mt-0.5">{race.tournamentName}</p>
              </div>
            </div>
            {race.status === 'SCHEDULED' && race.tournamentStatus === 'ONGOING' && (
              <PrimaryButton icon={Play} onClick={handleStartRace} disabled={startingRace}>
                {startingRace ? 'Đang bắt đầu...' : 'Bắt đầu cuộc đua'}
              </PrimaryButton>
            )}
          </div>
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <MetaTile icon={Calendar} label="Thời gian" value={`${race.date} · ${race.time}`} />
            <MetaTile icon={MapPin} label="Sân" value={race.track} />
            <MetaTile icon={Flag} label="Cự ly" value={race.distance} />
            <MetaTile icon={Users} label="Ngựa" value={`${race.checkedInDisplay} / ${race.participantCount}`} />
          </div>
        </div>

        <div className="px-4 md:px-6 flex flex-wrap gap-1 border-b border-white/10">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={`px-4 py-3 text-sm font-semibold transition-all flex items-center gap-2 border-b-2 -mb-px ${
                  active
                    ? 'border-[#D4A017] text-[#D4A017]'
                    : 'border-transparent text-white/50 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {race.status === 'SCHEDULED' && race.tournamentStatus !== 'ONGOING' && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Cuộc đua đang ở trạng thái Sắp diễn ra. Vui lòng chờ admin bắt đầu giải trước khi bấm Bắt đầu cuộc đua.
        </div>
      )}

      {tab === 'overview' && <OverviewTab race={race} participants={participants} goManagement={goManagement} />}
      {tab === 'management' && (
        <RaceManagementTab
          race={race}
          participants={participants}
          participantsLoading={participantsLoading}
          onReloadParticipants={loadParticipants}
          activeTab={mgmtTab}
          setActiveTab={setMgmtTab}
          onStartRace={handleStartRace}
          startingRace={startingRace}
          onReloadRace={reloadRacesQuiet}
        />
      )}
    </RefereeLayout>
  );
}

function MetaTile({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon className="w-3.5 h-3.5 text-[#D4A017]" />
        <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <div className="text-sm font-bold text-white truncate">{value}</div>
    </div>
  );
}

/* ---------------- Overview ---------------- */
function OverviewTab({ race, participants, goManagement }) {
  const checkedInCount = participants.filter(
    (participant) => participant.raw?.checkInStatus === 'CHECKED_IN',
  ).length;
  const checkInSub = participants.length
    ? `${checkedInCount}/${participants.length} đã check-in`
    : `${race.checkedInDisplay} / ${race.participantCount}`;
  const [rulesLines, setRulesLines] = useState([]);
  const [loadingRules, setLoadingRules] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadRules() {
      setLoadingRules(true);
      try {
        const rulesText = await fetchRaceRules(race.tournamentId);
        if (!cancelled) setRulesLines(parseRulesLines(rulesText));
      } catch {
        if (!cancelled) setRulesLines([]);
      } finally {
        if (!cancelled) setLoadingRules(false);
      }
    }

    loadRules();
    return () => {
      cancelled = true;
    };
  }, [race.tournamentId]);

  return (
    <div className="space-y-6">
      <GlassCard>
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D4A017]" />
            <h3 className="font-bold text-white">Trạng thái điều hành</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <StepCard
              n={1}
              title="Xác nhận có mặt"
              status={
                participants.length > 0 && checkedInCount === participants.length
                  ? 'done'
                  : checkedInCount > 0
                    ? 'active'
                    : 'pending'
              }
              sub={checkInSub}
              onClick={() => goManagement('checkin')}
            />
            <StepCard
              n={2}
              title="Vị trí xuất phát"
              status={checkedInCount > 0 ? 'active' : 'pending'}
              sub={
                checkedInCount > 0
                  ? `Bốc thăm cho ${checkedInCount} ngựa đã check-in`
                  : 'Check-in ngựa trước khi bốc thăm'
              }
              onClick={() => goManagement('positions')}
            />
            <StepCard
              n={3}
              title="Theo dõi vi phạm"
              status={race.status === 'ONGOING' ? 'active' : race.tabBucket === 'completed' ? 'done' : 'pending'}
              sub="Ghi nhận trong suốt cuộc đua"
              onClick={() => goManagement('violations')}
            />
            <StepCard
              n={4}
              title="Nhập & xác nhận kết quả"
              status={race.tabBucket === 'completed' ? 'active' : 'pending'}
              sub="Kết quả chính thức"
              onClick={() => goManagement('results')}
            />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <Gavel className="w-5 h-5 text-[#D4A017]" />
            <h3 className="font-bold text-white">Luật cuộc đua áp dụng</h3>
          </div>
          <div className="p-5 text-sm text-white/70 leading-relaxed space-y-2">
            {loadingRules && (
              <p className="text-white/50">Đang tải luật từ hệ thống...</p>
            )}
            {!loadingRules && rulesLines.length === 0 && (
              <p className="text-white/50">Chưa có luật giải đấu.</p>
            )}
            {!loadingRules && rulesLines.map((line) => (
              <RuleItem key={line} text={line} />
            ))}
            <p className="text-[11px] text-white/40 pt-2">
              Đồng bộ từ Admin → Cài đặt → Luật mặc định / Luật giải đấu.
            </p>
          </div>
        </GlassCard>
    </div>
  );
}

function StepCard({ n, title, status, sub, onClick }) {
  const map = {
    done: { bg: 'bg-emerald-500/15 border-emerald-500/40', icon: CheckCircle2, color: 'text-emerald-300' },
    active: { bg: 'bg-[#D4A017]/15 border-[#D4A017]/40', icon: Activity, color: 'text-[#D4A017]' },
    pending: { bg: 'bg-white/[0.04] border-white/10', icon: Lock, color: 'text-white/40' },
  };
  const m = map[status];
  const Icon = m.icon;
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-2xl border transition-all hover:border-[#D4A017]/40 ${m.bg}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center font-bold ${m.color}`}>
          {n}
        </div>
        <Icon className={`w-4 h-4 ${m.color}`} />
      </div>
      <div className="text-sm font-bold text-white">{title}</div>
      <div className="text-[11px] text-white/50 mt-0.5">{sub}</div>
    </button>
  );
}

function RuleItem({ text }) {
  return (
    <div className="flex items-start gap-2">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

/* ============================================================
   QUẢN LÝ CUỘC ĐUA — container với 4 sub-tab bên trong
   ============================================================ */
function RaceManagementTab({
  race,
  participants,
  participantsLoading,
  onReloadParticipants,
  activeTab,
  setActiveTab,
  onStartRace,
  startingRace = false,
  onReloadRace,
}) {
  const horses = useMemo(() => (Array.isArray(participants) ? participants : []), [participants]);
  const checkedInHorses = useMemo(
    () =>
      horses.filter(
        (horse) => horse.raw?.checkInStatus === 'CHECKED_IN',
      ),
    [horses],
  );
  const horseSignature = useMemo(
    () => checkedInHorses.map((horse) => `${horse.id}:${horse.gateNumber ?? ''}`).join('|'),
    [checkedInHorses],
  );

  const [startPositions, setStartPositions] = useState({});

  useEffect(() => {
    // Keep local gate edits while merging participants loaded from the API.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStartPositions((previous) => {
      const next = { ...previous }
      let changed = false

      checkedInHorses.forEach((horse, index) => {
        const key = String(horse.id)
        const fromApi = horse.gateNumber ?? index + 1
        if (next[key] == null) {
          next[key] = fromApi
          changed = true
        }
      })

      Object.keys(next).forEach((key) => {
        if (!checkedInHorses.some((horse) => String(horse.id) === key)) {
          delete next[key]
          changed = true
        }
      })

      return changed ? next : previous
    })
  }, [horseSignature, checkedInHorses])

  useEffect(() => {
    if (activeTab === 'results' || activeTab === 'positions') {
      onReloadParticipants?.();
    }
    if (activeTab === 'results') {
      onReloadRace?.();
    }
  }, [activeTab, onReloadParticipants, onReloadRace]);

  return (
    <div className="space-y-5">
      {/* Sub-tab header */}
      <GlassCard className="overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#D4A017]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A017]/20 border border-[#D4A017]/40 rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="font-bold text-white">Quản lý cuộc đua</h3>
              <p className="text-xs text-white/50">{race.name} · Chọn phần bên dưới để thao tác</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-white/10">
          {MGMT_TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setActiveTab(t.k)}
                className={`flex flex-col items-center gap-1.5 px-4 py-4 transition-all border-r border-white/10 last:border-r-0 ${
                  active
                    ? 'bg-[#D4A017]/15 text-[#D4A017]'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-semibold">{t.label}</span>
                <span className={`text-[10px] ${active ? 'text-[#D4A017]/70' : 'text-white/30'}`}>{t.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Active tab indicator bar */}
        <div className="flex">
          {MGMT_TABS.map((t) => (
            <div
              key={t.k}
              className={`flex-1 h-0.5 transition-all ${activeTab === t.k ? 'bg-[#D4A017]' : 'bg-transparent'}`}
            />
          ))}
        </div>
      </GlassCard>

      {/* Sub-tab content */}
      {activeTab === 'positions' && (
        <StartingPositionsTab
          race={race}
          horses={checkedInHorses}
          totalHorses={horses.length}
          positions={startPositions}
          setPositions={setStartPositions}
          loading={participantsLoading}
          onReload={onReloadParticipants}
        />
      )}
      {activeTab === 'checkin' && (
        <CheckInTab
          race={race}
          raceId={race.id}
          horses={horses}
          loading={participantsLoading}
          onReload={onReloadParticipants}
        />
      )}
      {activeTab === 'violations' && (
        <ViolationsTab raceId={race.id} raceName={race.name} horses={horses} />
      )}
      {activeTab === 'results' && (
        <ResultsTab
          raceId={race.id}
          race={race}
          horses={horses}
          startPositions={startPositions}
          onStartRace={onStartRace}
          startingRace={startingRace}
          onReloadRace={onReloadRace}
        />
      )}
    </div>
  );
}

/* ---------------- Vị trí xuất phát ---------------- */
function StartingPositionsTab({
  race,
  horses,
  totalHorses,
  positions,
  setPositions,
  loading,
  onReload,
}) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const horseList = Array.isArray(horses) ? horses : []
  const gateCount = horseList.length

  const randomize = () => {
    setSaved(false)
    setPositions(randomizeGateMap(horseList))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await refereeService.saveParticipantGates(
        race.id,
        horseList.map((horse) => ({
          participantId: horse.participantId,
          gateNumber: getAssignedGate(horse, positions),
        })),
      )
      setSaved(true)
      await onReload?.()
      toast.success('Đã lưu phân công cổng xuất phát')
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không lưu được vị trí xuất phát')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-white/40 text-sm">Đang tải danh sách ngựa...</div>
  }

  if (!horseList.length) {
    return (
      <div className="text-center py-12 text-white/40 text-sm">
        Chưa có ngựa check-in (0/{totalHorses}). Hãy sang mục Xác nhận có mặt trước khi chia vị trí xuất phát.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <GlassCard className="p-4 flex items-start gap-3 bg-gradient-to-r from-[#D4A017]/10 to-transparent border-[#D4A017]/30">
        <Info className="w-5 h-5 text-[#D4A017] mt-0.5 shrink-0" />
        <div className="text-xs text-white/70 leading-relaxed">
          Chỉ ngựa đã check-in mới được phân chia cổng xuất phát. Vị trí xuất phát sẽ được sử dụng trong bảng ghi kết quả.
          Dùng <span className="text-[#D4A017] font-semibold">Bốc thăm ngẫu nhiên</span> rồi bấm Lưu phân công.
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
              <Hash className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="font-bold text-white">Phân chia vị trí xuất phát · {race.name}</h3>
              <p className="text-xs text-white/50">
                {horseList.length}/{totalHorses} ngựa đã check-in · {horseList.length} cổng xuất phát
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <GhostButton icon={Shuffle} onClick={randomize}>Bốc thăm ngẫu nhiên</GhostButton>
            <PrimaryButton
              icon={Save}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : saved ? 'Đã lưu' : 'Lưu phân công'}
            </PrimaryButton>
          </div>
        </div>

        {/* Visual gate layout — cố định theo số cổng, đồng bộ với bảng bên dưới */}
        <div className="p-5 border-b border-white/10">
          <div className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-3">Sơ đồ cổng xuất phát</div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: gateCount }, (_, index) => index + 1).map((gate) => {
              const horse = findHorseByGate(horseList, positions, gate)
              return (
                <div
                  key={`gate-${gate}`}
                  className="flex-shrink-0 w-24 p-2.5 bg-gradient-to-b from-[#D4A017]/20 to-[#D4A017]/5 border border-[#D4A017]/40 rounded-xl text-center"
                >
                  <div className="text-xs text-white/40 mb-0.5">Cổng</div>
                  <div className="text-2xl font-bold text-[#D4A017]">{gate}</div>
                  {horse ? (
                    <>
                      <div className="text-[10px] text-white font-semibold truncate mt-0.5">{horse.horse}</div>
                      <div className="text-[9px] text-white/40 truncate">{horse.jockey}</div>
                    </>
                  ) : (
                    <div className="text-[10px] text-white/30 mt-1">—</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Editable table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40 border-b border-white/10">
                <th className="px-4 py-3 text-center w-14">Số #</th>
                <th className="px-4 py-3">Ngựa</th>
                <th className="px-4 py-3">Chủ ngựa</th>
                <th className="px-4 py-3">Jockey</th>
                <th className="px-4 py-3 text-center w-36">Vị trí xuất phát</th>
              </tr>
            </thead>
            <tbody>
              {[...horseList]
                .sort((a, b) => getAssignedGate(a, positions) - getAssignedGate(b, positions))
                .map((horse) => {
                  const assignedGate = getAssignedGate(horse, positions)
                  return (
                <tr key={horse.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex w-8 h-8 rounded-lg bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30 items-center justify-center font-bold text-sm">
                      {assignedGate}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white text-sm">{horse.horse}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70">{horse.owner}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{horse.jockey}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-block w-20 px-3 py-1.5 bg-[#D4A017]/10 border border-[#D4A017]/40 rounded-lg text-[#D4A017] text-sm font-bold text-center select-none"
                      aria-readonly="true"
                    >
                      {assignedGate}
                    </span>
                  </td>
                </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-500/10 border-t border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="text-xs text-emerald-300">Vị trí xuất phát đã được lưu và áp dụng vào bảng kết quả.</span>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

/* ---------------- Check-in ---------------- */
function CheckInTab({ race, raceId, horses: horsesProp, loading, onReload }) {
  const horses = Array.isArray(horsesProp) ? horsesProp : [];
  const [filter, setFilter] = useState('all');
  const [submittingId, setSubmittingId] = useState(null);
  const checkInEnabled = canRefereeCheckIn(race?.status);
  const blockedMessage = getRefereeCheckInBlockedMessage(race?.status, race?.statusLabel);

  const isPresent = (status) =>
    status === 'CHECKED_IN' || status === 'FINISHED' || status === 'DNF' || status === 'DISQUALIFIED';
  const isAbsent = (status) => status === 'ABSENT';

  const applyCheckIn = async (horse, status) => {
    if (!checkInEnabled) {
      toast.error(blockedMessage);
      return;
    }
    setSubmittingId(horse.id);
    try {
      await refereeService.checkInParticipant(raceId, horse.participantId, { status });
      toast.success(status === 'CHECKED_IN' ? 'Đã ghi nhận có mặt' : 'Đã ghi nhận vắng mặt');
      await onReload?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không cập nhật được check-in');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-white/40 text-sm">Đang tải danh sách ngựa...</div>;
  }

  if (!horses.length) {
    return <div className="text-center py-12 text-white/40 text-sm">Chưa có ngựa để check-in.</div>;
  }

  const filtered = horses.filter((h) => {
    if (filter === 'all') return true;
    if (filter === 'CHECKED_IN') return isPresent(h.status);
    if (filter === 'ABSENT') return isAbsent(h.status);
    if (filter === 'REGISTERED') return h.status === 'REGISTERED';
    return true;
  });
  const counts = {
    CHECKED_IN: horses.filter((h) => isPresent(h.status)).length,
    REGISTERED: horses.filter((h) => h.status === 'REGISTERED').length,
    ABSENT: horses.filter((h) => isAbsent(h.status)).length,
  };
  const pct = horses.length ? Math.round((counts.CHECKED_IN / horses.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {!checkInEnabled && (
        <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-300" />
          <span>{blockedMessage}</span>
        </div>
      )}

      <GlassCard className="p-4 flex items-start gap-3 bg-white/[0.03] border-white/10">
        <Info className="w-5 h-5 text-[#D4A017] mt-0.5 shrink-0" />
        <p className="text-xs text-white/70 leading-relaxed">
          Chỉ ghi nhận <strong className="text-white">có mặt</strong> hoặc <strong className="text-white">vắng mặt</strong> trước giờ đua.
          Kết quả thi đấu nhập ở tab <strong className="text-[#D4A017]">Ghi kết quả</strong>.
        </p>
      </GlassCard>

      <div className="grid grid-cols-3 gap-3">
        <CheckInStatTile label="Có mặt" value={counts.CHECKED_IN} tone="green" icon={CheckCircle2} />
        <CheckInStatTile label="Chờ" value={counts.REGISTERED} tone="gold" icon={Clock} />
        <CheckInStatTile label="Vắng mặt" value={counts.ABSENT} tone="gray" icon={Ban} />
      </div>

      <GlassCard>
        <div className="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="font-bold text-white">Bảng check-in</h3>
              <p className="text-xs text-white/50">{counts.CHECKED_IN}/{horses.length} ngựa có mặt · {pct}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="CHECKED_IN">Có mặt</option>
              <option value="REGISTERED">Chờ</option>
              <option value="ABSENT">Vắng mặt</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40 border-b border-white/10">
                <th className="px-4 py-3 text-center w-14">#</th>
                <th className="px-4 py-3">Ngựa</th>
                <th className="px-4 py-3">Chủ ngựa</th>
                <th className="px-4 py-3">Jockey</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => (
                <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex w-8 h-8 rounded-lg bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30 items-center justify-center font-bold text-sm">
                      {h.gateNumber ?? h.no}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white text-sm">{h.horse}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70">{h.owner}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{h.jockey}</td>
                  <td className="px-4 py-3 text-center">
                    <Pill tone={checkinTone(h.status)}>{checkInDisplayLabel(h.status)}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn
                        tone="green"
                        icon={CheckCircle2}
                        active={isPresent(h.status)}
                        title="Có mặt"
                        disabled={!checkInEnabled || submittingId === h.id}
                        onClick={() => applyCheckIn(h, 'CHECKED_IN')}
                      />
                      <ActionBtn
                        tone="gray"
                        icon={Ban}
                        active={isAbsent(h.status)}
                        title="Vắng mặt"
                        disabled={!checkInEnabled || submittingId === h.id}
                        onClick={() => applyCheckIn(h, 'ABSENT')}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function ActionBtn({ tone, icon: Icon, active, title, onClick, disabled }) {
  const map = {
    green: active ? 'bg-emerald-500 text-white' : 'text-emerald-300/70 hover:text-emerald-300 hover:bg-emerald-500/10',
    gray: active ? 'bg-white/20 text-white' : 'text-white/60 hover:text-white hover:bg-white/10',
    purple: active ? 'bg-purple-500 text-white' : 'text-purple-300/70 hover:text-purple-300 hover:bg-purple-500/10',
    red: active ? 'bg-red-500 text-white' : 'text-red-300/70 hover:text-red-300 hover:bg-red-500/10',
  };
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all disabled:opacity-40 ${map[tone]}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

/* ---------------- Violations ---------------- */
function formatEvidenceSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—'
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatTimeOfDay(date = new Date()) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

function formatTimeInputValue(raw) {
  const digits = String(raw).replace(/\D/g, '').slice(0, 6)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`
}

function isValidTimeOfDay(value) {
  const match = /^(\d{2}):(\d{2}):(\d{2})$/.exec(value)
  if (!match) return false
  const hours = Number(match[1])
  const minutes = Number(match[2])
  const seconds = Number(match[3])
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59
}

const FALLBACK_VIOLATION_TYPES = [
  'Xuất phát sai',
  'Lái nguy hiểm',
  'Vi phạm trang bị',
  'Nghi doping',
  'Check-in muộn',
  'Khác',
]

function createViolationDraft(horseNo, type) {
  return {
    horseNo,
    type,
    severity: 'Phạt nhẹ',
    description: '',
    penalty: '',
    occurredAt: formatTimeOfDay(),
    evidenceFile: null,
    evidencePreview: '',
  }
}

function ViolationsTab({ raceId, raceName, horses }) {
  const user = useAuthStore((s) => s.user);
  const refereeName = user?.fullName || user?.username || 'Trọng tài';
  const horseList = Array.isArray(horses) ? horses : [];
  const [list, setList] = useState([]);
  const [loadingViolations, setLoadingViolations] = useState(true);
  const [open, setOpen] = useState(false);
  const evidenceInputRef = useRef(null);
  const [violationTypeOptions, setViolationTypeOptions] = useState(FALLBACK_VIOLATION_TYPES);
  const [form, setForm] = useState(() => createViolationDraft(1, FALLBACK_VIOLATION_TYPES[0]));
  const [submitting, setSubmitting] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState(null);
  const defaultViolationType = violationTypeOptions[0] || FALLBACK_VIOLATION_TYPES[0]

  const loadViolations = useCallback(async () => {
    if (!raceId) return;
    try {
      setLoadingViolations(true);
      const data = await refereeService.getRaceViolations(raceId);
      setList(data);
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không tải được danh sách vi phạm');
      setList([]);
    } finally {
      setLoadingViolations(false);
    }
  }, [raceId]);

  useEffect(() => {
    queueMicrotask(loadViolations);
  }, [loadViolations]);

  useEffect(() => {
    let cancelled = false

    async function loadViolationTypes() {
      try {
        const response = await systemSettingsService.getPublicViolationTypes()
        if (cancelled) return

        const labels = mapActiveViolationTypeLabels(response)

        if (labels.length) setViolationTypeOptions(labels)
      } catch {
        // fallback list keeps UI usable even when settings API is unavailable
      }
    }

    loadViolationTypes()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // Reconcile the selected type when the backend settings list changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm((previous) => {
      if (violationTypeOptions.includes(previous.type)) return previous
      return { ...previous, type: defaultViolationType }
    })
  }, [defaultViolationType, violationTypeOptions])

  const openModal = () => {
    setForm(createViolationDraft(horseList[0]?.no ?? 1, defaultViolationType));
    setOpen(true);
  };

  const resetEvidencePreview = (previewUrl) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const closeModal = () => {
    resetEvidencePreview(form.evidencePreview);
    setOpen(false);
    setForm(createViolationDraft(horseList[0]?.no ?? 1, defaultViolationType));
  };

  const handleEvidenceSelect = (file) => {
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
    ];
    const allowedByName = /\.(jpe?g|png|webp|gif|mp4|mov)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !allowedByName) {
      toast.error('Chỉ hỗ trợ JPG, PNG, GIF, WEBP, MP4, MOV');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File không được vượt quá 100MB');
      return;
    }

    setForm((previous) => {
      resetEvidencePreview(previous.evidencePreview);
      return {
        ...previous,
        evidenceFile: file,
        evidencePreview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : '',
      };
    });
  };

  const submit = async () => {
    const h = horseList.find((x) => x.no === Number(form.horseNo));
    if (!h) return;
    if (!form.evidenceFile) {
      toast.error('Vui lòng tải lên bằng chứng (ảnh hoặc video)');
      return;
    }
    if (!isValidTimeOfDay(form.occurredAt)) {
      toast.error('Thời điểm không hợp lệ. Nhập theo định dạng HH:mm:ss');
      return;
    }

    setSubmitting(true);
    try {
      await refereeService.createViolation(
        raceId,
        {
          participantId: h.id,
          horseNo: h.no,
          horseName: h.horse,
          jockeyName: h.jockey,
          type: form.type,
          severity: form.severity,
          description: form.description || '(không có mô tả)',
          penalty: form.penalty || 'Cảnh cáo',
          occurredAt: buildViolationTimestamp(form.occurredAt),
        },
        form.evidenceFile,
      );
      closeModal();
      await loadViolations();
      toast.success('Đã ghi nhận vi phạm');
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không ghi nhận được vi phạm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <GlassCard>
        <div className="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <h3 className="font-bold text-white">Vi phạm trong cuộc đua · {raceName}</h3>
              <p className="text-xs text-white/50">{list.length} vi phạm đã ghi nhận</p>
            </div>
          </div>
          <PrimaryButton icon={Plus} onClick={openModal}>
            Ghi nhận vi phạm
          </PrimaryButton>
        </div>

        <div className="p-5 space-y-3">
          {loadingViolations && (
            <div className="text-center py-12 text-white/40 text-sm">Đang tải vi phạm...</div>
          )}
          {!loadingViolations && list.length === 0 && (
            <div className="text-center py-12 text-white/40 text-sm">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Chưa có vi phạm nào được ghi nhận trong cuộc đua này.
            </div>
          )}
          {list.map((v) => (
            <div key={v.id} className="p-4 bg-white/[0.04] border border-white/10 rounded-2xl">
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center justify-center font-bold text-red-300">
                    #{v.horseNo}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{v.horse} <span className="text-white/40 text-xs">· {v.jockey}</span></div>
                    <div className="text-[11px] text-[#D4A017] font-mono">{formatViolationDisplayId(v)} · {formatViolationTimestamp(v)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Pill tone="red">{v.type}</Pill>
                  <Pill tone={severityTone(v.severity)}>{v.severity}</Pill>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed mb-3">{v.description}</p>
              <div className="p-3 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-xl mb-3">
                <div className="text-[10px] text-[#D4A017] uppercase tracking-wider font-bold mb-1">Hình phạt</div>
                <div className="text-sm text-white">{v.penalty}</div>
              </div>
              {v.evidence?.length > 0 && (
                <div className="flex flex-wrap items-center gap-3">
                  {v.evidence.map((f) => (
                    <div key={`${v.id}-${f.name}`} className="flex items-center gap-3">
                      <ViolationEvidenceThumbnail
                        file={f}
                        onClick={() => setPreviewEvidence(f)}
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewEvidence(f)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs hover:border-[#D4A017]/40 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#D4A017]" />
                        <span className="text-white">{f.name}</span>
                        <span className="text-white/40">· {f.size}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 text-[10px] text-white/40 flex items-center gap-1.5">
                <Gavel className="w-3 h-3" /> Ghi bởi {v.reporter || refereeName}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto" onClick={closeModal}>
          <div className="bg-[#0F1E3A] border border-white/10 rounded-2xl max-w-2xl w-full my-8" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-br from-red-500/20 to-transparent">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-300" />
                <div>
                  <h3 className="font-bold text-white">Ghi nhận vi phạm mới</h3>
                  <p className="text-xs text-white/50">Tất cả vi phạm phải có bằng chứng đính kèm</p>
                </div>
              </div>
              <button onClick={closeModal} className="text-white/60 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Ngựa vi phạm *">
                <Select value={String(form.horseNo)} onChange={(e) => setForm({ ...form, horseNo: Number(e.target.value) })} className="w-full">
                  {horseList.map((h) => (
                    <option key={h.id} value={h.no}>#{h.no} · {h.horse} · {h.jockey}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Loại vi phạm *">
                <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full">
                  {violationTypeOptions.map((typeLabel) => (
                    <option key={typeLabel} value={typeLabel}>
                      {typeLabel}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Mức độ *">
                <Select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full">
                  <option>Cảnh cáo</option>
                  <option>Phạt nhẹ</option>
                  <option>Phạt nặng</option>
                  <option>Loại</option>
                </Select>
              </Field>
              <Field label="Thời điểm *">
                <TextInput
                  value={form.occurredAt}
                  onChange={(event) => setForm({
                    ...form,
                    occurredAt: formatTimeInputValue(event.target.value),
                  })}
                  placeholder="HH:mm:ss"
                  className="font-mono tabular-nums"
                  maxLength={8}
                  inputMode="numeric"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Mô tả chi tiết *">
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Mô tả hành vi vi phạm, thời điểm xảy ra, vị trí trên đường đua..."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D4A017] resize-none"
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Hình phạt áp dụng">
                  <TextInput
                    value={form.penalty}
                    onChange={(e) => setForm({ ...form, penalty: e.target.value })}
                    placeholder="VD: Trừ 3 giây thành tích · Loại khỏi cuộc đua · Cấm 3 tháng..."
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Bằng chứng (video/ảnh) *">
                  <input
                    ref={evidenceInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov"
                    className="hidden"
                    onChange={(event) => {
                      handleEvidenceSelect(event.target.files?.[0]);
                      event.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => evidenceInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleEvidenceSelect(event.dataTransfer.files?.[0]);
                    }}
                    className="w-full border-2 border-dashed border-[#D4A017]/40 bg-[#D4A017]/5 rounded-xl p-6 text-center transition-all hover:bg-[#D4A017]/10"
                  >
                    <Upload className="w-6 h-6 text-[#D4A017] mx-auto mb-2" />
                    <div className="text-sm text-white font-semibold">Kéo thả hoặc bấm để tải lên</div>
                    <div className="text-[11px] text-white/50 mt-1">MP4, MOV, JPG, PNG · tối đa 100MB</div>
                  </button>

                  {form.evidenceFile && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                      {form.evidencePreview ? (
                        <img
                          src={form.evidencePreview}
                          alt={form.evidenceFile.name}
                          className="h-14 w-14 rounded-lg object-cover border border-white/10"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                          <Camera className="h-6 w-6 text-[#D4A017]" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-white">{form.evidenceFile.name}</div>
                        <div className="text-xs text-white/50">{formatEvidenceSize(form.evidenceFile.size)}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setForm((previous) => {
                            resetEvidencePreview(previous.evidencePreview);
                            return { ...previous, evidenceFile: null, evidencePreview: '' };
                          });
                        }}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                      >
                        Xóa
                      </button>
                    </div>
                  )}
                </Field>
              </div>
            </div>

            <div className="p-6 pt-0 flex justify-end gap-2 border-t border-white/10 pt-4">
              <GhostButton onClick={closeModal}>Hủy</GhostButton>
              <PrimaryButton
                icon={Send}
                onClick={submit}
                disabled={submitting || !form.description.trim() || !form.evidenceFile || !isValidTimeOfDay(form.occurredAt)}
              >
                {submitting ? 'Đang lưu...' : 'Ghi nhận vi phạm'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <ViolationEvidencePreviewModal
        file={previewEvidence}
        onClose={() => setPreviewEvidence(null)}
      />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-white/60 font-semibold mb-2">{label}</label>
      {children}
    </div>
  );
}

/* ---------------- Results ---------------- */

function ResultsTab({
  raceId,
  race,
  horses: horsesProp,
  startPositions,
  onStartRace,
  startingRace,
  onReloadRace,
}) {
  const sourceHorses = useMemo(
    () => (Array.isArray(horsesProp) ? horsesProp : []),
    [horsesProp],
  );
  const safeStartPositions = useMemo(
    () => startPositions && typeof startPositions === 'object' && !Array.isArray(startPositions)
      ? startPositions
      : {},
    [startPositions],
  );
  const propRaceStatus = normalizeRaceStatusCode(race?.status);
  const tournamentStatus = normalizeTournamentStatusCode(race?.tournamentStatus);
  const [refreshedRace, setRefreshedRace] = useState(null);
  const liveRaceStatus = refreshedRace?.raceId === String(raceId)
    ? refreshedRace.status
    : propRaceStatus;
  const horses = useMemo(() => {
    if (!['ONGOING', 'RESULT_CONFIRMED'].includes(liveRaceStatus)) return sourceHorses;
    return sourceHorses.filter((horse) =>
      ['CHECKED_IN', 'RACING', 'FINISHED', 'DISQUALIFIED', 'DNF'].includes(
        String(horse.status || '').toUpperCase(),
      ),
    );
  }, [liveRaceStatus, sourceHorses]);
  const canEdit = canRefereeEditRaceResults(liveRaceStatus);
  const needsManualStart = needsRefereeStartRace(liveRaceStatus, tournamentStatus);
  const hasSavedResults = liveRaceStatus === 'RESULT_CONFIRMED';

  const [rows, setRows] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState(null);
  const [resultDraft, setResultDraft] = useState(null);
  const [resultDataLoading, setResultDataLoading] = useState(false);
  const [resultDraftError, setResultDraftError] = useState('');
  const [resultViolations, setResultViolations] = useState([]);
  const [violationRow, setViolationRow] = useState(null);
  const [editingResultViolation, setEditingResultViolation] = useState(null);
  const [violationSubmitting, setViolationSubmitting] = useState(false);
  const [resultViolationTypes, setResultViolationTypes] = useState(FALLBACK_VIOLATION_TYPES);
  const [resultViolationForm, setResultViolationForm] = useState(() =>
    createViolationDraft(1, FALLBACK_VIOLATION_TYPES[0]),
  );
  const resultCardRef = useRef(null);
  const hasSimulationDraft = Boolean(resultDraft?.simulationRunId);
  const draftCanReview =
    canEdit && resultDraft?.status === 'REVIEW_PENDING' && !hasSavedResults;
  const manualCanEdit = canEdit && !simulationStatus && !hasSimulationDraft;

  const refreshLiveRaceStatus = async () => {
    if (!raceId) return propRaceStatus;
    try {
      const fresh = await refereeService.getAssignedRaceById(raceId);
      const code = normalizeRaceStatusCode(fresh?.status ?? propRaceStatus);
      setRefreshedRace({ raceId: String(raceId), status: code });
      return code;
    } catch {
      return propRaceStatus;
    }
  };

  const loadResultData = useCallback(async () => {
    if (!raceId || !horses.length) return;
    setResultDataLoading(true);
    const localDraft = loadResultsDraft(raceId);
    try {
      const [resultsResult, draftResult, violationsResult] = await Promise.allSettled([
        refereeService.getRaceResults(raceId),
        refereeService.getResultDraft(raceId),
        refereeService.getRaceViolations(raceId),
      ]);
      const results = resultsResult.status === 'fulfilled' && Array.isArray(resultsResult.value)
        ? resultsResult.value
        : [];
      const violations =
        violationsResult.status === 'fulfilled' && Array.isArray(violationsResult.value)
          ? violationsResult.value
          : [];
      setResultViolations(violations);

      let serverDraft = null;
      if (draftResult.status === 'fulfilled') {
        serverDraft = draftResult.value;
        setResultDraft(serverDraft);
        setResultDraftError('');
      } else {
        setResultDraftError(
          getApiErrorMessage(draftResult.reason) ||
          'Không tải được bản nháp kết quả từ backend',
        );
      }

      if (results.length) {
        clearResultsDraft(raceId);
        setRows(buildResultRowsFromHorses(horses, safeStartPositions, {
          results,
          draftRows: serverDraft?.rows,
        }));
      } else if (serverDraft?.rows?.length) {
        clearResultsDraft(raceId);
        setRows(buildResultRowsFromDraft(horses, serverDraft.rows));
      } else if (localDraft?.length && !hasSavedResults && !simulationStatus) {
        setRows(buildResultRowsFromHorses(horses, safeStartPositions, { draftRows: localDraft }));
      } else if (draftResult.status === 'fulfilled') {
        setRows(buildResultRowsFromHorses(horses, safeStartPositions));
      }
    } finally {
      setResultDataLoading(false);
    }
  }, [
    hasSavedResults,
    horses,
    raceId,
    safeStartPositions,
    simulationStatus,
  ]);

  useEffect(() => {
    queueMicrotask(loadResultData);
  }, [loadResultData]);

  useEffect(() => {
    let cancelled = false;
    systemSettingsService.getPublicViolationTypes()
      .then((response) => {
        if (cancelled) return;
        const labels = mapActiveViolationTypeLabels(response);
        if (labels.length) setResultViolationTypes(labels);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const updateRow = (id, patch) => {
    if (!patch || typeof patch !== 'object') return;
    setRows((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, ...patch } : x));
      if ('time' in patch || 'dq' in patch || 'dqReason' in patch) {
        return assignRanksByFinishTime(next);
      }
      return next;
    });
  };

  const toggleDq = (id) => {
    setRows((prev) => {
      const next = prev.map((row) => {
        if (row.id !== id) return row;
        const dq = !row.dq;
        return {
          ...row,
          dq,
          time: dq ? '' : row.time,
          dqReason: dq ? row.dqReason : '',
        };
      });
      return recompactFinishedRanks(next);
    });
  };

  const winner = rows.find((x) => x.position === 1 && !x.dq);
  const displayRows = useMemo(() => sortResultRowsForDisplay(rows), [rows]);

  const applyDraftResponse = (draft) => {
    if (!draft?.rows?.length) return;
    setResultDraft(draft);
    setRows(buildResultRowsFromDraft(horses, draft.rows));
  };

  const openResultViolation = (row, forceDisqualification = false) => {
    const defaultType = resultViolationTypes[0] || FALLBACK_VIOLATION_TYPES[0];
    setViolationRow(row);
    setResultViolationForm({
      ...createViolationDraft(row.startPos || 1, defaultType),
      severity: forceDisqualification ? 'Loại' : 'Phạt nhẹ',
      penalty: forceDisqualification ? 'Loại khỏi cuộc đua' : '',
    });
  };

  const closeResultViolation = () => {
    if (resultViolationForm.evidencePreview) {
      URL.revokeObjectURL(resultViolationForm.evidencePreview);
    }
    setViolationRow(null);
  };

  const submitResultViolation = async () => {
    if (!violationRow) return;
    if (!String(resultViolationForm.description || '').trim()) {
      toast.error('Vui lòng nhập mô tả vi phạm');
      return;
    }
    if (!resultViolationForm.evidenceFile) {
      toast.error('Vui lòng tải lên bằng chứng ảnh hoặc video');
      return;
    }
    if (!isValidTimeOfDay(resultViolationForm.occurredAt)) {
      toast.error('Thời điểm không hợp lệ. Nhập theo định dạng HH:mm:ss');
      return;
    }
    setViolationSubmitting(true);
    try {
      const response = await refereeService.createViolation(
        raceId,
        {
          participantId: violationRow.participantId,
          horseNo: violationRow.startPos,
          horseName: violationRow.horse,
          jockeyName: violationRow.jockey,
          type: resultViolationForm.type,
          severity: resultViolationForm.severity,
          description: resultViolationForm.description.trim(),
          penalty: resultViolationForm.penalty,
          occurredAt: buildViolationTimestamp(resultViolationForm.occurredAt),
        },
        resultViolationForm.evidenceFile,
      );
      applyDraftResponse(response.resultDraft);
      closeResultViolation();
      const violations = await refereeService.getRaceViolations(raceId);
      setResultViolations(violations);
      toast.success('Đã ghi nhận vi phạm và cập nhật kết quả dự kiến');
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không ghi nhận được vi phạm');
    } finally {
      setViolationSubmitting(false);
    }
  };

  const voidResultViolation = async (violationId) => {
    if (!window.confirm('Hủy biên bản vi phạm này và tính lại kết quả?')) return;
    try {
      const response = await refereeService.voidViolation(violationId);
      applyDraftResponse(response.resultDraft);
      setResultViolations((current) =>
        current.filter((violation) => String(violation.id) !== String(violationId)),
      );
      toast.success('Đã hủy biên bản và tính lại kết quả');
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không hủy được biên bản vi phạm');
    }
  };

  const handleFinalize = async () => {
    if (hasSimulationDraft) {
      if (!draftCanReview) {
        toast.error('Bản nháp kết quả hiện không thể công bố');
        return;
      }
      const disqualifiedCount = rows.filter((row) => row.dq).length;
      const penalizedCount = rows.filter((row) => row.penaltyTimeMillis > 0).length;
      const confirmed = window.confirm(
        `Xác nhận & phát hành kết quả chính thức?\n\n` +
        `Ngựa thắng: ${winner?.horse || 'Chưa xác định'}\n` +
        `Ngựa bị cộng thời gian: ${penalizedCount}\n` +
        `Ngựa bị loại: ${disqualifiedCount}\n\n` +
        'Sau khi công bố, kết quả và biên bản vi phạm sẽ bị khóa.',
      );
      if (!confirmed) return;
      setSubmitting(true);
      try {
        await refereeService.finalizeRaceResults(
          raceId,
          null,
          { draftVersion: resultDraft.version },
        );
        await refreshLiveRaceStatus();
        if (onReloadRace) await onReloadRace();
        await loadResultData();
        toast.success('Đã công bố kết quả chính thức');
      } catch (err) {
        toast.error(getApiErrorMessage(err) || 'Không công bố được kết quả');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!rows.length) {
      toast.error('Chưa có ngựa để ghi kết quả');
      return;
    }

    const dqMissingReason = rows.find((r) => r.dq && !String(r.dqReason ?? '').trim());
    if (dqMissingReason) {
      toast.error(`Vui lòng nhập lý do loại cho ${dqMissingReason.horse}`);
      return;
    }

    const invalidTime = rows.find(
      (r) => !r.dq && (!isCompleteRaceTime(r.time) || !isValidRaceTime(r.time)),
    );
    if (invalidTime) {
      toast.error(`Thời gian không hợp lệ cho ${invalidTime.horse} (định dạng MM:SS:CC)`);
      return;
    }

    const missingParticipant = rows.find((row) => !isValidParticipantId(row.participantId ?? row.id))
    if (missingParticipant) {
      toast.error('Thiếu mã ngựa tham gia. Hãy tải lại trang và thử lại.')
      return
    }

    setSubmitting(true);
    try {
      const rankedRows = assignRanksByFinishTime(rows);
      setRows(rankedRows);

      const status = await refreshLiveRaceStatus();

      if (status !== 'ONGOING') {
        toast.error(
          'Cuộc đua chưa bắt đầu. Hãy bấm "Bắt đầu cuộc đua" trước khi nhập hoặc xác nhận kết quả.',
        );
        return;
      }

      const payload = buildRaceFinalizePayload(rankedRows);
      await refereeService.finalizeRaceResults(raceId, payload);
      clearResultsDraft(raceId);
      await refreshLiveRaceStatus();
      if (onReloadRace) await onReloadRace();
      toast.success('Đã xác nhận kết quả chính thức');
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không xác nhận được kết quả');
    } finally {
      setSubmitting(false);
    }
  };

  if (!horses.length) {
    return <div className="text-center py-12 text-white/40 text-sm">Chưa có ngựa để ghi kết quả.</div>;
  }

  return (
    <div className="space-y-5">
      {needsManualStart && (
        <GlassCard className="p-4 flex items-start justify-between gap-4 flex-wrap bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
            <div className="text-xs text-white/70 leading-relaxed">
              Cuộc đua chưa bắt đầu. Bấm <span className="text-[#D4A017] font-semibold">Bắt đầu cuộc đua</span> trước khi ghi kết quả.
            </div>
          </div>
          {onStartRace && (
            <PrimaryButton icon={Play} onClick={onStartRace} disabled={startingRace}>
              {startingRace ? 'Đang bắt đầu...' : 'Bắt đầu cuộc đua'}
            </PrimaryButton>
          )}
        </GlassCard>
      )}

      <RaceSimulationTrack
        raceId={raceId}
        canOperate={canEdit && !hasSavedResults}
        onStateChange={setSimulationStatus}
        onConfirmed={async (response) => {
          if (response?.resultDraft) applyDraftResponse(response.resultDraft);
          await refreshLiveRaceStatus();
          if (onReloadRace) await onReloadRace();
          await loadResultData();
          window.setTimeout(() => {
            resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
      />

      {resultDraftError && simulationStatus && (
        <GlassCard className="p-4 flex items-start justify-between gap-4 flex-wrap bg-gradient-to-r from-red-500/10 to-transparent border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-300 mt-0.5 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-red-200">
                Không tải được bản nháp kết quả
              </div>
              <div className="mt-1 text-xs text-white/55">
                {resultDraftError}. Kết quả chưa được công bố và bảng sẽ không bị chuyển sang chế độ khóa thủ công.
              </div>
            </div>
          </div>
          <GhostButton onClick={loadResultData} disabled={resultDataLoading}>
            {resultDataLoading ? 'Đang tải...' : 'Tải lại bản nháp'}
          </GhostButton>
        </GlassCard>
      )}

      {hasSimulationDraft && !hasSavedResults && (
        <GlassCard className="p-4 flex items-start gap-3 bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30">
          <Info className="w-5 h-5 text-amber-300 mt-0.5 shrink-0" />
          <div className="text-xs text-white/70 leading-relaxed">
            <span className="font-semibold text-amber-300">Chờ trọng tài duyệt — chưa công bố.</span>{' '}
            Kết quả mô phỏng đã được chuyển thành bản nháp.
            Ghi nhận các vi phạm cần thiết, kiểm tra hạng sau xử phạt rồi mới công bố kết quả chính thức.
          </div>
        </GlassCard>
      )}

      {manualCanEdit && (
        <GlassCard className="p-4 flex items-start gap-3 bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/30">
          <Info className="w-5 h-5 text-emerald-300 mt-0.5 shrink-0" />
          <div className="text-xs text-white/70 leading-relaxed">
            Cuộc đua đang <span className="text-emerald-300 font-semibold">Đang diễn ra</span> — bạn có thể ghi và sửa kết quả.
            <span className="block mt-1">
              Nhập thời gian <span className="font-mono text-white/80">MM:SS:CC</span>. Hạng tự xếp theo thời gian (nhanh hơn = hạng cao hơn) khi bấm Lưu. Ngựa bị loại cần ghi lý do.
            </span>
          </div>
        </GlassCard>
      )}

      <div ref={resultCardRef}>
      <GlassCard>
        <div className="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="font-bold text-white">Ghi kết quả · {race?.name}</h3>
              <p className="text-xs text-white/50">
                {rows.length} ngựa
                {winner ? ` · Vô địch dự kiến: ${winner.horse}` : ' · Chưa có vô địch'}
                {hasSimulationDraft
                  ? resultDraft.status === 'PUBLISHED' || hasSavedResults
                    ? ' · Kết quả chính thức'
                    : resultDraft.status === 'PUBLISHING'
                      ? ' · Đang phát hành'
                      : ` · Bản nháp v${resultDraft.version}`
                  : ''}
              </p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <ResultsTable
            rows={displayRows}
            readOnly={hasSimulationDraft ? !draftCanReview : !manualCanEdit}
            onUpdate={manualCanEdit ? updateRow : undefined}
            onToggleDq={manualCanEdit ? toggleDq : undefined}
            simulationDraft={hasSimulationDraft}
            violations={resultViolations}
            onAddViolation={draftCanReview ? openResultViolation : undefined}
            onEditViolation={draftCanReview ? setEditingResultViolation : undefined}
            onVoidViolation={draftCanReview ? voidResultViolation : undefined}
          />
        </div>
        <div className="p-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-[#D4A017]/5 to-transparent">
          <div className="text-xs text-white/60 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            {resultDataLoading
              ? 'Đang tải bản nháp kết quả từ backend...'
              : resultDraftError && simulationStatus
                ? 'Không tải được bản nháp; hãy tải lại trước khi thao tác'
              : hasSimulationDraft && !hasSavedResults
              ? 'Kết quả đang chờ trọng tài duyệt; thời gian mô phỏng gốc không thể sửa'
              : manualCanEdit
              ? 'Có thể ghi/sửa kết quả khi cuộc đua đang diễn ra'
              : hasSavedResults
                ? 'Kết quả chính thức đã khóa và chỉ có thể xem'
              : simulationStatus === 'DRAFTED'
                ? 'Đang khôi phục bản nháp kết quả mô phỏng'
              : simulationStatus
                ? 'Hãy xác nhận kết quả mô phỏng để chuyển xuống bảng Ghi kết quả'
                : liveRaceStatus === 'SCHEDULED' && tournamentStatus !== 'ONGOING'
                  ? 'Vui lòng chờ admin bắt đầu giải trước khi bắt đầu cuộc đua'
                  : 'Phải bắt đầu cuộc đua trước khi ghi kết quả'}
          </div>
          <PrimaryButton
            icon={Send}
            onClick={handleFinalize}
            disabled={
              submitting ||
              resultDataLoading ||
              Boolean(resultDraftError) ||
              (hasSimulationDraft ? !draftCanReview : !manualCanEdit)
            }
          >
            {submitting
              ? 'Đang công bố...'
              : 'Xác nhận & phát hành kết quả'}
          </PrimaryButton>
        </div>
      </GlassCard>
      </div>

      {violationRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={closeResultViolation}
        >
          <div
            className="bg-[#0F1E3A] border border-white/10 rounded-2xl max-w-2xl w-full my-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Ghi vi phạm · {violationRow.horse}</h3>
                <p className="text-xs text-white/50">Hình phạt sẽ được áp dụng theo cấu hình của admin</p>
              </div>
              <button type="button" onClick={closeResultViolation}>
                <XCircle className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Loại vi phạm *">
                <Select
                  value={resultViolationForm.type}
                  onChange={(event) =>
                    setResultViolationForm({ ...resultViolationForm, type: event.target.value })
                  }
                  className="w-full"
                >
                  {resultViolationTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Mức độ *">
                <Select
                  value={resultViolationForm.severity}
                  onChange={(event) =>
                    setResultViolationForm({ ...resultViolationForm, severity: event.target.value })
                  }
                  className="w-full"
                >
                  <option>Cảnh cáo</option>
                  <option>Phạt nhẹ</option>
                  <option>Phạt nặng</option>
                  <option>Loại</option>
                </Select>
              </Field>
              <Field label="Thời điểm *">
                <TextInput
                  value={resultViolationForm.occurredAt}
                  onChange={(event) =>
                    setResultViolationForm({
                      ...resultViolationForm,
                      occurredAt: formatTimeInputValue(event.target.value),
                    })
                  }
                  maxLength={8}
                  placeholder="HH:mm:ss"
                />
              </Field>
              <Field label="Hình phạt ghi chú">
                <TextInput
                  value={resultViolationForm.penalty}
                  onChange={(event) =>
                    setResultViolationForm({ ...resultViolationForm, penalty: event.target.value })
                  }
                  placeholder="Áp dụng theo cấu hình admin"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Mô tả chi tiết *">
                  <textarea
                    rows={3}
                    value={resultViolationForm.description}
                    onChange={(event) =>
                      setResultViolationForm({
                        ...resultViolationForm,
                        description: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A017] resize-none"
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Bằng chứng ảnh/video *">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov"
                    onChange={(event) =>
                      setResultViolationForm({
                        ...resultViolationForm,
                        evidenceFile: event.target.files?.[0] || null,
                      })
                    }
                    className="block w-full text-sm text-white/70 file:mr-4 file:rounded-lg file:border-0 file:bg-[#D4A017] file:px-4 file:py-2 file:font-semibold file:text-black"
                  />
                </Field>
              </div>
            </div>
            <div className="p-5 border-t border-white/10 flex justify-end gap-3">
              <GhostButton onClick={closeResultViolation}>Hủy</GhostButton>
              <PrimaryButton
                icon={AlertTriangle}
                onClick={submitResultViolation}
                disabled={violationSubmitting}
              >
                {violationSubmitting ? 'Đang lưu...' : 'Ghi nhận & áp dụng'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
      <ViolationEditModal
        violation={editingResultViolation}
        onClose={() => setEditingResultViolation(null)}
        onUpdated={loadResultData}
      />
    </div>
  );
}

function ResultsTable({
  rows,
  onUpdate,
  onToggleDq,
  readOnly,
  simulationDraft = false,
  violations = [],
  onAddViolation,
  onEditViolation,
  onVoidViolation,
}) {
  const violationById = new Map(
    (Array.isArray(violations) ? violations : []).map((violation) => [
      String(violation.id),
      violation,
    ]),
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-white/40 border-b border-white/10">
            <th className="px-3 py-3 w-20 text-center">Hạng</th>
            <th className="px-3 py-3">Ngựa</th>
            <th className="px-3 py-3">Chủ ngựa</th>
            <th className="px-3 py-3">Jockey</th>
            <th className="px-3 py-3 w-24 text-center">Vị trí XP</th>
            {simulationDraft ? (
              <>
                <th className="px-3 py-3 w-28">TG gốc</th>
                <th className="px-3 py-3 w-24">Phạt</th>
                <th className="px-3 py-3 w-28">TG cuối</th>
                <th className="px-3 py-3 min-w-[260px]">Vi phạm / xử lý</th>
              </>
            ) : (
              <>
                <th className="px-3 py-3 w-32">Thời gian</th>
                <th className="px-3 py-3 w-20 text-center">Loại</th>
                <th className="px-3 py-3 min-w-[180px]">Lý do loại</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const podium = !r.dq && r.position <= 3;
            const PodiumIcon = r.position === 1 ? Crown : Medal;
            const linkedViolations = (r.violationIds || [])
              .map((id) => violationById.get(String(id)))
              .filter(Boolean);
            const rowViolations = linkedViolations.length
              ? linkedViolations
              : violations.filter(
                  (violation) =>
                    violation.participantId != null &&
                    String(violation.participantId) === String(r.participantId),
                );
            return (
              <tr key={r.id} className={`border-b border-white/5 ${r.dq ? 'opacity-70' : ''}`}>
                <td className="px-3 py-3 text-center">
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold ${
                    r.dq ? 'bg-red-500/15 text-red-300' :
                    r.position === 1 ? 'bg-[#D4A017] text-white' :
                    r.position === 2 ? 'bg-white/20 text-white' :
                    r.position === 3 ? 'bg-orange-500/30 text-orange-200' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {podium && <PodiumIcon className="w-3.5 h-3.5" />}
                    {r.dq ? 'Loại' : (r.position || '—')}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-sm font-semibold text-white">{r.horse}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-sm text-white/70">{r.owner}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-sm text-white/70">{r.jockey}</div>
                </td>
                <td className="px-3 py-3 text-center">
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-lg">
                    <Hash className="w-3 h-3 text-[#D4A017]" />
                    <span className="text-sm font-bold text-[#D4A017]">{r.startPos}</span>
                  </div>
                </td>
                {simulationDraft ? (
                  <>
                    <td className="px-3 py-3 font-mono text-xs text-white/55">{r.baseTime}</td>
                    <td className="px-3 py-3">
                      {r.penaltyTimeMillis > 0 ? (
                        <span className="font-mono text-xs font-semibold text-amber-300">
                          +{(r.penaltyTimeMillis / 1000).toFixed(
                            r.penaltyTimeMillis % 1000 ? 1 : 0,
                          )}s
                        </span>
                      ) : (
                        <span className="text-white/25">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-white">
                      {r.dq ? <Pill tone="red">Loại</Pill> : r.time}
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-2">
                        {rowViolations.map((violation) => (
                          <div
                            key={violation.id}
                            className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-xs font-semibold text-white">
                                {violation.type}
                              </div>
                              <div className="text-[10px] text-white/45">
                                {violation.severity}
                                {violation.resultAction === 'TIME_PENALTY'
                                  ? ` · +${violation.timePenaltyMillis / 1000}s`
                                  : violation.resultAction === 'DISQUALIFY'
                                    ? ' · Loại'
                                    : ''}
                              </div>
                            </div>
                            {!readOnly && onVoidViolation && (
                              <div className="flex items-center gap-1">
                                {onEditViolation && (
                                  <button
                                    type="button"
                                    onClick={() => onEditViolation(violation)}
                                    className="rounded-lg px-2 py-1 text-[10px] text-white/50 hover:bg-white/10 hover:text-white"
                                  >
                                    Sửa
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => onVoidViolation(violation.id)}
                                  className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/15 hover:text-red-300"
                                  title="Hủy biên bản"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        {r.dq && r.dqReason && (
                          <div className="text-[10px] leading-relaxed text-red-300">
                            {r.dqReason}
                          </div>
                        )}
                        {!readOnly && onAddViolation && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => onAddViolation(r, false)}
                              className="rounded-lg border border-[#D4A017]/30 bg-[#D4A017]/10 px-2 py-1 text-[10px] font-semibold text-[#D4A017]"
                            >
                              + Ghi vi phạm
                            </button>
                            {!r.dq && (
                              <button
                                type="button"
                                onClick={() => onAddViolation(r, true)}
                                className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300"
                              >
                                Loại
                              </button>
                            )}
                          </div>
                        )}
                        {!rowViolations.length && readOnly && (
                          <span className="text-xs text-white/25">—</span>
                        )}
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-3">
                      {readOnly || r.dq ? (
                        <span className="font-mono text-sm text-white">{r.dq ? '—' : r.time}</span>
                      ) : (
                        <input
                          value={r.time}
                          onChange={(e) => onUpdate?.(r.id, { time: sanitizeRaceTimeInput(e.target.value) })}
                          onBlur={() => {
                            const formatted = formatRaceTimeOnBlur(r.time);
                            if (formatted) onUpdate?.(r.id, { time: formatted });
                          }}
                          placeholder="MM:SS:CC"
                          className="w-28 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#D4A017]"
                        />
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {readOnly ? (
                        r.dq ? <Pill tone="red">Loại</Pill> : <span className="text-white/30">—</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onToggleDq?.(r.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            r.dq ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-300'
                          }`}
                        >
                          Loại
                        </button>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {readOnly ? (
                        <span className="text-xs text-white/60">{r.dq ? (r.dqReason || '—') : '—'}</span>
                      ) : r.dq ? (
                        <input
                          value={r.dqReason ?? ''}
                          onChange={(e) => onUpdate?.(r.id, { dqReason: e.target.value })}
                          placeholder="VD: Phạm luật xuất phát"
                          className="w-full px-2 py-1.5 bg-white/5 border border-red-500/30 rounded-lg text-white text-xs focus:outline-none focus:border-red-400"
                        />
                      ) : (
                        <span className="text-white/25 text-xs">—</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
