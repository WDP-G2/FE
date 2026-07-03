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
import HomeNewsSection from '@/components/news/HomeNewsSection'
import { setTournamentBannerFallback, tournamentService } from '@/services/tournamentService'
import { rankingService } from '@/services/rankingService'
import { fmtVND } from '@/utils/formatCurrency'
import { formatDisplayDate } from '@/utils/dateFormat'
import { enrichPublicTournamentCards } from '@/utils/publicTournamentCards'

export default function HomePage() {
  const [tournaments, setTournaments] = useState([])
  const [loadingTournaments, setLoadingTournaments] = useState(true)
  const [rankings, setRankings] = useState({ horses: [], jockeys: [] })
  const [loadingRankings, setLoadingRankings] = useState(true)

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

  useEffect(() => {
    let ignore = false
    rankingService
      .getRankings(5)
      .then((data) => {
        if (!ignore) {
          setRankings({
            horses: data.horses || [],
            jockeys: data.jockeys || [],
          })
        }
      })
      .catch(() => {
        if (!ignore) setRankings({ horses: [], jockeys: [] })
      })
      .finally(() => {
        if (!ignore) setLoadingRankings(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  const upcomingTournaments = useMemo(() => tournaments.slice(0, 3), [tournaments])
  const topHorseRankings = useMemo(
    () => rankings.horses.slice(0, 3).map(mapHorseRankingPreview),
    [rankings.horses],
  )
  const topJockeyRankings = useMemo(
    () => rankings.jockeys.slice(0, 3).map(mapJockeyRankingPreview),
    [rankings.jockeys],
  )
  const totalRaces = tournaments.reduce((total, item) => total + Number(item.raceCount || 0), 0)
  const totalRegistrations = tournaments.reduce(
    (total, item) => total + Number(item.registeredHorses || item.registrations || 0),
    0,
  )

  const statistics = [
    { label: 'Tổng giải đấu', value: tournaments.length, icon: Trophy },
    { label: 'Cuộc đua', value: totalRaces, icon: Award },
    { label: 'Lượt đăng ký', value: totalRegistrations, icon: Users },
    { label: 'Trạng thái', value: loadingTournaments ? '...' : 'Trực tuyến', icon: BarChart3 },
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
                Nền tảng giải đua ngựa
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-[#1E3A5F] md:text-7xl">
              Trải nghiệm giải đua ngựa
              <span className="block text-[#D4A017]">chuyên nghiệp</span>
            </h1>

            <p className="mb-10 text-xl leading-relaxed text-[#1E3A5F]/70">
              Theo dõi giải đấu, lịch đua, kết quả, bảng xếp hạng và các kèo cược đang mở — cập nhật
              trực tiếp từ hệ thống.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/tournaments"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-[#D4A017] px-8 py-4 font-semibold text-white shadow-xl shadow-[#D4A017]/30 transition hover:bg-[#B8941F]"
              >
                <Calendar className="h-5 w-5" />
                <span>Xem giải đấu</span>
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/register"
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-[#1E3A5F]/20 bg-white px-8 py-4 font-semibold text-[#1E3A5F] shadow-lg transition hover:border-[#1E3A5F]/40 hover:bg-[#1E3A5F]/5"
              >
                <User className="h-5 w-5" />
                <span>Đăng ký tham gia</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Giải đấu sắp diễn ra"
            description="Các giải đấu đang mở đăng ký và sắp tổ chức."
            to="/tournaments"
          />

          {loadingTournaments ? (
            <LoadingCards />
          ) : upcomingTournaments.length === 0 ? (
            <EmptyBand icon={Search} text="Hiện chưa có giải đấu nào." />
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
            title="Bảng xếp hạng"
            description="Top ngựa và nài ngựa có thành tích nổi bật theo kết quả các cuộc đua đã công bố."
            to="/rankings"
          />
          {loadingRankings ? (
            <LoadingRanking />
          ) : topHorseRankings.length === 0 && topJockeyRankings.length === 0 ? (
            <EmptyBand icon={Trophy} text="Chưa có dữ liệu bảng xếp hạng." />
          ) : (
            <RankingPreview
              horseRankings={topHorseRankings}
              jockeyRankings={topJockeyRankings}
            />
          )}
        </div>
      </section>

      <section className="bg-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-[#1E3A5F]">Thống kê hệ thống</h2>
            <p className="text-[#1E3A5F]/60">Số liệu tổng hợp từ các giải đấu trên hệ thống.</p>
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

      <HomeNewsSection />

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-3 inline-block rounded-full border border-[#D4A017]/30 bg-[#D4A017]/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#D4A017]">
            Giới thiệu
          </span>
          <h2 className="mb-4 text-4xl font-bold text-[#1E3A5F]">Giới thiệu hệ thống</h2>
          <p className="mx-auto mb-6 max-w-2xl text-[#1E3A5F]/60">
            Nền tảng quản lý giải đua ngựa: giải đấu, lịch đua, kết quả, ví điện tử và cá cược
            cho khán giả.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 font-semibold text-[#D4A017] transition hover:text-[#B8941F]"
          >
            <span>Xem chi tiết</span>
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
        <span>Xem tất cả</span>
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
          <Meta icon={MapPin} text={tournament.location || tournament.provinceName || 'Chưa cập nhật'} />
          <Meta icon={Trophy} text={fmtVND(tournament.prizePool)} />
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm">
          <Meta icon={Users} text={`${tournament.registeredHorses || 0} đăng ký`} />
          <span className="font-semibold text-[#D4A017]">Chi tiết</span>
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

function LoadingRanking() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {[1, 2].map((item) => (
        <div key={item} className="h-80 animate-pulse rounded-2xl bg-white" />
      ))}
    </div>
  )
}

function RankingPreview({ horseRankings, jockeyRankings }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <RankingGroup
        title="Bảng xếp hạng ngựa"
        description="Những ngựa có thành tích tốt nhất."
        icon={Trophy}
        rankings={horseRankings}
        emptyText="Chưa có dữ liệu xếp hạng ngựa."
      />
      <RankingGroup
        title="Bảng xếp hạng nài ngựa"
        description="Những nài ngựa đang dẫn đầu."
        icon={User}
        rankings={jockeyRankings}
        emptyText="Chưa có dữ liệu xếp hạng nài ngựa."
      />
    </div>
  )
}

function RankingGroup({ title, description, icon: Icon, rankings, emptyText }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h3 className="text-2xl font-bold text-[#1E3A5F]">{title}</h3>
          <p className="mt-1 text-sm text-[#1E3A5F]/55">{description}</p>
        </div>
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4A017]/10 text-[#D4A017]">
          <Icon className="h-6 w-6" />
        </span>
      </div>

      {rankings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#1E3A5F]/15 p-6 text-center font-semibold text-[#1E3A5F]/55">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-3">
          {rankings.map((ranking) => (
            <Link
              key={ranking.key}
              to="/rankings"
              className="group flex items-center gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-[#D4A017] hover:bg-[#FFF8F0]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D4A017]/10 font-bold text-[#D4A017]">
                #{ranking.rank}
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-bold text-[#1E3A5F] transition group-hover:text-[#D4A017]">
                  {ranking.name}
                </h4>
                <p className="truncate text-sm text-[#1E3A5F]/55">{ranking.subtitle}</p>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold text-[#1E3A5F]">{ranking.winCount} thắng</p>
                <p className="font-semibold text-[#D4A017]">
                  {fmtVND(ranking.totalPrizeAmount)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
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

function mapHorseRankingPreview(entry, index) {
  return {
    key: `horse-${entry.horseId ?? index}`,
    rank: entry.rank ?? index + 1,
    name: entry.horseName || `Ngựa #${entry.horseId ?? index + 1}`,
    subtitle: entry.ownerName ? `Chủ ngựa: ${entry.ownerName}` : 'Chưa cập nhật chủ ngựa',
    winCount: Number(entry.winCount || 0),
    totalPrizeAmount: entry.totalPrizeAmount,
  }
}

function mapJockeyRankingPreview(entry, index) {
  return {
    key: `jockey-${entry.jockeyId ?? entry.jockeyUsername ?? index}`,
    rank: entry.rank ?? index + 1,
    name:
      entry.jockeyFullName ||
      entry.jockeyUsername ||
      `Nài ngựa #${entry.jockeyId ?? index + 1}`,
    subtitle:
      entry.jockeyUsername && entry.jockeyFullName
        ? `Tài khoản: ${entry.jockeyUsername}`
        : 'Chưa cập nhật tài khoản',
    winCount: Number(entry.winCount || 0),
    totalPrizeAmount: entry.totalPrizeAmount,
  }
}
