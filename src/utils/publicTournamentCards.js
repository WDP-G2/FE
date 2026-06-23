export async function enrichPublicTournamentCards(tournaments, fetchTournamentById) {
  const list = Array.isArray(tournaments) ? tournaments : []
  if (!list.length || typeof fetchTournamentById !== 'function') return list

  return Promise.all(
    list.map(async (tournament) => {
      if (!tournament?.id) return tournament
      try {
        const response = await fetchTournamentById(tournament.id)
        return response?.data || tournament
      } catch {
        return tournament
      }
    }),
  )
}
