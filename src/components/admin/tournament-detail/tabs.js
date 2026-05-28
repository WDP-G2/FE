import {
  Award,
  CalendarRange,
  Flag,
  Info,
  Settings,
  Users,
} from 'lucide-react'

export const detailTabs = [
  { key: 'overview', label: 'Tổng quan', icon: Info },
  { key: 'races', label: 'Cấu hình cuộc đua', icon: Flag },
  { key: 'participants', label: 'Người tham gia', icon: Users },
  { key: 'schedule', label: 'Lịch thi đấu', icon: CalendarRange },
  { key: 'results', label: 'Kết quả', icon: Award },
  { key: 'settings', label: 'Cài đặt', icon: Settings },
]
