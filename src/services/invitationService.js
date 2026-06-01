import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import { unwrapResponse } from "@/api/response";

function mapInvitation(item) {
  if (!item) return null;
  return {
    id: String(item.id),
    ownerId: item.ownerId || "",
    jockeyId: item.jockeyId || "",
    horseId: item.horseId || "",
    tournamentId: item.tournamentId || "",
    raceId: item.raceId || "",
    owner: item.owner || item.ownerName || "",
    ownerName: item.ownerName || item.owner || "",
    jockey: item.jockey || item.jockeyName || "",
    jockeyName: item.jockeyName || item.jockey || "",
    horse: item.horse || item.horseName || "",
    horseName: item.horseName || item.horse || "",
    horseBread: item.horseBread || item.horseBreed || "",
    tournament: item.tournament || item.tournamentName || "",
    raceNo: item.raceNo || item.raceLabel || "",
    raceDate: item.raceDate || "",
    raceTime: item.raceTime || "",
    location: item.location || "",
    reward: item.reward || 0,
    status: item.status || "Chờ xử lý",
    statusTone: item.statusTone || "gold",
    sentAt: item.sentAt || "",
  };
}

export const invitationService = {
  async listMine() {
    const list = await axiosClient
      .get(ENDPOINTS.invitations.me)
      .then(unwrapResponse);
    return (Array.isArray(list) ? list : []).map(mapInvitation).filter(Boolean);
  },

  async listSent() {
    const list = await axiosClient
      .get(ENDPOINTS.invitations.sent)
      .then(unwrapResponse);
    return (Array.isArray(list) ? list : []).map(mapInvitation).filter(Boolean);
  },

  async create(payload) {
    const item = await axiosClient
      .post(ENDPOINTS.invitations.list, payload)
      .then(unwrapResponse);
    return mapInvitation(item);
  },

  async respond(id, action) {
    const item = await axiosClient
      .patch(ENDPOINTS.invitations.respond(id), { action })
      .then(unwrapResponse);
    return mapInvitation(item);
  },
};
