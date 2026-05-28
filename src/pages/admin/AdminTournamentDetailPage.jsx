import { useState } from 'react'
import { useLocation, useParams, useSearchParams } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import Card from '@/components/admin/ui/Card'
import {
  OverviewTab,
  ParticipantsTab,
  RacesTab,
  ResultsTab,
  ScheduleTab,
  SettingsTab,
  TournamentHero,
  detailTabs,
} from '@/components/admin/tournament-detail'
import { detailTournaments } from '@/data/admin/tournamentMocks'
import { getTotalPrize } from '@/components/admin/tournament-detail/utils'

export default function AdminTournamentDetailPage() {
  const { id = '' } = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const createdTournament = location.state?.tournament
  const source =
    createdTournament?.id === id
      ? createdTournament
      : detailTournaments[id] ?? detailTournaments['vietnam-grand-prix-2026']
  const [tournament, setTournament] = useState(source)
  const selectedTab = detailTabs.some((tab) => tab.key === searchParams.get('tab'))
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
      {selectedTab === 'settings' && (
        <SettingsTab tournament={tournament} setTournament={setTournament} />
      )}
    </AdminLayout>
  )
}
