import { normalizePrizeList } from "../utils";

export function mergeDraftRaces(tournament, races) {
  const draftRaces = races.filter((race) => race.isNew);
  if (!draftRaces.length) return tournament;

  const mergedRaces = [...tournament.races, ...draftRaces].map((race, index) => ({
    ...race,
    no: index + 1,
  }));

  return {
    ...tournament,
    races: mergedRaces,
    raceCount: mergedRaces.length,
  };
}

export function shiftTime(time, hours) {
  if (!time) return "";

  const [hour = "00", minute = "00"] = time.split(":");
  const nextHour = Math.max(0, Math.min(23, Number(hour) + hours));
  return `${String(nextHour).padStart(2, "0")}:${String(Number(minute)).padStart(2, "0")}`;
}

export function shiftTimeByMinutes(time, minutes) {
  if (!time) return "";

  const [hour = "00", minute = "00"] = String(time).split(":");
  const totalMinutes = Math.max(
    0,
    Math.min(23 * 60 + 59, Number(hour) * 60 + Number(minute) + minutes),
  );
  const nextHour = Math.floor(totalMinutes / 60);
  const nextMinute = totalMinutes % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
}

export function clampDate(date, min, max) {
  if (!date) return "";
  if (min && date < min) return min;
  if (max && date > max) return max;
  return date;
}

export function clampTime(time, min, max) {
  if (!time) return "";
  if (min && time < min) return min;
  if (max && time > max) return max;
  return time;
}

export function metersFromDistance(distance) {
  return String(distance || "").match(/\d+/)?.[0] || "";
}

export function formatDistance(distance) {
  const meters = metersFromDistance(distance);
  return meters ? `${meters}m` : "";
}

export function getEffectiveProvinceId(tournament, race) {
  return (
    tournament?.provinceId ||
    tournament?.raw?.provinceId ||
    race?.provinceId ||
    ""
  );
}

export function matchProvinceForTournament(tournament, provinces) {
  const location = (tournament?.location || "").trim().toLowerCase();
  const provinceName = (tournament?.provinceName || "").trim().toLowerCase();

  return provinces.find((province) => {
    if (!province.active) return false;

    const name = (province.name || "").trim().toLowerCase();
    const code = (province.code || "").trim().toLowerCase();

    return (
      (provinceName && provinceName === name) ||
      (location && location === name) ||
      (location && code && location === code) ||
      (location && name.includes(location)) ||
      (location && location.includes(name))
    );
  });
}

function toDateTimeValue(date, time = "08:00") {
  return `${date}T${time || "08:00"}`;
}

export function buildDefaultRace(
  tournament,
  no,
  distanceOptions = [],
  venues = [],
  defaultRegistrationFee = 0,
) {
  const defaultVenue = venues[0];
  const defaultDistance = distanceOptions[0]?.value || "1000m";
  const fee = Number(defaultRegistrationFee) || 0;
  const startTime = tournament.startTime || "08:00";

  return {
    id: `${tournament.id}-draft-${Date.now()}-${no}`,
    no,
    name: `Cuộc đua ${no}`,
    description: "",
    date: tournament.startDate || "",
    time: startTime,
    endTime: shiftTime(startTime, 1),
    distance: defaultDistance,
    venueId: defaultVenue?.id || "",
    venueName: defaultVenue?.name || "",
    venueAddress: defaultVenue?.address || "",
    provinceId: tournament.provinceId || defaultVenue?.provinceId || "",
    provinceName: tournament.provinceName || defaultVenue?.provinceName || "",
    track: "",
    surface: "",
    category: "",
    minHorses: 8,
    maxHorses: 12,
    registered: 0,
    entryFee: fee,
    checkIn: tournament.startTime || "08:00",
    status: "Nháp",
    prizes: [
      { id: `prize-${no}-1`, rank: 1, itemName: "Giải nhất", amount: 10000000 },
      { id: `prize-${no}-2`, rank: 2, itemName: "Giải nhì", amount: 5000000 },
      { id: `prize-${no}-3`, rank: 3, itemName: "Giải ba", amount: 3000000 },
    ],
    isNew: true,
  };
}

export function applyOptionDefaults(
  race,
  distanceOptions = [],
  venues = [],
  defaultRegistrationFee = 0,
) {
  const next = { ...race };
  if (!next.distance && distanceOptions[0]?.value) {
    next.distance = distanceOptions[0].value;
  }
  if (!next.venueId && venues[0]?.id) {
    next.venueId = venues[0].id;
    next.venueName = venues[0].name;
    next.venueAddress = venues[0].address;
    next.provinceId = venues[0].provinceId || next.provinceId;
    next.provinceName = venues[0].provinceName || next.provinceName;
  }
  if (
    (next.entryFee === "" || next.entryFee == null || Number(next.entryFee) === 0) &&
    Number(defaultRegistrationFee) > 0
  ) {
    next.entryFee = Number(defaultRegistrationFee);
  }
  if (!next.date && race.date === "") {
    // keep empty if tournament has no start date
  }
  if (!Object.prototype.hasOwnProperty.call(next, "endTime") && next.time) {
    next.endTime = shiftTime(next.time, 1);
  }
  if (!next.minHorses) next.minHorses = 8;
  if (!next.maxHorses) next.maxHorses = 12;
  return next;
}

const MIN_RACE_DURATION_MINUTES = 45;

function timeToMinutes(time) {
  const [hour = "0", minute = "0"] = String(time || "00:00").split(":");
  return Number(hour) * 60 + Number(minute);
}

function getRaceEndTime(race) {
  return Object.prototype.hasOwnProperty.call(race, "endTime")
    ? race.endTime
    : shiftTime(race.time, 1);
}

function getRaceInterval(race) {
  const endTime = getRaceEndTime(race);

  return {
    startValue: toDateTimeValue(race.date, race.time),
    endValue: toDateTimeValue(race.date, endTime),
  };
}

function hasScheduleOverlap(firstRace, secondRace) {
  if (!firstRace?.date || !secondRace?.date) return false;
  if (!firstRace?.time || !secondRace?.time) return false;
  if (!getRaceEndTime(firstRace) || !getRaceEndTime(secondRace)) return false;
  if (String(firstRace.venueId) !== String(secondRace.venueId)) return false;

  const first = getRaceInterval(firstRace);
  const second = getRaceInterval(secondRace);

  return first.startValue < second.endValue && first.endValue > second.startValue;
}

function getRaceScheduleConflictError(races) {
  for (let index = 0; index < races.length; index += 1) {
    for (let compareIndex = index + 1; compareIndex < races.length; compareIndex += 1) {
      if (hasScheduleOverlap(races[index], races[compareIndex])) {
        return "Địa điểm đua đã có cuộc đua trùng khung giờ";
      }
    }
  }
  return "";
}

export function getRaceValidationError(races, tournament) {
  const tournamentStart = toDateTimeValue(
    tournament.startDate,
    tournament.startTime || "00:00",
  );
  const tournamentEnd = toDateTimeValue(
    tournament.endDate,
    tournament.endTime || "23:59",
  );
  const keys = new Set();

  for (const race of races) {
    const raceName = race.name?.trim();
    const raceDistance = race.distance?.trim();
    const raceEndTime = getRaceEndTime(race);
    const raceStart = toDateTimeValue(race.date, race.time);
    const raceEnd = toDateTimeValue(race.date, raceEndTime);
    const raceKey = `${raceName?.toLowerCase()}|${raceStart}`;
    const prizeRanks = new Set();

    if (!raceName) return "Tên cuộc đua không được để trống";
    if (raceName.length > 120) return "Tên cuộc đua tối đa 120 ký tự";
    if (!raceDistance) return "Khoảng cách cuộc đua không được để trống";
    if (raceDistance.length > 80) return "Khoảng cách tối đa 80 ký tự";
    if (Number(metersFromDistance(raceDistance)) <= 0)
      return "Khoảng cách phải lớn hơn 0 m";
    if (!race.venueId) return "Vui lòng chọn địa điểm đua";
    if ((race.description || "").length > 1000)
      return "Mô tả cuộc đua tối đa 1000 ký tự";
    if (!race.date || !race.time || !raceEndTime)
      return "Ngày, giờ bắt đầu và giờ kết thúc không được để trống";
    if (raceEnd <= raceStart)
      return "Giờ kết thúc cuộc đua phải sau giờ bắt đầu";
    if (timeToMinutes(raceEndTime) - timeToMinutes(race.time) < MIN_RACE_DURATION_MINUTES)
      return `Giờ bắt đầu và giờ kết thúc phải cách nhau ít nhất ${MIN_RACE_DURATION_MINUTES} phút`;
    if (raceStart < tournamentStart || raceEnd > tournamentEnd)
      return "Lịch thi đấu phải nằm trong thời gian mùa giải";
    if (Number(race.minHorses) <= 0 || Number(race.maxHorses) <= 0)
      return "Giới hạn ngựa phải lớn hơn 0";
    if (Number(race.minHorses) > Number(race.maxHorses))
      return "Tối thiểu ngựa không được lớn hơn tối đa ngựa";
    if (Number(race.entryFee) < 0)
      return "Lệ phí đăng ký không được âm";
    if (keys.has(raceKey))
      return "Tên cuộc đua và giờ thi đấu không được trùng nhau trong cùng giải";

    const prizes = normalizePrizeList(race.prizes);
    for (const prize of prizes) {
      if (prize.rank <= 0) return "Hạng giải thưởng phải lớn hơn 0";
      if (Number(prize.amount) < 0) return "Số tiền giải thưởng không được âm";
      if (prizeRanks.has(prize.rank))
        return "Hạng giải thưởng không được trùng nhau trong cùng cuộc đua";
      prizeRanks.add(prize.rank);
    }

    for (let index = 1; index < prizes.length; index += 1) {
      if (Number(prizes[index - 1].amount) <= Number(prizes[index].amount)) {
        return "Số tiền giải sau phải nhỏ hơn giải trước";
      }
    }

    keys.add(raceKey);
  }

  return getRaceScheduleConflictError(races);
}
