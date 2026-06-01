const STATUS_MAP = {
  "Đã duyệt": { label: "Xác nhận", tone: "green" },
  "Chờ duyệt": { label: "Chờ xác nhận", tone: "gold" },
  "Đang chạy": { label: "Đang chạy", tone: "blue" },
  "Hoàn thành": { label: "Hoàn thành", tone: "gray" },
};

function normalizeStatus(status) {
  if (STATUS_MAP[status]) return STATUS_MAP[status];
  return { label: status || "Chưa rõ", tone: "gray" };
}

function buildRaceLabel(registration) {
  const number = registration.raceNumber
    ? `Race R${registration.raceNumber}`
    : "Race";
  return registration.raceName
    ? `${number} · ${registration.raceName}`
    : number;
}

export function buildScheduleItems(registrations) {
  return (registrations || []).map((registration) => {
    const statusInfo = normalizeStatus(registration.status);
    return {
      id: registration.id,
      tournament: registration.tournamentName || "",
      race: buildRaceLabel(registration),
      horse: registration.horseName || "Chưa cập nhật",
      owner: registration.ownerName || "Chưa cập nhật",
      date: registration.raceDate || "",
      time: registration.raceTime || "",
      location: registration.location || "Chưa cập nhật",
      status: statusInfo.label,
      statusTone: statusInfo.tone,
      checkedIn: false,
      laneNo: registration.laneNo ?? null,
    };
  });
}

export function buildAssignedHorses(registrations) {
  const grouped = new Map();

  (registrations || []).forEach((registration) => {
    const key =
      registration.horseId || registration.horseName || registration.id;
    if (!key) return;

    const existing = grouped.get(key);
    const next = {
      id: key,
      name: registration.horseName || "Chưa cập nhật",
      breed: registration.horseBreed || "Chưa cập nhật",
      age: registration.horseAge ?? "—",
      birthDate: registration.horseBirthDate || "",
      weight: registration.horseWeight ?? "—",
      gender: registration.horseGender || "Chưa cập nhật",
      health: registration.horseHealth || "Chưa rõ",
      healthTone: registration.horseHealth ? "green" : "gray",
      owner: registration.ownerName || "Chưa cập nhật",
      tournament: registration.tournamentName || "",
      wins: registration.horseWins ?? 0,
      races: registration.horseRaces ?? 0,
      lastRace: registration.raceDate || "",
      notes:
        registration.horseNotes || registration.notes || "Chưa có ghi chú.",
      imageUrl: registration.horseImageUrl || "",
    };

    if (!existing) {
      grouped.set(key, next);
      return;
    }

    const existingDate = existing.lastRace
      ? new Date(existing.lastRace).getTime()
      : 0;
    const nextDate = next.lastRace ? new Date(next.lastRace).getTime() : 0;
    if (nextDate >= existingDate) {
      grouped.set(key, next);
    }
  });

  return Array.from(grouped.values());
}
