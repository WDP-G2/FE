import { useEffect, useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import Card from '@/components/ui/Card'
import {
  OverviewTab,
  ParticipantsTab,
  RacesTab,
  ResultsTab,
  ScheduleTab,
  SettingsTab,
  TournamentHero,
  detailTabs,
} from '@/components/tournament-detail'
import { getTotalPrize } from '@/components/tournament-detail/utils'
import { tournamentService } from '@/services/tournamentService'

export default function AdminTournamentDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const createdTournament = location.state?.tournament
  const [tournament, setTournament] = useState(createdTournament?.id === id ? createdTournament : null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const selectedTab = detailTabs.some((tab) => tab.key === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'overview'

  useEffect(() => {
    let cancelled = false

    async function loadTournament() {
      try {
        setLoading(true)
        setError('')
        const response = await tournamentService.getAdminTournament(id)
        if (!cancelled) setTournament(response.data)
      } catch (requestError) {
        if (!cancelled) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              'Không thể tải chi tiết giải đấu.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadTournament()

    return () => {
      cancelled = true
    }
  }, [id])

  const changeTab = (tab) => {
    const next = new URLSearchParams(searchParams)
    if (tab === 'overview') next.delete('tab')
    else next.set('tab', tab)
    setSearchParams(next)
  }

  if (loading) {
    return (
      <AdminLayout showPageHeader={false}>
        <Card className="mt-10 p-16 text-center text-white/55">Đang tải chi tiết giải đấu...</Card>
      </AdminLayout>
    )
  }

  if (error || !tournament) {
    return (
      <AdminLayout showPageHeader={false}>
        <Card className="mt-10 p-16 text-center text-red-200">
          <Trophy className="mx-auto mb-4 h-12 w-12" />
          {error || 'Không tìm thấy giải đấu.'}
        </Card>
      </AdminLayout>
    )
  }

  const totalRegistered = tournament.races.reduce((sum, race) => sum + Number(race.registered ?? 0), 0)
  const totalPrize = tournament.races.reduce((sum, race) => sum + getTotalPrize(race), 0)

  return (
    <AdminLayout showPageHeader={false}>
      <TournamentHero tournament={tournament} totalRegistered={totalRegistered} />

      <Card className="mb-9 flex flex-wrap gap-2 p-3">
        {detailTabs.map((tab) => {
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
      {selectedTab === 'races' && <RacesTab tournament={tournament} setTournament={setTournament} />}
      {selectedTab === 'participants' && <ParticipantsTab tournament={tournament} />}
      {selectedTab === 'schedule' && <ScheduleTab tournament={tournament} />}
      {selectedTab === 'results' && <ResultsTab tournament={tournament} />}
      {selectedTab === 'settings' && <SettingsTab tournament={tournament} setTournament={setTournament} />}
    </AdminLayout>
  )
}
