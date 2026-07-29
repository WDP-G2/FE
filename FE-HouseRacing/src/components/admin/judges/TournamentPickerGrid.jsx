import TournamentPickerCard from './TournamentPickerCard'

export default function TournamentPickerGrid({ tournaments, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {tournaments.map((tournament) => (
        <TournamentPickerCard key={tournament.id} tournament={tournament} onSelect={onSelect} />
      ))}
    </div>
  )
}
