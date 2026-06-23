import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  BarChart3,
  Calendar,
  ChevronRight,
  MapPin,
  Search,
  Trophy,
  User,
  Users,
} from 'lucide-react'
import HomeFeaturedNews from '@/components/news/HomeFeaturedNews'
import { setTournamentBannerFallback, tournamentService } from '@/services/tournamentService'
import { fmtVND } from '@/utils/formatCurrency'
import { formatDisplayDate } from '@/utils/dateFormat'
import { enrichPublicTournamentCards } from '@/utils/publicTournamentCards'

export default function HomePage() {
  const [tournaments, setTournaments] = useState([])
  const [loadingTournaments, setLoadingTournaments] = useState(true)

  useEffect(() => {
    let ignore = false
    tournamentService
      .getPublicTournaments()
      .then(async (response) => {
        const enriched = await enrichPublicTournamentCards(
          response.data || [],
          tournamentService.getPublicTournament,
        )
        if (!ignore) setTournaments(enriched)
      })
      .catch(() => {
        if (!ignore) setTournaments([])
      })
      .finally(() => {
        if (!ignore) setLoadingTournaments(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const upcomingTournaments = useMemo(() => tournaments.slice(0, 3), [tournaments])
  const totalRaces = tournaments.reduce((total, item) => total + Number(item.raceCount || 0), 0)
  const totalRegistrations = tournaments.reduce(
    (total, item) => total + Number(item.registeredHorses || item.registrations || 0),
    0,
  )

  const statistics = [
    { label: 'Tong giai dau', value: tournaments.length, icon: Trophy },
    { label: 'Cuoc dua', value: totalRaces, icon: Award },
    { label: 'Luot dang ky', value: totalRegistrations, icon: Users },
    { label: 'Du lieu API', value: loadingTournaments ? '...' : 'Live', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
      <section className="relative min-h-[78vh] overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt=""
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8F0]/50 via-transparent to-white" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-20 pb-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A017]/30 bg-[#D4A017]/10 px-4 py-2">
              <Trophy className="h-4 w-4 text-[#D4A017]" />
              <span className="text-sm font-semibold text-[#D4A017]">
                Horse racing tournament platform
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-[#1E3A5F] md:text-7xl">
              Trai nghiem giai dua ngua
              <span className="block text-[#D4A017]">chuyen nghiep</span>
            </h1>

            <p className="mb-10 text-xl leading-relaxed text-[#1E3A5F]/70">
              Theo doi giai dau, lich race, ket qua, leaderboard va cac keo dang mo tu du lieu
              backend that.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/tournaments"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-[#D4A017] px-8 py-4 font-semibold text-white shadow-xl shadow-[#D4A017]/30 transition hover:bg-[#B8941F]"
              >
                <Calendar className="h-5 w-5" />
                <span>Xem giai dau</span>
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/register"
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#1E3A5F]/20 bg-white px-8 py-4 font-semibold text-[#1E3A5F] shadow-lg transition hover:border-[#1E3A5F]/40 hover:bg-[#1E3A5F]/5"
              >
                <User className="h-5 w-5" />
                <span>Dang ky tham gia</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Giai dau sap dien ra"
            description="Danh sach nay duoc lay tu public tournament API."
            to="/tournaments"
          />

          {loadingTournaments ? (
            <LoadingCards />
          ) : upcomingTournaments.length === 0 ? (
            <EmptyBand icon={Search} text="Hien chua co giai dau public nao." />
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Bang xep hang ngua"
            description="Se hien thi khi backend expose API ranking tong hop cho spectator."
            to="/rankings"
          />
          <EmptyBand icon={Trophy} text="Chua co API ranking tong hop. Khong hien thi du lieu mock." />
        </div>
      </section>

      <section className="bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-[#1E3A5F]">Thong ke he thong</h2>
            <p className="text-[#1E3A5F]/60">So lieu tong hop tu public tournament API.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statistics.map((stat) => {
              const StatIcon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 transition hover:border-[#D4A017] hover:shadow-xl"
                >
                  <StatIcon className="mb-4 h-12 w-12 text-[#D4A017]" />
                  <div className="mb-2 text-4xl font-bold text-[#1E3A5F]">{stat.value}</div>
                  <div className="text-sm text-[#1E3A5F]/60">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <HomeFeaturedNews />

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-3 inline-block rounded-full border border-[#D4A017]/30 bg-[#D4A017]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#D4A017]">
            About Us
          </span>
          <h2 className="mb-4 text-4xl font-bold text-[#1E3A5F]">Gioi thieu he thong</h2>
          <p className="mx-auto mb-6 max-w-2xl text-[#1E3A5F]/60">
            Nen tang quan ly giai dua ngua: tournament, race schedule, result, wallet va
            spectator betting.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 font-semibold text-[#D4A017] transition hover:text-[#B8941F]"
          >
            <span>Xem chi tiet</span>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ title, description, to }) {
  return (
    <div className="mb-12 flex items-center justify-between">
      <div>
        <h2 className="mb-2 text-4xl font-bold text-[#1E3A5F]">{title}</h2>
        <p className="text-[#1E3A5F]/60">{description}</p>
      </div>
      <Link
        to={to}
        className="hidden items-center gap-2 font-semibold text-[#D4A017] transition hover:text-[#B8941F] md:flex"
      >
        <span>Xem tat ca</span>
        <ChevronRight className="h-5 w-5" />
      </Link>
    </div>
  )
}

function TournamentCard({ tournament }) {
  return (
    <Link
      to={`/spectator/tournaments/${tournament.id}`}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:border-[#D4A017] hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={tournament.banner}
          alt=""
          onError={setTournamentBannerFallback}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute right-4 top-4 rounded-full bg-[#D4A017] px-3 py-1 text-xs font-semibold text-white">
          {tournament.status}
        </span>
      </div>

      <div className="p-6">
        <h3 className="mb-4 text-xl font-bold text-[#1E3A5F] transition group-hover:text-[#D4A017]">
          {tournament.name}
        </h3>
        <div className="mb-6 space-y-3 text-sm text-[#1E3A5F]/60">
          <Meta icon={Calendar} text={`${formatDisplayDate(tournament.startDate)} - ${formatDisplayDate(tournament.endDate)}`} />
          <Meta icon={MapPin} text={tournament.location || tournament.provinceName || 'Chua cap nhat'} />
          <Meta icon={Trophy} text={fmtVND(tournament.prizePool)} />
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm">
          <Meta icon={Users} text={`${tournament.registeredHorses || 0} dang ky`} />
          <span className="font-semibold text-[#D4A017]">Chi tiet</span>
        </div>
      </div>
    </Link>
  )
}

function Meta({ icon: Icon, text }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-[#D4A017]" />
      <span className="truncate">{text}</span>
    </span>
  )
}

function LoadingCards() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-80 animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  )
}

function EmptyBand({ icon: Icon, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#1E3A5F]/15 bg-white p-10 text-center text-[#1E3A5F]/55">
      <Icon className="mx-auto mb-3 h-10 w-10 text-[#D4A017]" />
      <p className="font-semibold">{text}</p>
    </div>
  )
}
