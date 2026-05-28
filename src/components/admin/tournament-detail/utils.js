export function registrationsFor(race) {
  if (Array.isArray(race.registrations) && race.registrations.length) {
    return race.registrations;
  }
  const count = race.registered || 0;
  return Array.from({ length: count }, (_, index) => ({
    horse: `Ngựa #${index + 1}`,
    owner: "Chưa cập nhật",
    jockey: "Chưa cập nhật",
    approval: index % 4 === 3 ? "Chờ duyệt" : "Đã duyệt",
  }));
}

export function resultsFor(race) {
  if (Array.isArray(race.results) && race.results.length) {
    return race.results
      .filter(Boolean)
      .map((item, index) => ({
        horse: item.horse || "Chưa cập nhật",
        owner: item.owner || "Chưa cập nhật",
        jockey: item.jockey || "Chưa cập nhật",
        position: item.position ?? index + 1,
        time: item.time || "—",
        ...item,
      }));
  }
  return registrationsFor(race).map((member, index) => ({
    ...member,
    position: index + 1,
    time: `01:${String(12 + index).padStart(2, "0")}.${String(24 + index * 3).padStart(2, "0")}`,
  }));
}

export function getTotalPrize(race) {
  const prizes = race.prizes || {};
  return (
    (prizes.first || 0) +
    (prizes.second || 0) +
    (prizes.third || 0) +
    (prizes.bonus || 0)
  );
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
