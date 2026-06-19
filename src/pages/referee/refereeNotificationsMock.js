const store = globalThis

export const notifications = store.__ref_notifs__ ?? (store.__ref_notifs__ = [
  {
    id: 'N-001',
    type: 'reminder',
    title: 'Race R1 sắp bắt đầu trong 45 phút',
    body: 'Vietnam Grand Prix · Vòng loại 1 · Hạng A · 14:30 · Phú Thọ A',
    time: '13:45',
    read: false,
    link: '/referee/races',
  },
  {
    id: 'N-002',
    type: 'checkin',
    title: '5 ngựa chưa check-in cho Race R1',
    body: 'Hạn check-in: 14:15. Còn 30 phút trước race.',
    time: '13:45',
    read: false,
    link: '/referee/races',
  },
  {
    id: 'N-003',
    type: 'schedule',
    title: 'Lịch race R2 đã được dời',
    body: 'Vietnam Grand Prix · Vòng loại 2 dời từ 15:30 sang 16:00 do thời tiết.',
    time: '11:20',
    read: false,
  },
  {
    id: 'N-004',
    type: 'result',
    title: 'Kết quả R2 Saigon Derby đã được BTC xác nhận',
    body: 'Bảng xếp hạng và giải thưởng đã được công bố cho người dùng.',
    time: 'Hôm qua',
    read: true,
    link: '/referee/races',
  },
  {
    id: 'N-005',
    type: 'system',
    title: 'Bạn được phân công 2 race mới',
    body: 'Vietnam Grand Prix R3 (Bán kết) và R4 (Chung kết). Kiểm tra trang Cuộc đua được giao.',
    time: 'Hôm qua',
    read: true,
    link: '/referee/races',
  },
])
