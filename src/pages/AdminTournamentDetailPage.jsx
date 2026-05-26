import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Award,
  BarChart3,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Crown,
  DollarSign,
  FileText,
  Flag,
  Gift,
  Grid3x3,
  Hash,
  Info,
  MapPin,
  Medal,
  Plus,
  Route,
  Save,
  Send,
  Settings,
  Sparkles,
  Timer,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'

const horsePool = [
  { horse: 'Thunder Strike', owner: 'Nguyễn Văn A', jockey: 'Trần Minh' },
  { horse: 'Golden Flash', owner: 'Trần Thị B', jockey: 'Phạm An' },
  { horse: 'Midnight Runner', owner: 'Lê Văn C', jockey: 'Đức Hoàng' },
  { horse: 'Royal Destiny', owner: 'Phạm Thị D', jockey: 'Khánh Linh' },
  { horse: 'Speed Demon', owner: 'Hoàng Văn E', jockey: 'Tuấn Anh' },
  { horse: 'Silver Wind', owner: 'Bùi Thị F', jockey: 'Quốc Bảo' },
  { horse: 'Lucky Storm', owner: 'Đặng Văn G', jockey: 'Minh Quân' },
  { horse: 'Red Arrow', owner: 'Võ Thị H', jockey: 'Hải Nam' },
]

function createRaces(prefix, counts, datePrefix = '2026-06', startDay = 10) {
  return counts.map((registered, index) => {
    const no = index + 1
    const finalName = no === counts.length ? 'Chung kết' : no === counts.length - 1 ? 'Bán kết' : `Vòng loại ${no}`
    return {
      id: `${prefix}-r${no}`,
      no,
      name: finalName,
      description: 'Cuộc đua dành cho ngựa thuần chủng, áp dụng tiêu chuẩn thi đấu quốc tế.',
      date: `${datePrefix}-${String(startDay + index).padStart(2, '0')}`,
      time: no % 2 ? '14:30' : '16:00',
      distance: `${1200 + index * 200}m`,
      track: 'Phú Thọ - Đường đua A',
      surface: no % 2 ? 'Cỏ' : 'Đất',
      category: no === counts.length ? 'Open' : 'Hạng A',
      minHorses: 6,
      maxHorses: 12,
      registered,
      entryFee: 5000000 + index * 1000000,
      deposit: 10000000,
      regDeadline: `${datePrefix}-${String(Math.max(1, startDay - 5 + index)).padStart(2, '0')}`,
      checkIn: '13:00',
      status: no < 3 ? 'Mở đăng ký' : 'Sắp diễn ra',
      prizes: {
        first: no * 100000000,
        second: no * 50000000,
        third: no * 25000000,
        bonus: 10000000,
      },
    }
  })
}

const detailTournaments = {
  'vietnam-grand-prix-2026': {
    id: 'vietnam-grand-prix-2026',
    name: 'Vietnam Grand Prix 2026',
    status: 'Đang mở đăng ký',
    location: 'Sân đua Phú Thọ, TP. HCM',
    startDate: '2026-06-10',
    endDate: '2026-06-20',
    banner:
      'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
    description:
      'Giải đua ngựa lớn nhất Việt Nam năm 2026 với sự tham gia của hơn 100 ngựa thuần chủng từ khắp Đông Nam Á.',
    rules:
      '1. Ngựa phải có giấy chứng nhận sức khỏe hợp lệ.\n2. Jockey phải có chứng chỉ FIA.\n3. Tiền cọc hoàn lại sau khi kết thúc giải.\n4. Kiểm tra doping bắt buộc.',
    races: createRaces('vgp', [8, 7, 7, 7, 7, 6]),
  },
  'saigon-derby-2026': {
    id: 'saigon-derby-2026',
    name: 'Saigon Derby 2026',
    status: 'Đang diễn ra',
    location: 'Sân đua Phú Thọ, TP. HCM',
    startDate: '2026-07-15',
    endDate: '2026-07-22',
    banner:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
    description: 'Giải đấu truyền thống thường niên tại Thành phố Hồ Chí Minh.',
    rules: '1. Theo luật FIA.\n2. Doping check toàn bộ.\n3. Đăng ký trước 7 ngày.',
    races: createRaces('sgd', [8, 8, 8, 8, 8], '2026-07', 15),
  },
  'hanoi-cup-2025': {
    id: 'hanoi-cup-2025',
    name: 'Hanoi Cup 2025',
    status: 'Đã kết thúc',
    location: 'Sân đua Sóc Sơn, Hà Nội',
    startDate: '2025-12-05',
    endDate: '2025-12-15',
    banner:
      'https://images.unsplash.com/photo-1551134084-92ca8eea7cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
    description: 'Giải đua mùa đông tại Hà Nội với tám vòng đua đỉnh cao.',
    rules: '1. Theo luật quốc gia.\n2. Tiền thưởng trả sau khi công bố kết quả.',
    races: createRaces('hnc', [6, 6, 6, 5, 5, 5, 5, 4], '2025-12', 5).map((race) => ({ ...race, status: 'Đã kết thúc' })),
  },
  'spring-classic-2026': {
    id: 'spring-classic-2026',
    name: 'Spring Classic 2026',
    status: 'Nháp',
    location: 'Sân đua Đà Lạt',
    startDate: '2026-03-10',
    endDate: '2026-03-15',
    banner:
      'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
    description: 'Giải đấu đầu xuân dành cho ngựa trẻ và jockey mới.',
    rules: '1. Dành cho ngựa dưới bốn tuổi.\n2. Jockey hạng B trở lên.',
    races: createRaces('spc', [0, 0, 0, 0], '2026-03', 10).map((race) => ({ ...race, status: 'Nháp' })),
  },
}

const tabs = [
  { key: 'overview', label: 'Tổng quan', icon: Info },
  { key: 'races', label: 'Cấu hình cuộc đua', icon: Flag },
  { key: 'participants', label: 'Người tham gia', icon: Users },
  { key: 'schedule', label: 'Lịch thi đấu', icon: CalendarRange },
  { key: 'results', label: 'Kết quả', icon: Award },
  { key: 'stats', label: 'Thống kê', icon: BarChart3 },
  { key: 'settings', label: 'Cài đặt', icon: Settings },
]

export default function AdminTournamentDetailPage() {
  const { id = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const source = detailTournaments[id] ?? detailTournaments['vietnam-grand-prix-2026']
  const [tournament, setTournament] = useState(source)
  const selectedTab = tabs.some((tab) => tab.key === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'overview'
  const totalRegistered = tournament.races.reduce((sum, race) => sum + race.registered, 0)
  const totalPrize = tournament.races.reduce((sum, race) => sum + getTotalPrize(race), 0)

  const changeTab = (tab) => {
    const next = new URLSearchParams(searchParams)
    if (tab === 'overview') next.delete('tab')
    else next.set('tab', tab)
    setSearchParams(next)
  }

  return (
    <AdminLayout showPageHeader={false}>
      <TournamentHero tournament={tournament} totalRegistered={totalRegistered} />

      <Card className="mb-9 flex flex-wrap gap-2 p-3">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => changeTab(tab.key)}
              className={`inline-flex h-14 items-center gap-3 rounded-2xl px-6 text-base font-semibold transition ${
                selectedTab === tab.key
                  ? 'bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/25'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          )
        })}
      </Card>

      {selectedTab === 'overview' && (
        <OverviewTab tournament={tournament} totalPrize={totalPrize} totalRegistered={totalRegistered} />
      )}
      {selectedTab === 'races' && (
        <RacesTab tournament={tournament} setTournament={setTournament} />
      )}
      {selectedTab === 'participants' && <ParticipantsTab tournament={tournament} />}
      {selectedTab === 'schedule' && <ScheduleTab tournament={tournament} />}
      {selectedTab === 'results' && <ResultsTab tournament={tournament} />}
      {selectedTab === 'stats' && (
        <StatisticsTab tournament={tournament} totalPrize={totalPrize} totalRegistered={totalRegistered} />
      )}
      {selectedTab === 'settings' && (
        <SettingsTab tournament={tournament} setTournament={setTournament} />
      )}
    </AdminLayout>
  )
}

function TournamentHero({ tournament, totalRegistered }) {
  return (
    <section className="relative mb-9 min-h-[225px] overflow-hidden rounded-b-3xl border border-t-0 border-white/10">
      <img src={tournament.banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#101c31] via-[#101c31]/80 to-transparent" />
      <div className="relative flex min-h-[225px] flex-col justify-end p-8">
        <div className="mb-5 flex flex-wrap gap-3">
          <Badge tone="gold">{tournament.status}</Badge>
          <Badge tone="gold">
            <Hash className="h-4 w-4" />
            {tournament.id}
          </Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-[42px]">{tournament.name}</h1>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-lg text-white/70">
          <Meta icon={MapPin} text={tournament.location} />
          <Meta icon={CalendarDays} text={`${tournament.startDate} → ${tournament.endDate}`} />
          <Meta icon={Flag} text={`${tournament.races.length} cuộc đua`} />
          <Meta icon={Users} text={`${totalRegistered} đăng ký`} />
        </div>
      </div>
    </section>
  )
}

function OverviewTab({ tournament, totalPrize, totalRegistered }) {
  const progress = [
    { name: 'Tạo giải đấu', done: true },
    { name: 'Cấu hình cuộc đua', done: tournament.races.length > 0 },
    { name: 'Mở đăng ký', done: tournament.status !== 'Nháp' },
    { name: 'Diễn ra', done: tournament.status === 'Đang diễn ra' || tournament.status === 'Đã kết thúc' },
    { name: 'Hoàn tất kết quả', done: tournament.status === 'Đã kết thúc' },
  ]

  return (
    <>
      <div className="mb-9 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flag} tone="gold" value={String(tournament.races.length)} label="Cuộc đua" />
        <StatCard icon={Users} tone="green" value={String(totalRegistered)} label="Đăng ký" />
        <StatCard icon={Trophy} tone="purple" value={formatVnd(totalPrize)} label="Tổng giải thưởng" />
        <StatCard icon={Activity} tone="blue" value={tournament.status} label="Trạng thái" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[2.1fr_1fr]">
        <Card className="p-8">
          <SectionHeading icon={FileText}>Mô tả giải đấu</SectionHeading>
          <p className="mb-10 text-lg leading-8 text-white/70">{tournament.description}</p>
          <SectionHeading icon={FileText}>Luật giải đấu</SectionHeading>
          <pre className="whitespace-pre-wrap rounded-3xl border border-white/10 bg-white/[0.035] p-7 font-sans text-lg leading-8 text-white/70">
            {tournament.rules}
          </pre>
        </Card>
        <Card className="h-fit p-8">
          <SectionHeading icon={Sparkles}>Tiến độ tổ chức</SectionHeading>
          <div className="space-y-5">
            {progress.map((step) => (
              <div key={step.name} className="flex items-center gap-4">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 ${
                    step.done
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-white/15 bg-white/[0.04] text-transparent'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <span className={`text-lg ${step.done ? 'font-semibold text-white' : 'text-white/42'}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

function RacesTab({ tournament, setTournament }) {
  const [selectedId, setSelectedId] = useState(tournament.races[0]?.id)
  const [panel, setPanel] = useState('info')
  const selected = tournament.races.find((race) => race.id === selectedId) ?? tournament.races[0]

  const updateRace = (patch) => {
    setTournament({
      ...tournament,
      races: tournament.races.map((race) => (race.id === selected.id ? { ...race, ...patch } : race)),
    })
  }

  const addRace = () => {
    const no = tournament.races.length + 1
    const race = {
      ...createRaces(tournament.id, [0])[0],
      id: `${tournament.id}-r${no}`,
      no,
      name: `Cuộc đua ${no}`,
      date: tournament.startDate,
      regDeadline: tournament.startDate,
    }
    setTournament({ ...tournament, races: [...tournament.races, race] })
    setSelectedId(race.id)
  }

  const removeRace = () => {
    const nextRaces = tournament.races.filter((race) => race.id !== selected.id)
    setTournament({ ...tournament, races: nextRaces })
    setSelectedId(nextRaces[0]?.id)
  }

  if (!selected) {
    return (
      <Card className="p-16 text-center">
        <Flag className="mx-auto mb-5 h-14 w-14 text-[#dda50e]" />
        <h2 className="mb-3 text-2xl font-bold">Chưa có cuộc đua nào</h2>
        <button type="button" onClick={addRace} className={primaryButton}>
          <Plus className="h-5 w-5" />
          Tạo cuộc đua đầu tiên
        </button>
      </Card>
    )
  }

  return (
    <div className="grid gap-7 xl:grid-cols-[360px_1fr]">
      <Card className="h-fit p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Cuộc đua</h2>
            <p className="text-sm text-white/50">{tournament.races.length} cuộc đua trong giải</p>
          </div>
          <button type="button" onClick={addRace} className={`${primaryButton} h-11 px-4 text-sm`}>
            <Plus className="h-4 w-4" />
            Thêm
          </button>
        </div>
        <div className="space-y-3">
          {tournament.races.map((race) => (
            <button
              type="button"
              key={race.id}
              onClick={() => setSelectedId(race.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                race.id === selected.id
                  ? 'border-[#dda50e] bg-[#dda50e]/15'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="rounded-lg bg-[#dda50e] px-2 py-2 text-xs font-bold">R{race.no}</span>
                  <div className="min-w-0">
                    <div className="truncate font-bold">{race.name}</div>
                    <div className="text-xs text-white/50">{race.date} · {race.time}</div>
                  </div>
                </div>
                <Badge tone={toneForStatus(race.status)}>{race.status}</Badge>
              </div>
              <div className="mb-3 flex justify-between text-xs text-white/55">
                <span>{race.distance}</span>
                <span>{race.registered}/{race.maxHorses} đăng ký</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#dda50e]"
                  style={{ width: `${Math.min(100, (race.registered / race.maxHorses) * 100)}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="rounded-xl bg-[#dda50e] px-4 py-3 font-bold">R{selected.no}</span>
              <div>
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <p className="text-sm text-white/50">
                  {selected.date} · {selected.time} · {selected.distance}
                </p>
              </div>
            </div>
            <button type="button" aria-label="Xóa cuộc đua" onClick={removeRace} className="p-3 text-white/55 hover:text-rose-300">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              ['info', 'Thông tin', Info],
              ['prizes', 'Giải thưởng', Crown],
              ['registrations', 'Đăng ký', Users],
              ['gates', 'Vị trí xuất phát', Grid3x3],
              ['race-results', 'Kết quả', Award],
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPanel(key)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${
                  panel === key
                    ? 'border-[#dda50e]/45 bg-[#dda50e]/15 text-[#dda50e]'
                    : 'border-transparent text-white/55 hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </Card>

        {panel === 'info' && <RaceInfo race={selected} updateRace={updateRace} />}
        {panel === 'prizes' && <RacePrizes race={selected} updateRace={updateRace} />}
        {panel === 'registrations' && <RaceRegistrations race={selected} />}
        {panel === 'gates' && <RaceGates race={selected} />}
        {panel === 'race-results' && <RaceResults race={selected} />}
      </div>
    </div>
  )
}

function RaceInfo({ race, updateRace }) {
  return (
    <Card>
      <PanelHeader icon={Info} title="Thông tin cuộc đua" subtitle="Tên, thời gian, đường đua, lệ phí và giới hạn ngựa" />
      <div className="grid gap-5 p-6 md:grid-cols-2">
        <Field label="Tên cuộc đua">
          <Input value={race.name} onChange={(event) => updateRace({ name: event.target.value })} />
        </Field>
        <Field label="Số thứ tự">
          <Input type="number" value={race.no} onChange={(event) => updateRace({ no: Number(event.target.value) })} />
        </Field>
        <Field label="Mô tả" full>
          <TextArea value={race.description} onChange={(event) => updateRace({ description: event.target.value })} />
        </Field>
        <Field label="Ngày thi đấu">
          <Input type="date" value={race.date} onChange={(event) => updateRace({ date: event.target.value })} />
        </Field>
        <Field label="Giờ thi đấu">
          <Input type="time" value={race.time} onChange={(event) => updateRace({ time: event.target.value })} />
        </Field>
        <Field label="Khoảng cách">
          <Input value={race.distance} onChange={(event) => updateRace({ distance: event.target.value })} />
        </Field>
        <Field label="Đường đua">
          <Input value={race.track} onChange={(event) => updateRace({ track: event.target.value })} />
        </Field>
        <Field label="Mặt sân">
          <Select value={race.surface} onChange={(event) => updateRace({ surface: event.target.value })}>
            <option>Cỏ</option>
            <option>Đất</option>
            <option>Tổng hợp</option>
          </Select>
        </Field>
        <Field label="Hạng đua">
          <Select value={race.category} onChange={(event) => updateRace({ category: event.target.value })}>
            <option>Hạng A</option>
            <option>Hạng B</option>
            <option>Hạng C</option>
            <option>Open</option>
          </Select>
        </Field>
        <Field label="Tối đa ngựa">
          <Input type="number" value={race.maxHorses} onChange={(event) => updateRace({ maxHorses: Number(event.target.value) })} />
        </Field>
        <Field label="Lệ phí đăng ký">
          <Input type="number" value={race.entryFee} onChange={(event) => updateRace({ entryFee: Number(event.target.value) })} />
        </Field>
        <Field label="Trạng thái" full>
          <Select value={race.status} onChange={(event) => updateRace({ status: event.target.value })}>
            <option>Nháp</option>
            <option>Mở đăng ký</option>
            <option>Sắp diễn ra</option>
            <option>Đang đua</option>
            <option>Đã kết thúc</option>
          </Select>
        </Field>
      </div>
      <PanelActions />
    </Card>
  )
}

function RacePrizes({ race, updateRace }) {
  const items = [
    { key: 'first', label: 'Vô địch', icon: Crown, color: 'text-[#dda50e]' },
    { key: 'second', label: 'Á quân', icon: Medal, color: 'text-white' },
    { key: 'third', label: 'Hạng ba', icon: Medal, color: 'text-orange-300' },
    { key: 'bonus', label: 'Thưởng phụ', icon: Gift, color: 'text-emerald-300' },
  ]
  const total = getTotalPrize(race)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_290px]">
      <Card>
        <PanelHeader icon={Crown} title="Cấu hình giải thưởng" subtitle="Mỗi cuộc đua có giải thưởng riêng" />
        <div className="space-y-4 p-6">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.key} className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <Icon className={`h-7 w-7 ${item.color}`} />
                <span className="flex-1 font-semibold">{item.label}</span>
                <Input
                  type="number"
                  className="max-w-52"
                  value={race.prizes[item.key]}
                  onChange={(event) =>
                    updateRace({ prizes: { ...race.prizes, [item.key]: Number(event.target.value) } })
                  }
                />
              </div>
            )
          })}
        </div>
      </Card>
      <Card className="h-fit p-6">
        <h3 className="text-lg font-bold">Tổng giải thưởng</h3>
        <p className="mb-6 mt-2 text-2xl font-bold text-[#dda50e]">{formatVnd(total)}</p>
        {items.map((item) => (
          <div key={item.key} className="mb-3 flex justify-between text-sm text-white/65">
            <span>{item.label}</span>
            <span className="font-semibold text-white">{formatVnd(race.prizes[item.key])}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

function RaceRegistrations({ race }) {
  const registrations = registrationsFor(race)
  return (
    <Card>
      <PanelHeader icon={Users} title="Đăng ký cuộc đua" subtitle={`${registrations.length} hồ sơ đăng ký`} />
      <SimpleTable
        headers={['Ngựa', 'Chủ ngựa', 'Jockey', 'Tiền cọc', 'Duyệt']}
        rows={registrations.map((item) => [
          item.horse,
          item.owner,
          item.jockey,
          <Badge key="d" tone={item.deposit === 'Đã thanh toán' ? 'green' : 'red'}>{item.deposit}</Badge>,
          <Badge key="a" tone={item.approval === 'Đã duyệt' ? 'green' : 'gold'}>{item.approval}</Badge>,
        ])}
      />
    </Card>
  )
}

function RaceGates({ race }) {
  return (
    <Card>
      <PanelHeader icon={Grid3x3} title="Vị trí xuất phát" subtitle="Phân làn các ngựa đã được duyệt" />
      <div className="grid gap-4 p-6 md:grid-cols-2">
        {registrationsFor(race).slice(0, race.maxHorses).map((item, index) => (
          <div key={item.horse} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dda50e] text-xl font-bold">{index + 1}</span>
            <div>
              <p className="font-bold">{item.horse}</p>
              <p className="text-sm text-white/55">{item.jockey}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function RaceResults({ race }) {
  return (
    <Card>
      <PanelHeader icon={Award} title="Nhập kết quả cuộc đua" subtitle="Xếp hạng và công bố thành tích" />
      <SimpleTable
        headers={['Hạng', 'Ngựa', 'Jockey', 'Thời gian', 'Giải thưởng']}
        rows={resultsFor(race).map((item) => [
          `#${item.position}`,
          item.horse,
          item.jockey,
          item.time,
          item.position < 4 ? formatVnd([race.prizes.first, race.prizes.second, race.prizes.third][item.position - 1]) : '—',
        ])}
      />
      <div className="flex justify-end p-6 pt-0">
        <button type="button" className={primaryButton}>
          <Send className="h-5 w-5" />
          Công bố kết quả
        </button>
      </div>
    </Card>
  )
}

function ParticipantsTab({ tournament }) {
  const rows = tournament.races.flatMap((race) =>
    registrationsFor(race).map((person) => [
      `R${race.no} · ${race.name}`,
      person.horse,
      person.owner,
      person.jockey,
      <Badge key="dep" tone={person.deposit === 'Đã thanh toán' ? 'green' : 'red'}>{person.deposit}</Badge>,
      <Badge key="approve" tone={person.approval === 'Đã duyệt' ? 'green' : 'gold'}>{person.approval}</Badge>,
    ]),
  )

  return (
    <Card>
      <PanelHeader icon={Users} title="Tất cả đăng ký trong giải đấu" subtitle="Tổng hợp ngựa đăng ký xuyên suốt các cuộc đua" />
      <SimpleTable headers={['Cuộc đua', 'Ngựa', 'Chủ ngựa', 'Jockey', 'Cọc', 'Trạng thái']} rows={rows} />
    </Card>
  )
}

function ScheduleTab({ tournament }) {
  return (
    <Card>
      <PanelHeader icon={CalendarRange} title="Lịch thi đấu" subtitle="Tất cả cuộc đua theo thứ tự thời gian" />
      <div className="space-y-4 p-6">
        {tournament.races.map((race) => (
          <div key={race.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:flex-row md:items-center">
            <div className="w-28 shrink-0 text-center">
              <div className="text-sm text-white/50">{race.date.slice(5)}</div>
              <div className="text-2xl font-bold text-[#dda50e]">{race.time}</div>
            </div>
            <div className="hidden h-14 w-px bg-white/10 md:block" />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <span className="font-bold text-[#dda50e]">R{race.no}</span>
                <span className="text-lg font-bold">{race.name}</span>
                <Badge tone={toneForStatus(race.status)}>{race.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-white/55">
                <Meta icon={Route} text={race.distance} />
                <Meta icon={MapPin} text={race.track} />
                <Meta icon={Timer} text={`Check-in ${race.checkIn}`} />
              </div>
            </div>
            <Badge tone="purple">{formatVnd(getTotalPrize(race))}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ResultsTab({ tournament }) {
  const [expanded, setExpanded] = useState(tournament.races[0]?.id)

  return (
    <div className="space-y-4">
      {tournament.races.map((race) => {
        const open = expanded === race.id
        const results = resultsFor(race)
        return (
          <Card key={race.id} className="overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(open ? '' : race.id)}
              className="flex w-full items-center gap-5 p-6 text-left transition hover:bg-white/[0.03]"
            >
              <span className="rounded-xl bg-[#dda50e] px-4 py-3 font-bold">R{race.no}</span>
              <span className="flex-1">
                <span className="mb-2 flex items-center gap-3">
                  <span className="text-xl font-bold">{race.name}</span>
                  <Badge tone={toneForStatus(race.status)}>{race.status}</Badge>
                </span>
                <span className="text-sm text-white/55">{race.date} · {race.time} · Quán quân: {results[0].horse}</span>
              </span>
              <span className="font-bold text-[#dda50e]">{formatVnd(getTotalPrize(race))}</span>
              <ArrowRight className={`h-5 w-5 text-white/45 transition ${open ? 'rotate-90' : ''}`} />
            </button>
            {open && (
              <SimpleTable
                headers={['Hạng', 'Ngựa', 'Chủ ngựa', 'Jockey', 'Thời gian', 'Thưởng']}
                rows={results.map((item) => [
                  `#${item.position}`,
                  item.horse,
                  item.owner,
                  item.jockey,
                  item.time,
                  item.position < 4 ? formatVnd([race.prizes.first, race.prizes.second, race.prizes.third][item.position - 1]) : '—',
                ])}
              />
            )}
          </Card>
        )
      })}
    </div>
  )
}

function StatisticsTab({ tournament, totalPrize, totalRegistered }) {
  const maxRegistered = Math.max(...tournament.races.map((race) => race.registered))
  const maxPrize = Math.max(...tournament.races.map((race) => getTotalPrize(race)))
  const revenue = tournament.races.reduce((sum, race) => sum + race.entryFee * race.registered, 0)

  return (
    <>
      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Flag} tone="gold" value={String(tournament.races.length)} label="Cuộc đua" />
        <StatCard icon={Users} tone="green" value={String(totalRegistered)} label="Tổng đăng ký" />
        <StatCard icon={DollarSign} tone="blue" value={formatVnd(revenue)} label="Doanh thu lệ phí" />
        <StatCard icon={Trophy} tone="purple" value={formatVnd(totalPrize)} label="Tổng thưởng" />
      </div>
      <div className="grid gap-7 lg:grid-cols-2">
        <Card className="p-7">
          <SectionHeading icon={Users}>Đăng ký theo cuộc đua</SectionHeading>
          <BarSummary
            items={tournament.races.map((race) => ({ label: `R${race.no}`, value: race.registered }))}
            max={maxRegistered}
          />
        </Card>
        <Card className="p-7">
          <SectionHeading icon={TrendingUp}>Giải thưởng theo cuộc đua</SectionHeading>
          <BarSummary
            items={tournament.races.map((race) => ({ label: `R${race.no}`, value: getTotalPrize(race) }))}
            max={maxPrize}
            format={formatVnd}
          />
        </Card>
      </div>
    </>
  )
}

function SettingsTab({ tournament, setTournament }) {
  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
      <Card>
        <PanelHeader icon={Settings} title="Cài đặt giải đấu" subtitle="Thông tin chung và trạng thái" />
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="Tên giải đấu" full>
            <Input value={tournament.name} onChange={(event) => setTournament({ ...tournament, name: event.target.value })} />
          </Field>
          <Field label="Địa điểm" full>
            <Input value={tournament.location} onChange={(event) => setTournament({ ...tournament, location: event.target.value })} />
          </Field>
          <Field label="Ngày bắt đầu">
            <Input type="date" value={tournament.startDate} onChange={(event) => setTournament({ ...tournament, startDate: event.target.value })} />
          </Field>
          <Field label="Ngày kết thúc">
            <Input type="date" value={tournament.endDate} onChange={(event) => setTournament({ ...tournament, endDate: event.target.value })} />
          </Field>
          <Field label="Trạng thái" full>
            <Select value={tournament.status} onChange={(event) => setTournament({ ...tournament, status: event.target.value })}>
              <option>Nháp</option>
              <option>Đang mở đăng ký</option>
              <option>Đang diễn ra</option>
              <option>Đã kết thúc</option>
            </Select>
          </Field>
        </div>
        <PanelActions />
      </Card>
      <Card className="h-fit border-rose-400/25 bg-rose-400/[0.07] p-6">
        <h3 className="mb-2 text-xl font-bold">Vùng nguy hiểm</h3>
        <p className="mb-5 text-sm text-white/55">Hành động không thể hoàn tác.</p>
        <button type="button" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 font-semibold text-rose-300">
          <Trash2 className="h-5 w-5" />
          Xóa giải đấu
        </button>
      </Card>
    </div>
  )
}

const primaryButton =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#dda50e] px-6 py-3 font-semibold text-white shadow-lg shadow-[#d4a017]/20 transition hover:bg-[#c8940f]'

function Card({ children, className = '' }) {
  return <div className={`rounded-3xl border border-white/10 bg-white/[0.045] ${className}`}>{children}</div>
}

function Badge({ children, tone = 'gray' }) {
  const tones = {
    gold: 'border-[#dda50e]/40 bg-[#dda50e]/15 text-[#efbb2c]',
    green: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-300',
    blue: 'border-sky-400/35 bg-sky-500/15 text-sky-300',
    purple: 'border-purple-400/35 bg-purple-500/15 text-purple-300',
    red: 'border-rose-400/35 bg-rose-500/15 text-rose-300',
    gray: 'border-white/15 bg-white/10 text-white/65',
  }
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

function StatCard({ icon: Icon, tone, value, label }) {
  const tones = {
    gold: 'bg-[#dda50e]/15 text-[#dda50e]',
    green: 'bg-emerald-500/15 text-emerald-300',
    blue: 'bg-sky-500/15 text-sky-300',
    purple: 'bg-purple-500/15 text-purple-300',
  }
  return (
    <Card className="p-7">
      <span className={`mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 ${tones[tone]}`}>
        <Icon className="h-8 w-8" />
      </span>
      <p className="truncate text-3xl font-bold">{value}</p>
      <p className="mt-3 text-base text-white/50">{label}</p>
    </Card>
  )
}

function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Icon className="h-6 w-6 text-[#dda50e]" />
      <h2 className="text-2xl font-bold">{children}</h2>
    </div>
  )
}

function PanelHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 border-b border-white/10 p-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dda50e]/15 text-[#dda50e]">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-white/50">{subtitle}</p>
      </div>
    </div>
  )
}

function PanelActions() {
  return (
    <div className="flex justify-end gap-3 p-6 pt-0">
      <button type="button" className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-white/70">
        Hủy
      </button>
      <button type="button" className={primaryButton}>
        <Save className="h-5 w-5" />
        Lưu thay đổi
      </button>
    </div>
  )
}

function Field({ label, children, full = false }) {
  return (
    <label className={full ? 'md:col-span-2' : ''}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">{label}</span>
      {children}
    </label>
  )
}

function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none focus:border-[#dda50e]/65 ${className}`}
    />
  )
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="h-12 w-full rounded-xl border border-white/10 bg-[#17243a] px-4 text-white outline-none focus:border-[#dda50e]/65"
    >
      {children}
    </select>
  )
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-4 text-white outline-none focus:border-[#dda50e]/65"
    />
  )
}

function SimpleTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
            {headers.map((header) => <th key={header} className="px-6 py-4">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-white/5 text-sm text-white/70 last:border-0">
              {row.map((item, itemIndex) => (
                <td key={itemIndex} className="px-6 py-4 first:font-semibold first:text-white">{item}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BarSummary({ items, max, format = (value) => value }) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold">{item.label}</span>
            <span className="text-white/55">{format(item.value)}</span>
          </div>
          <div className="h-4 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#dda50e]" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Meta({ icon: Icon, text }) {
  return (
    <span className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-[#dda50e]" />
      {text}
    </span>
  )
}

function registrationsFor(race) {
  return Array.from({ length: race.registered }, (_, index) => {
    const member = horsePool[index % horsePool.length]
    return {
      ...member,
      deposit: index % 5 === 4 ? 'Chưa thanh toán' : 'Đã thanh toán',
      approval: index % 4 === 3 ? 'Chờ duyệt' : 'Đã duyệt',
    }
  })
}

function resultsFor(race) {
  return registrationsFor(race).map((member, index) => ({
    ...member,
    position: index + 1,
    time: `01:${String(12 + index).padStart(2, '0')}.${String(24 + index * 3).padStart(2, '0')}`,
  }))
}

function getTotalPrize(race) {
  return race.prizes.first + race.prizes.second + race.prizes.third + race.prizes.bonus
}

function formatVnd(value) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`
}

function toneForStatus(status) {
  if (status.includes('mở') || status.includes('Mở')) return 'gold'
  if (status.includes('diễn') || status.includes('đua')) return 'green'
  if (status.includes('kết thúc')) return 'purple'
  return 'blue'
}
