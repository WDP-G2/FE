import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ChevronDown,
  Flag,
  LayoutGrid,
  List,
  MapPin,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'

const tournaments = [
  {
    id: 'vietnam-grand-prix-2026',
    name: 'Vietnam Grand Prix 2026',
    status: 'Đang mở đăng ký',
    location: 'Sân đua Phú Thọ, TP. HCM',
    startDate: '2026-06-10',
    raceCount: 6,
    registrations: 42,
    banner:
      'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  },
  {
    id: 'saigon-derby-2026',
    name: 'Saigon Derby 2026',
    status: 'Đang diễn ra',
    location: 'Sân đua Phú Thọ, TP. HCM',
    startDate: '2026-07-15',
    raceCount: 5,
    registrations: 40,
    banner:
      'https://images.unsplash.com/photo-1568605114967-8130f3a36994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  },
  {
    id: 'hanoi-cup-2025',
    name: 'Hanoi Cup 2025',
    status: 'Đã kết thúc',
    location: 'Sân đua Sóc Sơn, Hà Nội',
    startDate: '2025-12-05',
    raceCount: 8,
    registrations: 42,
    banner:
      'https://images.unsplash.com/photo-1551134084-92ca8eea7cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  },
  {
    id: 'spring-classic-2026',
    name: 'Spring Classic 2026',
    status: 'Nháp',
    location: 'Sân đua Đà Lạt',
    startDate: '2026-03-10',
    raceCount: 4,
    registrations: 36,
    banner:
      'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900',
  },
]

const statusTabs = ['Tất cả', 'Nháp', 'Đang mở đăng ký', 'Đang diễn ra', 'Đã kết thúc']

export default function AdminTournamentsPage() {
  const [status, setStatus] = useState('Tất cả')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [view, setView] = useState('grid')

  const counts = useMemo(
    () =>
      statusTabs.reduce((result, tab) => {
        result[tab] =
          tab === 'Tất cả'
            ? tournaments.length
            : tournaments.filter((tournament) => tournament.status === tab).length
        return result
      }, {}),
    [],
  )

  const visibleTournaments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi')
    const filtered = tournaments.filter(
      (tournament) =>
        (status === 'Tất cả' || tournament.status === status) &&
        (!normalizedQuery ||
          `${tournament.name} ${tournament.location}`
            .toLocaleLowerCase('vi')
            .includes(normalizedQuery)),
    )

    return filtered.toSorted((first, second) => {
      if (sortBy === 'name') return first.name.localeCompare(second.name, 'vi')
      const order = sortBy === 'oldest' ? 1 : -1
      return order * first.startDate.localeCompare(second.startDate)
    })
  }, [query, sortBy, status])

  return (
    <AdminLayout
      heading="Quản lý"
      highlight="Giải đấu"
      subtitle="Tạo, cấu hình và theo dõi các giải đua ngựa"
      action={
        <Link
          to="/admin/tournaments/new"
          className="inline-flex h-16 items-center gap-3 rounded-2xl bg-[#dda50e] px-9 text-lg font-semibold shadow-xl shadow-[#d4a017]/25 transition hover:bg-[#c8940f]"
        >
          <Plus className="h-5 w-5" />
          Tạo giải đấu
        </Link>
      }
    >
      <section className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
        <div className="flex flex-wrap gap-3 border-b border-white/10 px-7 py-7">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatus(tab)}
              className={`inline-flex h-14 items-center gap-4 rounded-2xl px-7 font-semibold transition ${
                status === tab
                  ? 'bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/30'
                  : 'bg-white/[0.06] text-white/60 hover:text-white'
              }`}
            >
              {tab}
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  status === tab ? 'bg-white/20' : 'bg-white/10'
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5 px-7 py-7 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Tìm giải đấu</span>
            <Search className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-white/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên hoặc địa điểm..."
              className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-16 pr-5 text-lg text-white outline-none placeholder:text-white/35 focus:border-[#dda50e]/60"
            />
          </label>

          <label className="relative lg:w-64">
            <span className="sr-only">Sắp xếp giải đấu</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-16 w-full appearance-none rounded-2xl border border-white/10 bg-[#162338] px-7 pr-14 text-lg font-semibold text-white outline-none focus:border-[#dda50e]/60"
            >
              <option value="latest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Theo tên</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
          </label>

          <div className="flex h-16 rounded-2xl border border-white/10 bg-white/[0.04] p-2">
            <ViewButton label="Dạng thẻ" active={view === 'grid'} onClick={() => setView('grid')}>
              <LayoutGrid className="h-6 w-6" />
            </ViewButton>
            <ViewButton label="Dạng danh sách" active={view === 'list'} onClick={() => setView('list')}>
              <List className="h-6 w-6" />
            </ViewButton>
          </div>
        </div>
      </section>

      {visibleTournaments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center text-white/45">
          <Trophy className="mx-auto mb-4 h-12 w-12" />
          Không có giải đấu nào phù hợp.
        </div>
      ) : view === 'grid' ? (
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {visibleTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      ) : (
        <TournamentTable tournaments={visibleTournaments} />
      )}
    </AdminLayout>
  )
}

function ViewButton({ active, children, label, onClick }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-12 w-14 items-center justify-center rounded-xl transition ${
        active ? 'bg-[#dda50e] text-white' : 'text-white/55 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function StatusBadge({ status }) {
  const tones = {
    'Đang mở đăng ký': 'border-[#dda50e]/40 bg-[#dda50e]/15 text-[#efbb2c]',
    'Đang diễn ra': 'border-emerald-400/35 bg-emerald-500/15 text-emerald-300',
    'Đã kết thúc': 'border-purple-400/35 bg-purple-500/15 text-purple-300',
    Nháp: 'border-white/20 bg-white/10 text-white/65',
  }

  return (
    <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${tones[status]}`}>
      {status}
    </span>
  )
}

function TournamentCard({ tournament }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
      <div className="relative h-60 overflow-hidden">
        <img src={tournament.banner} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111d32] via-transparent to-transparent" />
        <div className="absolute left-5 top-5">
          <StatusBadge status={tournament.status} />
        </div>
        <h2 className="absolute bottom-5 left-5 right-5 truncate text-2xl font-bold">{tournament.name}</h2>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-b border-white/10 pb-6 text-base text-white/60">
          <CardMeta icon={MapPin} text={tournament.location} />
          <CardMeta icon={CalendarDays} text={tournament.startDate} />
          <CardMeta icon={Flag} text={`${tournament.raceCount} cuộc đua`} />
          <CardMeta icon={Users} text={`${tournament.registrations} đăng ký`} />
        </div>

        <div className="mt-5 flex items-center gap-4">
          <Link
            to={`/admin/tournaments/${tournament.id}`}
            className="inline-flex h-14 flex-1 items-center justify-center gap-3 rounded-2xl bg-[#dda50e] font-semibold shadow-lg shadow-[#d4a017]/20 transition hover:bg-[#c8940f]"
          >
            <Settings className="h-5 w-5" />
            Quản lý
          </Link>
          <ActionButton label="Chỉnh sửa">
            <Pencil className="h-5 w-5" />
          </ActionButton>
          <ActionButton label="Xóa giải đấu">
            <Trash2 className="h-5 w-5" />
          </ActionButton>
        </div>
      </div>
    </article>
  )
}

function TournamentTable({ tournaments: rows }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-white/10 text-left text-sm uppercase tracking-wider text-white/45">
            <tr>
              <th className="px-7 py-5">Giải đấu</th>
              <th className="px-7 py-5">Địa điểm</th>
              <th className="px-7 py-5">Ngày bắt đầu</th>
              <th className="px-7 py-5">Số cuộc đua</th>
              <th className="px-7 py-5">Trạng thái</th>
              <th className="px-7 py-5">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((tournament) => (
              <tr key={tournament.id} className="border-b border-white/5 text-white/70 last:border-0">
                <td className="px-7 py-5 font-semibold text-white">{tournament.name}</td>
                <td className="px-7 py-5">{tournament.location}</td>
                <td className="px-7 py-5">{tournament.startDate}</td>
                <td className="px-7 py-5">{tournament.raceCount}</td>
                <td className="px-7 py-5">
                  <StatusBadge status={tournament.status} />
                </td>
                <td className="px-7 py-5">
                  <Link className="font-semibold text-[#dda50e]" to={`/admin/tournaments/${tournament.id}`}>
                    Quản lý
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CardMeta({ icon: Icon, text }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Icon className="h-5 w-5 shrink-0 text-[#dda50e]" />
      <span className="truncate">{text}</span>
    </span>
  )
}

function ActionButton({ children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="rounded-xl p-3 text-white/60 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  )
}
