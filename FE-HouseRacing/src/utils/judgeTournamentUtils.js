import { mapTournament } from '@/services/tournamentService'

/** Chỉ giải trạng thái PUBLISHED (Đã công bố) mới được phân công trọng tài. */
export const JUDGE_ELIGIBLE_STATUS_CODE = 'PUBLISHED'

export function isPublishedTournament(tournament) {
  return tournament?.statusCode === JUDGE_ELIGIBLE_STATUS_CODE
}

import { getPublishedAssignmentsForRace } from '@/services/refereeAssignmentService'

export function mapRaceForJudges(race) {
  const published = getPublishedAssignmentsForRace(race.id)
  const judges = published.length
    ? published
    : race.raw?.refereeId
      ? [
          {
            refereeId: String(race.raw.refereeId),
            role: 'Trọng tài chính',
          },
        ]
      : []

  return {
    id: race.id,
    no: race.no,
    name: race.name,
    date: race.date,
    time: race.time,
    status: race.status,
    statusCode: race.statusCode ?? race.raw?.status ?? '',
    judges,
    raw: race.raw,
  }
}

export function mapTournamentForJudges(tournament) {
  if (!tournament) return null

  const mapped =
    typeof tournament.statusCode === 'string' && Array.isArray(tournament.races)
      ? tournament
      : mapTournament(tournament)

  return {
    id: mapped.id,
    name: mapped.name,
    banner: mapped.banner,
    location: mapped.location,
    startDate: mapped.startDate,
    status: mapped.status,
    statusCode: mapped.statusCode,
    raceCount: mapped.raceCount ?? mapped.races?.length ?? 0,
    races: (mapped.races ?? []).map(mapRaceForJudges),
  }
}

export async function loadPublishedJudgeTournaments(tournamentService) {
  const response = await tournamentService.getAdminTournaments()
  const published = response.data.filter(isPublishedTournament)

  const details = await Promise.all(
    published.map(async (summary) => {
      try {
        const detail = await tournamentService.getAdminTournament(summary.id)
        return mapTournamentForJudges(detail.data)
      } catch {
        return mapTournamentForJudges(summary)
      }
    }),
  )

  return details.filter(isPublishedTournament)
}
