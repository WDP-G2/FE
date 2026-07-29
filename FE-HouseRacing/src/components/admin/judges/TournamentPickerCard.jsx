import { Calendar, Flag, MapPin } from 'lucide-react'
import { GlassCard, Pill } from '@/pages/admin/AdminLayout'
import { judgeStatusTone } from '@/data/adminJudgeMock'

export default function TournamentPickerCard({ tournament, onSelect }) {
  const races = tournament.races ?? []
  const raceTotal = races.length || tournament.raceCount || 0

  return (
    <button type="button" onClick={() => onSelect(tournament.id)} className="group text-left">
      <GlassCard className="h-full overflow-hidden transition-all group-hover:border-[#D4A017]/50 group-hover:shadow-lg group-hover:shadow-[#D4A017]/10">
        <div className="relative h-32">
          <img
            src={tournament.banner}
            alt={tournament.name}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null
              event.currentTarget.src =
                'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1628] via-[#0A1628]/50 to-transparent" />
          <div className="absolute left-3 top-3">
            <Pill tone={judgeStatusTone(tournament.status)}>{tournament.status}</Pill>
          </div>
        </div>
        <div className="p-5">
          <h3 className="mb-1 font-bold text-white transition-colors group-hover:text-[#D4A017]">
            {tournament.name}
          </h3>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-[#D4A017]" />
              {tournament.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#D4A017]" />
              {tournament.startDate}
            </span>
            <span className="flex items-center gap-1">
              <Flag className="h-3.5 w-3.5 text-[#D4A017]" />
              {raceTotal} cuộc đua
            </span>
          </div>
        </div>
      </GlassCard>
    </button>
  )
}
