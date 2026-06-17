




const store = globalThis;

export const assignedRaces = store.__ref_races__ ?? (store.__ref_races__ = [
  {
    id: 'vgp-r1',
    tournamentId: 'vietnam-grand-prix-2026',
    tournamentName: 'Vietnam Grand Prix 2026',
    no: 1,
    name: 'Vòng loại 1 · Hạng A',
    date: '2026-05-24',
    time: '14:30',
    track: 'Phú Thọ - Đường đua A',
    distance: '1400m',
    totalHorses: 12,
    status: 'Đang check-in',
    checkedIn: 7,
    surface: 'Cỏ',
  },
  {
    id: 'vgp-r2',
    tournamentId: 'vietnam-grand-prix-2026',
    tournamentName: 'Vietnam Grand Prix 2026',
    no: 2,
    name: 'Vòng loại 2 · Hạng B',
    date: '2026-05-24',
    time: '16:00',
    track: 'Phú Thọ - Đường đua A',
    distance: '1600m',
    totalHorses: 10,
    status: 'Sắp diễn ra',
    checkedIn: 0,
    surface: 'Đất',
  },
  {
    id: 'vgp-r3',
    tournamentId: 'vietnam-grand-prix-2026',
    tournamentName: 'Vietnam Grand Prix 2026',
    no: 3,
    name: 'Bán kết · Open',
    date: '2026-05-25',
    time: '15:00',
    track: 'Phú Thọ - Đường đua B',
    distance: '1800m',
    totalHorses: 8,
    status: 'Sắp diễn ra',
    checkedIn: 0,
    surface: 'Cỏ',
  },
  {
    id: 'sgd-r1',
    tournamentId: 'saigon-derby-2026',
    tournamentName: 'Saigon Derby 2026',
    no: 1,
    name: 'Vòng loại 1',
    date: '2026-05-22',
    time: '14:00',
    track: 'Phú Thọ - Đường đua A',
    distance: '1200m',
    totalHorses: 10,
    status: 'Đã kết thúc',
    checkedIn: 10,
    surface: 'Cỏ',
  },
  {
    id: 'sgd-r2',
    tournamentId: 'saigon-derby-2026',
    tournamentName: 'Saigon Derby 2026',
    no: 2,
    name: 'Vòng loại 2',
    date: '2026-05-23',
    time: '15:30',
    track: 'Phú Thọ - Đường đua A',
    distance: '1400m',
    totalHorses: 12,
    status: 'Đã kết thúc',
    checkedIn: 12,
    surface: 'Đất',
  },
  {
    id: 'hnc-r5',
    tournamentId: 'hanoi-cup-2025',
    tournamentName: 'Hanoi Cup 2025',
    no: 5,
    name: 'Chung kết',
    date: '2025-12-15',
    time: '16:00',
    track: 'Sóc Sơn - Đường đua chính',
    distance: '2000m',
    totalHorses: 8,
    status: 'Đã kết thúc',
    checkedIn: 8,
    surface: 'Cỏ',
  },
]);

const HORSE_POOL = [
  { horse: 'Thunder Bolt', owner: 'Nguyễn Văn A', jockey: 'Trần Minh Tú' },
  { horse: 'Black Pearl', owner: 'Trần Thị B', jockey: 'Phạm Hoàng' },
  { horse: 'Wind Runner', owner: 'Lê Văn C', jockey: 'Đặng Quang' },
  { horse: 'Golden Star', owner: 'Phạm Thị D', jockey: 'Vũ Đức' },
  { horse: 'Storm Chaser', owner: 'Hoàng Văn E', jockey: 'Bùi Anh' },
  { horse: 'Silver Arrow', owner: 'Đỗ Văn F', jockey: 'Lý Phong' },
  { horse: 'Night Fury', owner: 'Vương Văn G', jockey: 'Trịnh Sơn' },
  { horse: 'Lightning Strike', owner: 'Mai Văn H', jockey: 'Hồ Long' },
  { horse: 'Desert Rose', owner: 'Cao Thị I', jockey: 'Phan Tài' },
  { horse: 'Royal Flame', owner: 'Tô Văn K', jockey: 'Đỗ Nam' },
  { horse: 'Crimson Wind', owner: 'Lưu Văn L', jockey: 'Nguyễn Khang' },
  { horse: 'Iron Hoof', owner: 'Bạch Văn M', jockey: 'Trần Hải' },
  { horse: 'Sky Dancer', owner: 'Ngô Văn N', jockey: 'Lê Duy' },
  { horse: 'Phoenix Fire', owner: 'Vũ Văn O', jockey: 'Phạm Tùng' },
  { horse: 'Shadow Blade', owner: 'Hà Văn P', jockey: 'Lương Tâm' },
  { horse: 'Mystic Mare', owner: 'Đinh Văn Q', jockey: 'Trương Bảo' },
];

export function buildHorses(race) {
  if (!race || !Number.isFinite(Number(race.totalHorses))) return []
  return Array.from({ length: Number(race.totalHorses) }).map((_, i) => {
    const h = HORSE_POOL[i % HORSE_POOL.length];
    const isDone = race.status === 'Đã kết thúc' || race.status === 'Đang đua';
    const checkedIn = isDone ? true : i < race.checkedIn;
    const status = checkedIn
      ? 'Đã check-in'
      : i === race.checkedIn
      ? 'Chờ'
      : i === race.totalHorses - 1 && race.status === 'Đang check-in'
      ? 'Vắng mặt'
      : 'Chờ';
    return {
      no: i + 1,
      id: `${race.id}-h${i + 1}`,
      horse: h.horse,
      owner: h.owner,
      jockey: h.jockey,
      health: i === 4 ? 'Hết hạn' : 'Hợp lệ',
      deposit: i === 6 ? 'Chưa thanh toán' : 'Đã thanh toán',
      checkIn: status,
    };
  });
}

export const violations = store.__ref_violations__ ?? (store.__ref_violations__ = [
  {
    id: 'V-2026-018',
    raceId: 'sgd-r2',
    raceName: 'Saigon Derby · R2 Vòng loại 2',
    horseNo: 5,
    horse: 'Storm Chaser',
    jockey: 'Bùi Anh',
    type: 'Lái nguy hiểm',
    severity: 'Phạt nặng',
    description: 'Jockey cắt làn nguy hiểm khúc cua thứ 2, gây nguy hiểm cho ngựa số 7.',
    penalty: 'Trừ 3 giây thành tích · Cảnh cáo lần cuối',
    evidence: [{ name: 'cam-turn2-replay.mp4', size: '12.4 MB' }],
    timestamp: '2026-05-23 15:48',
    reporter: 'Trọng tài phụ trách',
  },
  {
    id: 'V-2026-017',
    raceId: 'sgd-r1',
    raceName: 'Saigon Derby · R1 Vòng loại 1',
    horseNo: 9,
    horse: 'Desert Rose',
    jockey: 'Phan Tài',
    type: 'Xuất phát sai',
    severity: 'Cảnh cáo',
    description: 'Vượt vạch xuất phát trước tín hiệu 0.2s.',
    penalty: 'Cảnh cáo',
    evidence: [{ name: 'start-line-cam.jpg', size: '820 KB' }],
    timestamp: '2026-05-22 14:02',
    reporter: 'Trọng tài phụ trách',
  },
  {
    id: 'V-2026-016',
    raceId: 'hnc-r5',
    raceName: 'Hanoi Cup · R5 Chung kết',
    horseNo: 3,
    horse: 'Wind Runner',
    jockey: 'Đặng Quang',
    type: 'Nghi doping',
    severity: 'Loại',
    description: 'Mẫu nước tiểu post-race phát hiện chất kích thích nhóm B.',
    penalty: 'Loại khỏi giải · Cấm thi đấu 12 tháng',
    evidence: [
      { name: 'lab-report-001.pdf', size: '2.1 MB' },
      { name: 'sample-chain-of-custody.pdf', size: '480 KB' },
    ],
    timestamp: '2025-12-15 18:30',
    reporter: 'Trọng tài phụ trách',
  },
]);

export function addViolation(v) {
  violations.unshift(v);
}

export const notifications = store.__ref_notifs__ ?? (store.__ref_notifs__ = [
  {
    id: 'N-001',
    type: 'reminder',
    title: 'Race R1 sắp bắt đầu trong 45 phút',
    body: 'Vietnam Grand Prix · Vòng loại 1 · Hạng A · 14:30 · Phú Thọ A',
    time: '13:45',
    read: false,
    link: '/referee/races/vgp-r1',
  },
  {
    id: 'N-002',
    type: 'checkin',
    title: '5 ngựa chưa check-in cho Race R1',
    body: 'Hạn check-in: 14:15. Còn 30 phút trước race.',
    time: '13:45',
    read: false,
    link: '/referee/races/vgp-r1',
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
    link: '/referee/races/sgd-r2',
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
]);

export const checkinTone = (s) => {
  if (s === 'Đã check-in') return 'green';
  if (s === 'Chờ') return 'gold';
  if (s === 'Vắng mặt') return 'gray';
  if (s === 'Không đủ điều kiện') return 'purple';
  return 'red';
};

export const raceStatusTone = (s) => {
  if (s === 'Sắp diễn ra') return 'blue';
  if (s === 'Đang check-in') return 'gold';
  if (s === 'Đang đua') return 'green';
  return 'purple';
};

export const severityTone = (s) => {
  if (s === 'Cảnh cáo') return 'gold';
  if (s === 'Phạt nhẹ') return 'gold';
  if (s === 'Phạt nặng') return 'red';
  return 'purple';
};
