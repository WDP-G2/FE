import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import { unwrapResponse } from "@/api/response";

const FALLBACK_BANNER =
  "https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600";

const DEFAULT_PRIZES = { first: 0, second: 0, third: 0 };

function toDateInput(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toTimeInput(value) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function toDateTime(date, time) {
  if (!date) return undefined;
  if (time) return `${date}T${time}`;
  return date;
}

function toNumber(value) {
  if (typeof value === "number") return value;
  const normalized = String(value || "").replace(/[^0-9.]/g, "");
  return Number(normalized || 0);
}

function mapRegistrationFromApi(item) {
  if (!item) return null;
  const approval = item.status || "Chờ duyệt";
  return {
    id: item.id,
    tournamentId: item.tournamentId || "",
    raceId: item.raceId || "",
    horse: item.horseName || "",
    horseId: item.horseId || "",
    owner: item.ownerName || item.fullName || "",
    jockey: item.jockeyName || "",
    jockeyId: item.jockeyId || "",
    approval,
    status: approval,
  };
}

function mapResultFromApi(item, registrationsByHorse) {
  if (!item) return null;
  const registration = registrationsByHorse[item.horseName] || {};
  return {
    position: item.position,
    horse: item.horseName || "",
    owner: registration.owner || "",
    jockey: item.jockeyName || registration.jockey || "",
    time: item.time || "",
    points: item.points || 0,
  };
}

function mapRaceFromApi(race, tournament, registrationsByRaceId) {
  const scheduledAt = race.scheduledAt ? new Date(race.scheduledAt) : null;
  const date = toDateInput(scheduledAt || tournament.startDate);
  const time = toTimeInput(scheduledAt) || "09:00";
  const regDeadline = toDateInput(race.regDeadline) || date;
  const registrations = registrationsByRaceId[race.id] || [];
  const registrationsByHorse = registrations.reduce((result, item) => {
    if (item?.horse) result[item.horse] = item;
    return result;
  }, {});
  const results = (race.results || [])
    .map((item) => mapResultFromApi(item, registrationsByHorse))
    .filter(Boolean);

  return {
    id: race.id,
    no: race.raceNumber || 1,
    name: race.name || "",
    description: race.description || "",
    date,
    time,
    distance: race.distance ?? 0,
    status: race.status || "Nháp",
    track: race.track || tournament.location || "Chưa cập nhật",
    surface: race.surface || "Cỏ",
    category: race.category || "Open",
    minHorses: race.minHorses || 0,
    maxHorses: race.maxHorses || tournament.config?.maxRegistrations || 12,
    registered: registrations.length,
    entryFee: race.entryFee || tournament.config?.entryFee || 0,
    regDeadline,
    checkIn: race.checkIn || "08:00",
    prizes: { ...DEFAULT_PRIZES, ...(race.prizes || {}) },
    registrations,
    results,
  };
}

function mapTournamentFromApi(tournament) {
  if (!tournament) return null;

  const registrations = (tournament.registrations || [])
    .map(mapRegistrationFromApi)
    .filter(Boolean);
  const registrationsByRaceId = registrations.reduce((result, item) => {
    const raceId = item.raceId || "";
    if (!raceId) return result;
    if (!result[raceId]) result[raceId] = [];
    result[raceId].push(item);
    return result;
  }, {});

  const races = (tournament.races || []).map((race) =>
    mapRaceFromApi(race, tournament, registrationsByRaceId),
  );

  return {
    id: tournament.id || tournament._id,
    slug: tournament.slug || "",
    name: tournament.name || "",
    description: tournament.description || "",
    location: tournament.location || "",
    banner: tournament.banner || FALLBACK_BANNER,
    type: tournament.type || "regular",
    status: tournament.status || "Nháp",
    startDate: toDateInput(tournament.startDate),
    endDate: toDateInput(tournament.endDate),
    rules: tournament.rules || "",
    config: tournament.config || {},
    races,
    registrations,
    raceCount: tournament.raceCount ?? races.length,
    registrationCount: tournament.registrationCount ?? registrations.length,
    createdAt: tournament.createdAt,
    updatedAt: tournament.updatedAt,
  };
}

function mapTournamentPayload(payload) {
  if (!payload) return {};
  return {
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    location: payload.location,
    banner: payload.banner,
    type: payload.type,
    status: payload.status,
    startDate: payload.startDate || undefined,
    endDate: payload.endDate || undefined,
    rules: payload.rules,
    config: payload.config,
  };
}

function mapRacePayload(race) {
  if (!race) return {};
  return {
    raceNumber: race.no ?? race.raceNumber,
    name: race.name,
    distance: toNumber(race.distance),
    scheduledAt: toDateTime(race.date, race.time),
    status: race.status,
    description: race.description,
    track: race.track,
    surface: race.surface,
    category: race.category,
    minHorses: toNumber(race.minHorses),
    maxHorses: toNumber(race.maxHorses),
    entryFee: toNumber(race.entryFee),
    regDeadline: race.regDeadline || undefined,
    checkIn: race.checkIn,
    prizes: race.prizes,
  };
}

export const tournamentService = {
  async list(params = {}) {
    const list = await axiosClient
      .get(ENDPOINTS.tournaments.list, { params })
      .then(unwrapResponse);
    return (Array.isArray(list) ? list : [])
      .map(mapTournamentFromApi)
      .filter(Boolean);
  },

  async getById(id) {
    const item = await axiosClient
      .get(ENDPOINTS.tournaments.byId(id))
      .then(unwrapResponse);
    const mapped = mapTournamentFromApi(item);
    if (!mapped) throw new Error("Tournament not found");
    return mapped;
  },

  async create(payload) {
    const item = await axiosClient
      .post(ENDPOINTS.tournaments.list, mapTournamentPayload(payload))
      .then(unwrapResponse);
    return mapTournamentFromApi(item);
  },

  async update(id, payload) {
    const item = await axiosClient
      .patch(ENDPOINTS.tournaments.byId(id), mapTournamentPayload(payload))
      .then(unwrapResponse);
    return mapTournamentFromApi(item);
  },

  async updateConfig(id, payload) {
    const item = await axiosClient
      .patch(ENDPOINTS.tournaments.config(id), payload)
      .then(unwrapResponse);
    return mapTournamentFromApi(item);
  },

  async createRace(id, race) {
    const item = await axiosClient
      .post(ENDPOINTS.tournaments.races(id), mapRacePayload(race))
      .then(unwrapResponse);
    return mapTournamentFromApi(item);
  },

  async getRaces(id) {
    const list = await axiosClient
      .get(ENDPOINTS.tournaments.races(id))
      .then(unwrapResponse);
    const tournamentShell = { startDate: "", location: "", config: {} };
    return (Array.isArray(list) ? list : [])
      .map((race) => mapRaceFromApi(race, tournamentShell, {}))
      .filter(Boolean);
  },

  async getRace(id, raceId) {
    const race = await axiosClient
      .get(ENDPOINTS.tournaments.raceById(id, raceId))
      .then(unwrapResponse);
    const tournamentShell = { startDate: "", location: "", config: {} };
    return mapRaceFromApi(race, tournamentShell, {});
  },

  async updateRace(id, raceId, race) {
    const item = await axiosClient
      .patch(ENDPOINTS.tournaments.raceById(id, raceId), mapRacePayload(race))
      .then(unwrapResponse);
    return mapTournamentFromApi(item);
  },

  async deleteRace(id, raceId) {
    const item = await axiosClient
      .delete(ENDPOINTS.tournaments.deleteRace(id, raceId))
      .then(unwrapResponse);
    return mapTournamentFromApi(item);
  },

  async updateResults(id, raceId, resultsPayload) {
    const item = await axiosClient
      .post(ENDPOINTS.tournaments.results(id, raceId), resultsPayload)
      .then(unwrapResponse);
    return mapTournamentFromApi(item);
  },

  async listOwnerOpen() {
    const list = await axiosClient
      .get(ENDPOINTS.tournaments.ownerOpen)
      .then(unwrapResponse);
    return (Array.isArray(list) ? list : [])
      .map(mapTournamentFromApi)
      .filter(Boolean);
  },

  async getOwnerRaceOptions(id, raceId) {
    const item = await axiosClient
      .get(ENDPOINTS.tournaments.ownerRaceOptions(id, raceId))
      .then(unwrapResponse);
    return item;
  },

  async createOwnerRegistration(id, payload) {
    const item = await axiosClient
      .post(ENDPOINTS.tournaments.ownerRegister(id), payload)
      .then(unwrapResponse);
    return mapTournamentFromApi(item);
  },

  async updateRegistrationStatus(tournamentId, registrationId, status) {
    const item = await axiosClient
      .patch(
        ENDPOINTS.tournaments.registrationStatus(tournamentId, registrationId),
        {
          status,
        },
      )
      .then(unwrapResponse);
    return mapTournamentFromApi(item);
  },

  async listOwnerRegistrations() {
    const list = await axiosClient
      .get(ENDPOINTS.tournaments.ownerRegistrations)
      .then(unwrapResponse);
    return (Array.isArray(list) ? list : []).map((item) => ({
      id: item.id,
      tournamentId: item.tournamentId || "",
      tournamentName: item.tournamentName || "",
      tournamentStatus: item.tournamentStatus || "",
      raceId: item.raceId || "",
      raceName: item.raceName || "",
      raceStatus: item.raceStatus || "",
      horseId: item.horseId || "",
      horse: item.horseName || "",
      owner: item.ownerName || item.fullName || "",
      jockeyId: item.jockeyId || "",
      jockey: item.jockeyName || "",
      approval: item.status || "Chờ duyệt",
      notes: item.notes || "",
      registeredAt: item.registeredAt,
      fullName: item.fullName || "",
    }));
  },

  async listJockeyRegistrations() {
    const list = await axiosClient
      .get(ENDPOINTS.tournaments.jockeyRegistrations)
      .then(unwrapResponse);
    return (Array.isArray(list) ? list : []).map((item) => ({
      id: item.id,
      tournamentId: item.tournamentId || "",
      tournamentName: item.tournamentName || "",
      tournamentStatus: item.tournamentStatus || "",
      raceId: item.raceId || "",
      raceName: item.raceName || "",
      raceNumber: item.raceNumber || "",
      raceStatus: item.raceStatus || "",
      raceDate: item.raceDate || "",
      raceTime: item.raceTime || "",
      location: item.location || "",
      horseId: item.horseId || "",
      horseName: item.horseName || "",
      horseBreed: item.horseBreed || "",
      horseAge: item.horseAge || null,
      horseHealth: item.horseHealth || "",
      horseBirthDate: item.horseBirthDate || "",
      horseWins: item.horseWins || 0,
      horseRaces: item.horseRaces || 0,
      horseNotes: item.horseNotes || "",
      horseGender: item.horseGender || "",
      horseImageUrl: item.horseImageUrl || "",
      ownerName: item.ownerName || item.fullName || "",
      status: item.status || "",
      notes: item.notes || "",
      registeredAt: item.registeredAt || "",
    }));
  },
};
