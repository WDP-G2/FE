import { useParams } from 'react-router-dom'
import AdminNewsForm from '@/components/AdminNewsForm'

export default function AdminNewsEditPage() {
  const { id } = useParams()
  return <AdminNewsForm articleId={id} />
}
