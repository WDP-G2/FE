import { Users } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { PanelHeader, SimpleTable } from '@/components/ui/Panel'
import { registrationsFor } from './utils'

export default function ParticipantsTab({ tournament }) {
  const rows = tournament.races.flatMap((race) =>
    registrationsFor(race).map((person) => [
      `R${race.no} · ${race.name}`,
      person.horse,
      person.owner,
      person.jockey,
      <Badge key="approve" tone={person.approval === 'Đã duyệt' ? 'green' : 'gold'}>
        {person.approval}
      </Badge>,
    ]),
  )

  return (
    <Card>
      <PanelHeader
        icon={Users}
        title="Tất cả đăng ký trong giải đấu"
        subtitle="Tổng hợp ngựa đăng ký xuyên suốt các cuộc đua"
      />
      <SimpleTable
        headers={['Cuộc đua', 'Ngựa', 'Chủ ngựa', 'Jockey', 'Trạng thái']}
        rows={rows}
      />
    </Card>
  )
}
