import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CircleDollarSign, ListOrdered, Trophy } from 'lucide-react'
import { TournamentPublicDetailContent } from '@/components/tournament-detail'
import { spectatorService } from '@/services/spectatorService'
import { fmtVND } from '@/utils/formatCurrency'
import { formatDisplayDateTime } from '@/utils/dateFormat'
import { buildRankedResultRows } from '@/services/raceResultService'
import { EmptyState, ErrorState, LoadingState, Panel } from './spectatorUi'

export default function SpectatorTournamentDetail() {
  const { id } = useParams()
  const [tournament, setTournament] = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)
  const [resultsByRaceId, setResultsByRaceId] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDetail = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await spectatorService.getTournament(id)
      const currentTournament = response.data
      setTournament(currentTournament)

      const [leaderboardData, resultEntries] = await Promise.all([
        spectatorService.getTournamentLeaderboard(id).catch(() => null),
        Promise.all(
          (currentTournament?.races || []).map((race) =>
            spectatorService
              .getRaceResults(race.id)
              .then((results) => [race.id, results])
              .catch(() => [race.id, []]),
          ),
        ),
      ])

      setLeaderboard(leaderboardData)
      setResultsByRaceId(Object.fromEntries(resultEntries))
    } catch (err) {
      setError(err?.message || 'Không tải được chi tiết giải đấu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <LoadingState label="Đang tải chi tiết giải đấu..." />
  if (error) return <ErrorState message={error} onRetry={loadDetail} />
  if (!tournament) return <ErrorState message="Không tìm thấy giải đấu" />

  const leaderboardEntries = Array.isArray(leaderboard?.entries) ? leaderboard.entries : []

  return (
    <div className="space-y-6">
      <TournamentPublicDetailContent tournament={tournament} backTo="/spectator/tournaments" />

      <section className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <Panel title="Kết quả cuộc đua">
          <div className="space-y-4">
            {tournament.races.length === 0 ? (
              <EmptyState>Chưa có cuộc đua nào được công bố.</EmptyState>
            ) : (
              tournament.races.map((race) => {
                const rows = buildRankedResultRows(resultsByRaceId[race.id] || [])
                return (
                  <div key={race.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
                    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h4 className="font-black text-white">{race.name}</h4>
                        <p className="text-xs text-white/45">{formatDisplayDateTime(race.scheduledStartAt)}</p>
                      </div>
                      <Link
                        to={`/spectator/betting?raceId=${race.id}`}
                        className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/10 px-3 py-2 text-xs font-black text-[#D4A017] hover:bg-[#D4A017]/15"
                      >
                        <CircleDollarSign className="h-4 w-4" />
                        Xem kèo cược
                      </Link>
                    </div>
                    {rows.length === 0 ? (
                      <EmptyState>Chưa có kết quả công bố cho cuộc đua này.</EmptyState>
                    ) : (
                      <div className="space-y-2">
                        {rows.slice(0, 5).map((row) => (
                          <div
                            key={row.id || row.participantId}
                            className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2 text-sm"
                          >
                            <span className="font-bold text-white">#{row.rank} {row.horse}</span>
                            <span className="text-white/55">{row.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Panel>

        <Panel title="Bảng xếp hạng">
          {leaderboardEntries.length === 0 ? (
            <EmptyState>Chưa có bảng xếp hạng được chốt.</EmptyState>
          ) : (
            <div className="space-y-3">
              {leaderboardEntries.slice(0, 10).map((entry, index) => (
                <div
                  key={entry.id || `${entry.raceId}-${entry.participantId}`}
                  className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {index < 3 ? (
                          <Trophy className="h-4 w-4 shrink-0 text-[#D4A017]" />
                        ) : (
                          <ListOrdered className="h-4 w-4 shrink-0 text-white/35" />
                        )}
                        <span className="truncate font-black text-white">
                          #{entry.raceRank || index + 1} {entry.horseName || 'Ngựa chưa cập nhật'}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-white/45">
                        {entry.raceName} · {entry.jockeyUsername || 'Jockey chưa cập nhật'}
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-black text-[#D4A017]">
                      {fmtVND(entry.prizeAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <Link
        to="/spectator/tournaments"
        className="inline-flex items-center gap-2 text-sm font-bold text-white/55 hover:text-[#D4A017]"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </Link>
    </div>
  )
}
