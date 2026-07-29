import { Award, Crown, Eye, Gavel } from 'lucide-react'

export const ROLE_KEYS = ['SPECTATOR', 'OWNER', 'JOCKEY', 'REFEREE']

export const ROLE_LABELS = {
  SPECTATOR: 'Khán giả',
  OWNER: 'Chủ ngựa',
  JOCKEY: 'Nài ngựa (Jockey)',
  REFEREE: 'Trọng tài',
}

export const ROLE_DESCRIPTIONS = {
  SPECTATOR: 'Theo dõi giải đấu, mua vé và đặt cược dự đoán.',
  OWNER: 'Đăng ký ngựa tham gia giải đấu và quản lý đội ngũ.',
  JOCKEY: 'Nhận lời mời thi đấu và quản lý lịch trình đua.',
  REFEREE: 'Giám sát các trận đua, xử lý vi phạm và xác nhận kết quả.',
}

export const ROLE_ICONS = {
  SPECTATOR: Eye,
  OWNER: Crown,
  JOCKEY: Award,
  REFEREE: Gavel,
}

export const ROLE_APPROVAL_LABELS = {
  NONE: 'Chưa gửi',
  PENDING: 'Đang chờ duyệt',
  APPROVED: 'Đã được cấp quyền',
  REJECTED: 'Bị từ chối',
}
