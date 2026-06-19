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
  AlertOctagon,
  Upload,
  Camera,
  FileText,
  Plus,
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
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, Pill, PrimaryButton, GhostButton, TextInput, Select } from '@/pages/admin/AdminLayout';
import { useAuthStore } from '@/store/authStore';
import { refereeService } from '@/services/refereeService';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  checkinTone,
  canRefereeCheckIn,
  getRefereeCheckInBlockedMessage,
  findHorseByGate,
  getAssignedGate,
  mapParticipantFromApi,
  parseFinishTimeToMillis,
  raceStatusTone,
  randomizeGateMap,
  REFEREE_CHECK_IN_STATUSES,
  fetchRaceRules,
  parseRulesLines,
  severityTone,
  updateGateMap,
} from '@/utils/refereeRaceUtils';
import { useRefereeRaces } from './useRefereeRaces';
// TODO: Tích hợp API Violations sau
import { addViolation, useRefereeViolations } from './refereeViolationsMock';
import { buildEvidenceStorageKey, saveEvidenceFile } from './violationEvidenceStore';
import { ViolationEvidencePreviewModal, ViolationEvidenceThumbnail } from './ViolationEvidencePreview';


const TABS = [
  { k: 'overview', label: 'Tổng quan', icon: Info },
  { k: 'management', label: 'Quản lý cuộc đua', icon: LayoutGrid },
];

const MGMT_TABS = [
  { k: 'positions', label: 'Vị trí xuất phát', icon: Hash, desc: 'Phân chia cổng xuất phát' },
  { k: 'checkin', label: 'Check-in ngựa', icon: ClipboardCheck, desc: 'Xác nhận có mặt & điều kiện' },
  { k: 'violations', label: 'Vi phạm', icon: AlertTriangle, desc: 'Ghi nhận & theo dõi vi phạm' },
  { k: 'results', label: 'Ghi kết quả', icon: Award, desc: 'Nhập thứ hạng & thời gian' },
];

export function RefereeRaceDetail() {
  const { pathname } = useLocation();
  const id = pathname.split('/').filter(Boolean)[2];
  const navigate = useNavigate();
  const { races, loading: racesLoading, error: racesError } = useRefereeRaces();
  const race = races.find((r) => String(r.id) === String(id));
  const [tab, setTab] = useState('overview');
  const [mgmtTab, setMgmtTab] = useState('positions');
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

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

  useEffect(() => {
    if (race) loadParticipants();
  }, [race, loadParticipants]);

  const goManagement = (sub) => {
    setTab('management');
    setMgmtTab(sub);
  };

  if (racesLoading) {
    return (
      <RefereeLayout title="Đang tải..." subtitle="Cuộc đua được phân công">
        <div className="text-center py-20 text-white/50 text-sm">Đang tải thông tin cuộc đua...</div>
      </RefereeLayout>
    );
  }

  if (!race) {
    return (
      <RefereeLayout title="Không tìm thấy" subtitle="Race không tồn tại hoặc bạn không được phân công">
        <div className="text-center py-20 text-white/50">
          <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Race ID "{id}" không có trong danh sách của bạn.</p>
          <button onClick={() => navigate('/referee/races')} className="mt-4 text-[#D4A017] hover:underline">
            ← Quay lại danh sách race
          </button>
        </div>
      </RefereeLayout>
    );
  }

  return (
    <RefereeLayout
      title={`Race · ${race.name}`}
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
                  <Pill tone={raceStatusTone(race.status)}>{race.statusLabel}</Pill>
                  <span className="text-[11px] text-white/40 font-mono">{race.id}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{race.name}</h2>
                <p className="text-sm text-[#D4A017]/80 mt-0.5">{race.tournamentName}</p>
              </div>
            </div>
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

      {tab === 'overview' && <OverviewTab race={race} participants={participants} goManagement={goManagement} />}
      {tab === 'management' && (
        <RaceManagementTab
          race={race}
          participants={participants}
          participantsLoading={participantsLoading}
          onReloadParticipants={loadParticipants}
          activeTab={mgmtTab}
          setActiveTab={setMgmtTab}
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
  const checkedInCount = participants.filter((p) => p.status === 'CHECKED_IN').length;
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
              title="Vị trí xuất phát"
              status="active"
              sub="Phân chia cổng cho từng ngựa"
              onClick={() => goManagement('positions')}
            />
            <StepCard
              n={2}
              title="Check-in ngựa"
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
            <h3 className="font-bold text-white">Luật race áp dụng</h3>
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
}) {
  const horses = useMemo(() => (Array.isArray(participants) ? participants : []), [participants]);
  const horseSignature = useMemo(
    () => horses.map((horse) => `${horse.id}:${horse.gateNumber ?? ''}`).join('|'),
    [horses],
  );

  const [startPositions, setStartPositions] = useState({});

  useEffect(() => {
    setStartPositions((previous) => {
      const next = { ...previous }
      let changed = false

      horses.forEach((horse, index) => {
        const key = String(horse.id)
        const fromApi = horse.gateNumber ?? index + 1
        if (next[key] == null) {
          next[key] = fromApi
          changed = true
        }
      })

      Object.keys(next).forEach((key) => {
        if (!horses.some((horse) => String(horse.id) === key)) {
          delete next[key]
          changed = true
        }
      })

      return changed ? next : previous
    })
  }, [horseSignature, horses])

  const activeInfo = MGMT_TABS.find((t) => t.k === activeTab);

  useEffect(() => {
    if (activeTab === 'results' || activeTab === 'positions') {
      onReloadParticipants?.();
    }
  }, [activeTab, onReloadParticipants]);

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
          horses={horses}
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
        <ResultsTab raceId={race.id} race={race} horses={horses} startPositions={startPositions} />
      )}
    </div>
  );
}

/* ---------------- Vị trí xuất phát ---------------- */
function StartingPositionsTab({
  race,
  horses,
  positions,
  setPositions,
  loading,
  onReload,
}) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const horseList = Array.isArray(horses) ? horses : []
  const gateCount = horseList.length

  const setPos = (horseId, value) => {
    setSaved(false)
    setPositions((previous) => updateGateMap(previous, horseId, value, horseList))
  }

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
    return <div className="text-center py-12 text-white/40 text-sm">Chưa có ngựa tham gia cuộc đua.</div>
  }

  return (
    <div className="space-y-5">
      <GlassCard className="p-4 flex items-start gap-3 bg-gradient-to-r from-[#D4A017]/10 to-transparent border-[#D4A017]/30">
        <Info className="w-5 h-5 text-[#D4A017] mt-0.5 shrink-0" />
        <div className="text-xs text-white/70 leading-relaxed">
          Phân chia số cổng xuất phát cho từng ngựa. Vị trí xuất phát sẽ được sử dụng trong bảng ghi kết quả.
          Có thể nhập thủ công hoặc <span className="text-[#D4A017] font-semibold">bốc thăm ngẫu nhiên</span>.
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
              <p className="text-xs text-white/50">{horseList.length} ngựa · {horseList.length} cổng xuất phát</p>
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
                    <input
                      type="number"
                      min={1}
                      max={gateCount}
                      value={assignedGate}
                      onChange={(event) => setPos(horse.id, event.target.value)}
                      className="w-20 px-3 py-1.5 bg-[#D4A017]/10 border border-[#D4A017]/40 rounded-lg text-[#D4A017] text-sm font-bold text-center focus:outline-none focus:border-[#D4A017] focus:bg-[#D4A017]/20"
                    />
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
  const [noteFor, setNoteFor] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [noteStatus, setNoteStatus] = useState('CHECKED_IN');
  const [submittingId, setSubmittingId] = useState(null);
  const checkInEnabled = canRefereeCheckIn(race?.status);
  const blockedMessage = getRefereeCheckInBlockedMessage(race?.status, race?.statusLabel);

  useEffect(() => {
    if (!noteFor) return;
    const horse = horses.find((h) => h.id === noteFor);
    if (REFEREE_CHECK_IN_STATUSES.includes(horse?.status)) {
      setNoteStatus(horse.status);
    } else {
      setNoteStatus('CHECKED_IN');
    }
    setNoteText(horse?.note ?? '');
  }, [noteFor, horses]);

  const applyCheckIn = async (horse, status) => {
    if (!checkInEnabled) {
      toast.error(blockedMessage);
      return;
    }
    setSubmittingId(horse.id);
    try {
      await refereeService.checkInParticipant(raceId, horse.participantId, {
        status,
        note: horse.note || undefined,
      });
      toast.success('Đã cập nhật trạng thái check-in');
      await onReload?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không cập nhật được check-in');
    } finally {
      setSubmittingId(null);
    }
  };

  const saveNoteAndStatus = async (horseId, status, note) => {
    if (!checkInEnabled) {
      toast.error(blockedMessage);
      return;
    }
    if (!REFEREE_CHECK_IN_STATUSES.includes(status)) {
      toast.error('Chọn trạng thái check-in hợp lệ trước khi lưu ghi chú');
      return;
    }
    const horse = horses.find((h) => h.id === horseId);
    if (!horse) return;
    setSubmittingId(horseId);
    try {
      await refereeService.checkInParticipant(raceId, horse.participantId, {
        status,
        note: note || undefined,
      });
      toast.success('Đã lưu ghi chú');
      setNoteFor(null);
      await onReload?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không lưu được ghi chú');
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

  const filtered = horses.filter((h) => filter === 'all' || h.status === filter);
  const counts = {
    CHECKED_IN: horses.filter((h) => h.status === 'CHECKED_IN').length,
    REGISTERED: horses.filter((h) => h.status === 'REGISTERED').length,
    ABSENT: horses.filter((h) => h.status === 'ABSENT').length,
    DISQUALIFIED: horses.filter((h) => h.status === 'DISQUALIFIED').length,
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <CountTile label="Đã check-in" v={counts.CHECKED_IN} total={horses.length} tone="green" icon={CheckCircle2} />
        <CountTile label="Chờ" v={counts.REGISTERED} total={horses.length} tone="gold" icon={Clock} />
        <CountTile label="Vắng mặt" v={counts.ABSENT} total={horses.length} tone="gray" icon={Ban} />
        <CountTile label="Loại / không đủ ĐK" v={counts.DISQUALIFIED} total={horses.length} tone="purple" icon={AlertOctagon} />
      </div>

      <GlassCard>
        <div className="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="font-bold text-white">Bảng check-in</h3>
              <p className="text-xs text-white/50">{counts.CHECKED_IN}/{horses.length} ngựa đã check-in · {pct}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">Tất cả</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="REGISTERED">Chờ</option>
              <option value="ABSENT">Vắng mặt</option>
              <option value="DISQUALIFIED">Loại</option>
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
                <th className="px-4 py-3 text-center">Check-in</th>
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
                    {h.note && <div className="text-[10px] text-[#D4A017] mt-0.5 italic line-clamp-1">"{h.note}"</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/70">{h.owner}</td>
                  <td className="px-4 py-3 text-sm text-white/70">{h.jockey}</td>
                  <td className="px-4 py-3 text-center">
                    <Pill tone={checkinTone(h.status)}>{h.checkIn}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <ActionBtn
                        tone="green"
                        icon={CheckCircle2}
                        active={h.status === 'CHECKED_IN'}
                        title="Có mặt"
                        disabled={!checkInEnabled || submittingId === h.id}
                        onClick={() => applyCheckIn(h, 'CHECKED_IN')}
                      />
                      <ActionBtn
                        tone="gray"
                        icon={Ban}
                        active={h.status === 'ABSENT'}
                        title="Vắng mặt"
                        disabled={!checkInEnabled || submittingId === h.id}
                        onClick={() => applyCheckIn(h, 'ABSENT')}
                      />
                      <ActionBtn
                        tone="purple"
                        icon={AlertOctagon}
                        active={h.status === 'DISQUALIFIED'}
                        title="Loại / không đủ ĐK"
                        disabled={!checkInEnabled || submittingId === h.id}
                        onClick={() => applyCheckIn(h, 'DISQUALIFIED')}
                      />
                      <button
                        onClick={() => {
                          if (!checkInEnabled) {
                            toast.error(blockedMessage);
                            return;
                          }
                          setNoteFor(h.id);
                        }}
                        disabled={!checkInEnabled}
                        className="p-2 text-white/60 hover:text-[#D4A017] hover:bg-[#D4A017]/10 rounded-lg disabled:cursor-not-allowed disabled:opacity-40"
                        title="Ghi chú"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {noteFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setNoteFor(null)}>
          <div className="bg-[#0F1E3A] border border-white/10 rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-[#D4A017]" />
              <h3 className="font-bold text-white">Ghi chú trọng tài</h3>
            </div>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ghi chú nội bộ về ngựa này..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A017] resize-none"
            />
            {noteFor && !REFEREE_CHECK_IN_STATUSES.includes(horses.find((h) => h.id === noteFor)?.status) && (
              <div className="mt-3">
                <label className="mb-1.5 block text-xs font-semibold text-white/50">Trạng thái khi lưu ghi chú</label>
                <Select value={noteStatus} onChange={(e) => setNoteStatus(e.target.value)}>
                  <option value="CHECKED_IN">Có mặt</option>
                  <option value="ABSENT">Vắng mặt</option>
                  <option value="DISQUALIFIED">Loại / không đủ ĐK</option>
                </Select>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <GhostButton onClick={() => setNoteFor(null)}>Hủy</GhostButton>
              <PrimaryButton
                icon={Save}
                onClick={() => {
                  saveNoteAndStatus(noteFor, noteStatus, noteText);
                }}
              >
                Lưu
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CountTile({ label, v, total, tone, icon: Icon }) {
  const map = {
    green: 'from-emerald-500/25 to-emerald-500/5 text-emerald-300',
    gold: 'from-[#D4A017]/25 to-[#D4A017]/5 text-[#D4A017]',
    gray: 'from-white/15 to-white/5 text-white/60',
    purple: 'from-purple-500/25 to-purple-500/5 text-purple-300',
    red: 'from-red-500/25 to-red-500/5 text-red-300',
  };
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${map[tone]} border border-white/10 flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-[10px] text-white/40 font-mono">/{total}</span>
      </div>
      <div className="text-2xl font-bold text-white">{v}</div>
      <div className="text-[11px] text-white/50 mt-0.5">{label}</div>
    </GlassCard>
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
// TODO: Tích hợp API Violations sau
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

function buildViolationTimestamp(timeOfDay) {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  const datePart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  return `${datePart} ${timeOfDay}`
}

function ViolationsTab({ raceId, raceName, horses }) {
  const user = useAuthStore((s) => s.user);
  const refereeName = user?.fullName || user?.username || 'Trọng tài';
  const horseList = Array.isArray(horses) ? horses : [];
  const allViolations = useRefereeViolations();
  const list = allViolations.filter((v) => String(v.raceId) === String(raceId));
  const [open, setOpen] = useState(false);
  const evidenceInputRef = useRef(null);
  const [form, setForm] = useState({
    horseNo: 1,
    type: 'Lái nguy hiểm',
    severity: 'Phạt nhẹ',
    description: '',
    penalty: '',
    occurredAt: formatTimeOfDay(),
    evidenceFile: null,
    evidencePreview: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [previewEvidence, setPreviewEvidence] = useState(null);

  const openModal = () => {
    setForm({
      horseNo: horseList[0]?.no ?? 1,
      type: 'Lái nguy hiểm',
      severity: 'Phạt nhẹ',
      description: '',
      penalty: '',
      occurredAt: formatTimeOfDay(),
      evidenceFile: null,
      evidencePreview: '',
    });
    setOpen(true);
  };

  const resetEvidencePreview = (previewUrl) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const closeModal = () => {
    resetEvidencePreview(form.evidencePreview);
    setOpen(false);
    setForm({
      horseNo: horseList[0]?.no ?? 1,
      type: 'Lái nguy hiểm',
      severity: 'Phạt nhẹ',
      description: '',
      penalty: '',
      occurredAt: formatTimeOfDay(),
      evidenceFile: null,
      evidencePreview: '',
    });
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
      const violationId = `V-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
      const storageKey = buildEvidenceStorageKey(violationId, form.evidenceFile.name);
      await saveEvidenceFile(storageKey, form.evidenceFile);

      const v = {
        id: violationId,
        raceId,
        raceName,
        horseNo: h.no,
        horse: h.horse,
        jockey: h.jockey,
        type: form.type,
        severity: form.severity,
        description: form.description || '(không có mô tả)',
        penalty: form.penalty || 'Cảnh cáo',
        evidence: [{
          name: form.evidenceFile.name,
          size: formatEvidenceSize(form.evidenceFile.size),
          storageKey,
          mimeType: form.evidenceFile.type,
        }],
        timestamp: buildViolationTimestamp(form.occurredAt),
        reporter: refereeName,
      };
      addViolation(v);
      closeModal();
      toast.success('Đã ghi nhận vi phạm');
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
              <h3 className="font-bold text-white">Vi phạm trong race · {raceName}</h3>
              <p className="text-xs text-white/50">{list.length} vi phạm đã ghi nhận</p>
            </div>
          </div>
          <PrimaryButton icon={Plus} onClick={openModal}>
            Ghi nhận vi phạm
          </PrimaryButton>
        </div>

        <div className="p-5 space-y-3">
          {list.length === 0 && (
            <div className="text-center py-12 text-white/40 text-sm">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Chưa có vi phạm nào được ghi nhận trong race này.
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
                    <div className="text-[11px] text-[#D4A017] font-mono">{v.id} · {v.timestamp}</div>
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
                <Gavel className="w-3 h-3" /> Ghi bởi {v.reporter}
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
                  <option>Xuất phát sai</option>
                  <option>Lái nguy hiểm</option>
                  <option>Vi phạm trang bị</option>
                  <option>Nghi doping</option>
                  <option>Check-in muộn</option>
                  <option>Khác</option>
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
                    placeholder="VD: Trừ 3 giây thành tích · Loại khỏi race · Cấm 3 tháng..."
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
}) {
  const user = useAuthStore((s) => s.user);
  const refereeName = user?.fullName || user?.username || 'Trọng tài';
  const horses = Array.isArray(horsesProp) ? horsesProp : [];
  const safeStartPositions =
    startPositions && typeof startPositions === 'object' && !Array.isArray(startPositions)
      ? startPositions
      : {}
  const [confirmed, setConfirmed] = useState(race?.status === 'RESULT_CONFIRMED')
  const [notes, setNotes] = useState('')
  const [rows, setRows] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!horses.length) {
      setRows([])
      return
    }

    setRows((previous) => {
      const previousById = new Map(previous.map((row) => [String(row.id), row]))

      return horses.map((horse, index) => {
        const existing = previousById.get(String(horse.id))
        const startPos = getAssignedGate(horse, safeStartPositions)

        if (existing) {
          return {
            ...existing,
            participantId: horse.participantId,
            horse: horse.horse,
            owner: horse.owner,
            jockey: horse.jockey,
            startPos,
          }
        }

        return {
          id: horse.id,
          participantId: horse.participantId,
          horse: horse.horse,
          owner: horse.owner,
          jockey: horse.jockey,
          startPos,
          position: index + 1,
          time: '',
          penalty: '',
          dq: false,
        }
      })
    })
  }, [raceId, horses, startPositions])

  const updateRow = (id, patch) => {
    if (!patch || typeof patch !== 'object') return
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  }

  const sortByPos = () =>
    setRows((rs) => {
      const sorted = [...rs].sort((a, b) => {
        if (a.dq && !b.dq) return 1;
        if (!a.dq && b.dq) return -1;
        return a.position - b.position;
      });
      return sorted.map((x, i) => ({ ...x, position: x.dq ? rs.length : i + 1 }));
    });

  const winner = rows.find((x) => x.position === 1 && !x.dq);

  const handleFinalize = async () => {
    if (!rows.length) {
      toast.error('Chưa có ngựa để ghi kết quả');
      return;
    }
    const invalid = rows.find((r) => !r.dq && !String(r.time).trim());
    if (invalid) {
      toast.error('Vui lòng nhập thời gian cho tất cả ngựa chưa bị loại');
      return;
    }

    setSubmitting(true);
    try {
      const results = rows.map((r) => ({
        participantId: r.participantId,
        rank: r.dq ? rows.length : r.position,
        finishTimeMillis: r.dq ? 0 : parseFinishTimeToMillis(r.time),
        status: r.dq ? 'DISQUALIFIED' : 'FINISHED',
        note: [r.penalty, notes].filter(Boolean).join(' · ') || undefined,
      }));
      await refereeService.finalizeRaceResults(raceId, results);
      setConfirmed(true);
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

  if (confirmed) {
    return (
      <GlassCard>
        <div className="p-6 bg-gradient-to-br from-emerald-500/20 to-transparent border-b border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Kết quả chính thức đã được xác nhận</h3>
                <p className="text-xs text-white/60">Ký bởi {refereeName} · Phát hành cho tournament và người dùng</p>
              </div>
            </div>
            <GhostButton icon={FileText} onClick={() => setConfirmed(false)}>Sửa lại</GhostButton>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {[1, 2, 3].map((p) => {
              const r = rows.find((x) => x.position === p && !x.dq);
              if (!r) return null;
              const Icon = p === 1 ? Crown : Medal;
              const tone = p === 1 ? 'gold' : p === 2 ? 'gray' : 'purple';
              const bg = p === 1 ? 'from-[#D4A017]/20' : p === 2 ? 'from-white/10' : 'from-orange-500/15';
              return (
                <div key={p} className={`p-4 bg-gradient-to-br ${bg} to-transparent border border-white/10 rounded-2xl`}>
                  <Icon className={`w-5 h-5 mb-2 ${p === 1 ? 'text-[#D4A017]' : p === 2 ? 'text-white/60' : 'text-orange-300'}`} />
                  <div className="text-[10px] uppercase tracking-wider text-white/40">Hạng {p}</div>
                  <div className="text-lg font-bold text-white mt-1">{r.horse}</div>
                  <div className="text-xs text-white/60">{r.jockey} · {r.time}</div>
                  <div className="text-[11px] text-white/50 mt-1">Chủ ngựa: {r.owner}</div>
                  <div className="mt-2">
                    <Pill tone={tone}>Cổng {r.startPos}</Pill>
                  </div>
                </div>
              );
            })}
          </div>
          <ResultsTable rows={rows} readOnly />
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-5">
      <GlassCard className="p-4 flex items-start gap-3 bg-gradient-to-r from-[#D4A017]/10 to-transparent border-[#D4A017]/30">
        <Info className="w-5 h-5 text-[#D4A017] mt-0.5 shrink-0" />
        <div className="text-xs text-white/70 leading-relaxed">
          Nhập thứ hạng & thời gian từng ngựa, đánh dấu DQ cho ngựa bị loại, kèm hình phạt nếu có. Vị trí xuất phát được lấy từ
          mục <span className="text-[#D4A017] font-semibold">Vị trí xuất phát</span>. Khi xác nhận, kết quả sẽ được{' '}
          <span className="text-[#D4A017] font-semibold">khóa và phát hành chính thức</span>.
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-[#D4A017]" />
            </div>
            <div>
              <h3 className="font-bold text-white">Ghi kết quả · {race?.name}</h3>
              <p className="text-xs text-white/50">{rows.length} ngựa · {winner ? `Vô địch dự kiến: ${winner.horse}` : 'Chưa có vô địch'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GhostButton icon={Activity} onClick={sortByPos}>Sắp xếp theo hạng</GhostButton>
            <GhostButton icon={Save}>Lưu nháp</GhostButton>
          </div>
        </div>
        <div className="p-5">
          <ResultsTable
            rows={rows}
            onUpdate={updateRow}
          />
          <div className="mt-5">
            <label className="block text-xs uppercase tracking-wider text-white/60 font-semibold mb-2">Ghi chú race</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tóm tắt diễn biến race, điều kiện sân, sự cố đặc biệt..."
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A017] resize-none"
            />
          </div>
        </div>
        <div className="p-5 border-t border-white/10 flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-[#D4A017]/5 to-transparent">
          <div className="text-xs text-white/60 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Sau khi xác nhận, kết quả sẽ được phát hành · có thể sửa lại nếu cần trước khi ký chính thức
          </div>
          <PrimaryButton icon={Send} onClick={handleFinalize} disabled={submitting}>
            {submitting ? 'Đang xác nhận...' : 'Xác nhận & phát hành kết quả'}
          </PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}

function ResultsTable({
  rows,
  onUpdate,
  readOnly,
}) {
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
            <th className="px-3 py-3 w-32">Thời gian</th>
            <th className="px-3 py-3 w-40">Hình phạt</th>
            <th className="px-3 py-3 w-20 text-center">Loại</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const podium = !r.dq && r.position <= 3;
            const PodiumIcon = r.position === 1 ? Crown : Medal;
            return (
              <tr key={r.id} className={`border-b border-white/5 ${r.dq ? 'opacity-50' : ''}`}>
                <td className="px-3 py-3 text-center">
                  {readOnly ? (
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold ${
                      r.dq ? 'bg-red-500/15 text-red-300' :
                      r.position === 1 ? 'bg-[#D4A017] text-white' :
                      r.position === 2 ? 'bg-white/20 text-white' :
                      r.position === 3 ? 'bg-orange-500/30 text-orange-200' :
                      'bg-white/10 text-white/70'
                    }`}>
                      {podium && <PodiumIcon className="w-3.5 h-3.5" />}
                      {r.dq ? 'Loại' : r.position}
                    </div>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      max={rows.length}
                      value={r.position}
                      onChange={(e) => onUpdate?.(r.id, { position: Number(e.target.value) })}
                      className="w-14 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm font-bold text-center focus:outline-none focus:border-[#D4A017]"
                    />
                  )}
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
                <td className="px-3 py-3">
                  {readOnly ? (
                    <span className="font-mono text-sm text-white">{r.dq ? '—' : r.time}</span>
                  ) : (
                    <input
                      value={r.time}
                      onChange={(e) => onUpdate?.(r.id, { time: e.target.value })}
                      className="w-28 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-[#D4A017]"
                    />
                  )}
                </td>
                <td className="px-3 py-3">
                  {readOnly ? (
                    <span className="text-xs text-white/60">{r.penalty || '—'}</span>
                  ) : (
                    <input
                      value={r.penalty}
                      onChange={(e) => onUpdate?.(r.id, { penalty: e.target.value })}
                      placeholder="VD: -2s · Cảnh cáo"
                      className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-[#D4A017]"
                    />
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  {readOnly ? (
                    r.dq ? <Pill tone="red">Loại</Pill> : <span className="text-white/30">—</span>
                  ) : (
                    <button
                      onClick={() => onUpdate?.(r.id, { dq: !r.dq })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        r.dq ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-300'
                      }`}
                    >
                      Loại
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
