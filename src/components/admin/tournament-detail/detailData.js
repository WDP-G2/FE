const horsePool = [
  { horse: "Thunder Strike", owner: "Nguyễn Văn A", jockey: "Trần Minh" },
  { horse: "Golden Flash", owner: "Trần Thị B", jockey: "Phạm An" },
  { horse: "Midnight Runner", owner: "Lê Văn C", jockey: "Đức Hoàng" },
  { horse: "Royal Destiny", owner: "Phạm Thị D", jockey: "Khánh Linh" },
  { horse: "Speed Demon", owner: "Hoàng Văn E", jockey: "Tuấn Anh" },
  { horse: "Silver Wind", owner: "Bùi Thị F", jockey: "Quốc Bảo" },
  { horse: "Lucky Storm", owner: "Đặng Văn G", jockey: "Minh Quân" },
  { horse: "Red Arrow", owner: "Võ Thị H", jockey: "Hải Nam" },
];

function createRaces(prefix, counts, datePrefix = "2026-06", startDay = 10) {
  return counts.map((registered, index) => {
    const no = index + 1;
    const name =
      no === counts.length
        ? "Chung kết"
        : no === counts.length - 1
          ? "Bán kết"
          : `Vòng loại ${no}`;

    return {
      id: `${prefix}-r${no}`,
      no,
      name,
      description:
        "Cuộc đua dành cho ngựa thuần chủng, áp dụng tiêu chuẩn thi đấu quốc tế.",
      date: `${datePrefix}-${String(startDay + index).padStart(2, "0")}`,
      time: no % 2 ? "14:30" : "16:00",
      distance: `${1200 + index * 200}m`,
      track: "Phú Thọ - Đường đua A",
      surface: no % 2 ? "Cỏ" : "Đất",
      category: no === counts.length ? "Open" : "Hạng A",
      minHorses: 6,
      maxHorses: 12,
      registered,
      entryFee: 5000000 + index * 1000000,
      deposit: 10000000,
      regDeadline: `${datePrefix}-${String(Math.max(1, startDay - 5 + index)).padStart(2, "0")}`,
      checkIn: "13:00",
      status: no < 3 ? "Mở đăng ký" : "Sắp diễn ra",
      prizes: {
        first: no * 100000000,
        second: no * 50000000,
        third: no * 25000000,
      },
    };
  });
}

export const detailTournaments = {
  "vietnam-grand-prix-2026": {
    id: "vietnam-grand-prix-2026",
    name: "Vietnam Grand Prix 2026",
    status: "Đang mở đăng ký",
    location: "Sân đua Phú Thọ, TP. HCM",
    startDate: "2026-06-10",
    endDate: "2026-06-20",
    banner:
      "https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description:
      "Giải đua ngựa lớn nhất Việt Nam năm 2026 với sự tham gia của hơn 100 ngựa thuần chủng từ khắp Đông Nam Á.",
    rules:
      "1. Ngựa phải có giấy chứng nhận sức khỏe hợp lệ.\n2. Jockey phải có chứng chỉ FIA.\n3. Tiền phí hoàn lại sau khi kết thúc giải.\n4. Kiểm tra doping bắt buộc.",
    races: createRaces("vgp", [8, 7, 7, 7, 7, 6]),
  },
  "saigon-derby-2026": {
    id: "saigon-derby-2026",
    name: "Saigon Derby 2026",
    status: "Đang diễn ra",
    location: "Sân đua Phú Thọ, TP. HCM",
    startDate: "2026-07-15",
    endDate: "2026-07-22",
    banner:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description: "Giải đấu truyền thống thường niên tại Thành phố Hồ Chí Minh.",
    rules:
      "1. Theo luật FIA.\n2. Doping check toàn bộ.\n3. Đăng ký trước 7 ngày.",
    races: createRaces("sgd", [8, 8, 8, 8, 8], "2026-07", 15),
  },
  "hanoi-cup-2025": {
    id: "hanoi-cup-2025",
    name: "Hanoi Cup 2025",
    status: "Đã kết thúc",
    location: "Sân đua Sóc Sơn, Hà Nội",
    startDate: "2025-12-05",
    endDate: "2025-12-15",
    banner:
      "https://images.unsplash.com/photo-1551134084-92ca8eea7cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description: "Giải đua mùa đông tại Hà Nội với tám vòng đua đỉnh cao.",
    rules:
      "1. Theo luật quốc gia.\n2. Tiền thưởng trả sau khi công bố kết quả.",
    races: createRaces("hnc", [6, 6, 6, 5, 5, 5, 5, 4], "2025-12", 5).map(
      (race) => ({ ...race, status: "Đã kết thúc" }),
    ),
  },
  "spring-classic-2026": {
    id: "spring-classic-2026",
    name: "Spring Classic 2026",
    status: "Nháp",
    location: "Sân đua Đà Lạt",
    startDate: "2026-03-10",
    endDate: "2026-03-15",
    banner:
      "https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600",
    description: "Giải đấu đầu xuân dành cho ngựa trẻ và jockey mới.",
    rules: "1. Dành cho ngựa dưới bốn tuổi.\n2. Jockey hạng B trở lên.",
    races: createRaces("spc", [0, 0, 0, 0], "2026-03", 10).map((race) => ({
      ...race,
      status: "Nháp",
    })),
  },
};

export function createNewRace(tournament) {
  const no = tournament.races.length + 1;
  return {
    ...createRaces(tournament.id, [0])[0],
    id: `${tournament.id}-r${no}`,
    no,
    name: `Cuộc đua ${no}`,
    date: tournament.startDate,
    regDeadline: tournament.startDate,
  };
}

export function registrationsFor(race) {
  return Array.from({ length: race.registered }, (_, index) => {
    const member = horsePool[index % horsePool.length];
    return {
      ...member,
      deposit: index % 5 === 4 ? "Chưa thanh toán" : "Đã thanh toán",
      approval: index % 4 === 3 ? "Chờ duyệt" : "Đã duyệt",
    };
  });
}

export function resultsFor(race) {
  return registrationsFor(race).map((member, index) => ({
    ...member,
    position: index + 1,
    time: `01:${String(12 + index).padStart(2, "0")}.${String(24 + index * 3).padStart(2, "0")}`,
  }));
}

export function getTotalPrize(race) {
  return race.prizes.first + race.prizes.second + race.prizes.third;
}

export function formatVnd(value) {
  return `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
}

export function toneForStatus(status) {
  if (status.includes("mở") || status.includes("Mở")) return "gold";
  if (status.includes("diễn") || status.includes("đua")) return "green";
  if (status.includes("kết thúc")) return "purple";
  return "blue";
}
