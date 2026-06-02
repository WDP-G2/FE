import Card from './Card'

const tones = {
  gold: 'bg-[#dda50e]/15 text-[#dda50e]',
  green: 'bg-emerald-500/15 text-emerald-300',
  blue: 'bg-sky-500/15 text-sky-300',
  purple: 'bg-purple-500/15 text-purple-300',
}

export default function StatCard({ icon: Icon, tone, value, label }) {
  return (
    <Card className="p-7">
      <span
        className={`mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 ${tones[tone]}`}
      >
        <Icon className="h-8 w-8" />
      </span>
      <p className="truncate text-3xl font-bold">{value}</p>
      <p className="mt-3 text-base text-white/50">{label}</p>
    </Card>
  )
}
