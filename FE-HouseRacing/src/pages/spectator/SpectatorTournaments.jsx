import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Search, Trophy, Users } from 'lucide-react'
import { spectatorService } from '@/services/spectatorService'
import { fmtVND } from '@/utils/formatCurrency'
import { formatDisplayDate } from '@/utils/dateFormat'
import { setTournamentBannerFallback } from '@/services/tournamentService'
import { enrichPublicTournamentCards } from '@/utils/publicTournamentCards'
import { EmptyState, ErrorState, LoadingState } from './spectatorUi'

export default function SpectatorTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTournaments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await spectatorService.getTournaments()
      setTournaments(
        await enrichPublicTournamentCards(response.data || [], spectatorService.getTournament),
      )
    } catch (err) {
      setError(err?.message || 'Không tải được danh sách giải đấu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTournaments()
  }, [])

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return tournaments
    return tournaments.filter((tournament) =>
      [tournament.name, tournament.location, tournament.status, tournament.provinceName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword)),
    )
  }, [query, tournaments])

  if (loading) return <LoadingState label="Đang tải giải đấu..." />
  if (error) return <ErrorState message={error} onRetry={loadTournaments} />

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#D4A017]">Giải đấu</p>
          <h2 className="text-3xl font-black text-white">Giải đấu đang công bố</h2>
        </div>
        <label className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, địa điểm, trạng thái"
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-10 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-[#D4A017]/50"
          />
        </label>
      </section>

      {filtered.length === 0 ? (
        <EmptyState>Không có giải đấu phù hợp.</EmptyState>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </section>
      )}
    </div>
  )
}

function TournamentCard({ tournament }) {
  return (
    <Link
      to={`/spectator/tournaments/${tournament.id}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition hover:border-[#D4A017]/45 hover:bg-white/[0.07]"
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={tournament.banner}
          alt=""
          onError={setTournamentBannerFallback}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/45 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-[#D4A017]/35 bg-[#D4A017]/15 px-3 py-1 text-xs font-black text-[#D4A017]">
          {tournament.status}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <h3 className="line-clamp-2 text-lg font-black text-white group-hover:text-[#D4A017]">
          {tournament.name || 'Giải đấu'}
        </h3>
        <div className="space-y-2 text-sm text-white/55">
          <Meta icon={Calendar} text={`${formatDisplayDate(tournament.startDate)} - ${formatDisplayDate(tournament.endDate)}`} />
          <Meta icon={MapPin} text={tournament.location || tournament.provinceName || 'Chưa cập nhật địa điểm'} />
          <Meta icon={Users} text={`${tournament.registeredHorses || 0}/${tournament.maxHorses || 0} đăng ký`} />
          <Meta icon={Trophy} text={fmtVND(tournament.prizePool)} />
        </div>
      </div>
    </Link>
  )
}

function Meta({ icon: Icon, text }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-[#D4A017]" />
      <span className="truncate">{text}</span>
    </div>
  )
}
