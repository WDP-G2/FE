import { RaceSimulationTrack } from './RaceSimulationTrack'

export function TournamentRaceSimulations({ races = [] }) {
  if (!Array.isArray(races) || races.length === 0) return null
  return (
    <section className="mt-6 space-y-4">
      <div>
        <h2 className="text-lg font-black text-white">Mô phỏng các cuộc đua</h2>
        <p className="mt-1 text-xs text-white/45">Diễn biến được đồng bộ từ kết quả do backend sinh.</p>
      </div>
      {races.map((race) => (
        <div key={race.id} className="space-y-2">
          <h3 className="text-sm font-black text-white/70">{race.name}</h3>
          <RaceSimulationTrack raceId={race.id} />
        </div>
      ))}
    </section>
  )
}
