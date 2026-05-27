import { Users } from 'lucide-react'
import Badge from '@/components/admin/ui/Badge'
import Card from '@/components/admin/ui/Card'
import { PanelHeader, SimpleTable } from '@/components/admin/ui/Panel'
import { registrationsFor } from './utils'

export default function ParticipantsTab({ tournament }) {
  const rows = tournament.races.flatMap((race) =>
    registrationsFor(race).map((person) => [
      `R${race.no} ┬╖ ${race.name}`,
      person.horse,
      person.owner,
      person.jockey,
      <Badge key="dep" tone={person.deposit === '─É├ú thanh to├ín' ? 'green' : 'red'}>
        {person.deposit}
      </Badge>,
      <Badge key="approve" tone={person.approval === '─É├ú duyß╗çt' ? 'green' : 'gold'}>
        {person.approval}
      </Badge>,
    ]),
  )

  return (
    <Card>
      <PanelHeader
        icon={Users}
        title="Tß║Ñt cß║ú ─æ─âng k├╜ trong giß║úi ─æß║Ñu"
        subtitle="Tß╗òng hß╗úp ngß╗▒a ─æ─âng k├╜ xuy├¬n suß╗æt c├íc cuß╗Öc ─æua"
      />
      <SimpleTable
        headers={['Cuß╗Öc ─æua', 'Ngß╗▒a', 'Chß╗º ngß╗▒a', 'Jockey', 'Cß╗ìc', 'Trß║íng th├íi']}
        rows={rows}
      />
    </Card>
  )
}
