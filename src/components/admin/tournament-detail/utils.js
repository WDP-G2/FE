export function registrationsFor(race) {
  if (!race) return [];
  if (Array.isArray(race.registrations)) {
    return race.registrations;
  }
  return [];
}

export function approvedRegistrationsFor(race) {
  return registrationsFor(race).filter(
    (item) => item.approval === "Đã duyệt",
  );
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
  return approvedRegistrationsFor(race).map((member, index) => ({
    ...member,
    position: index + 1,
    time: "—",
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
