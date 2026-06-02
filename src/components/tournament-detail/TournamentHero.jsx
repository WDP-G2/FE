import { CalendarDays, Flag, Hash, MapPin, Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Meta } from '@/components/ui/Panel'

export default function TournamentHero({ tournament, totalRegistered }) {
  return (
    <section className="relative mb-9 min-h-[225px] overflow-hidden rounded-b-3xl border border-t-0 border-white/10">
      <img src={tournament.banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#101c31] via-[#101c31]/80 to-transparent" />
      <div className="relative flex min-h-[225px] flex-col justify-end p-8">
        <div className="mb-5 flex flex-wrap gap-3">
          <Badge tone="gold">{tournament.status}</Badge>
          <Badge tone="gold">
            <Hash className="h-4 w-4" />
            {tournament.id}
          </Badge>
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-[42px]">{tournament.name}</h1>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-lg text-white/70">
          <Meta icon={MapPin} text={tournament.location} />
          <Meta icon={CalendarDays} text={`${tournament.startDate} → ${tournament.endDate}`} />
          <Meta icon={Flag} text={`${tournament.races.length} cuộc đua`} />
          <Meta icon={Users} text={`${totalRegistered} đăng ký`} />
        </div>
      </div>
    </section>
  )
}
