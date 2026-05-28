import axiosClient from "@/api/axiosClient";
import { ENDPOINTS } from "@/api/endpoints";
import { unwrapResponse } from "@/api/response";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1501373426804-4d9b6b9c0f36?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200";

function mapHorse(item) {
  if (!item) return null;

  return {
    id: String(item.id),
    slug: item.slug || "",
    name: item.name || "",
    breed: item.breed || "",
    gender: item.gender || "",
    birthDate: item.birthDate || "",
    ownerName: item.ownerName || "",
    imageUrl: item.imageUrl || FALLBACK_IMAGE,
    licenseImageUrl: item.licenseImageUrl || "",
    healthStatus: item.healthStatus || "Chưa cập nhật",
    wins: Number(item.wins || 0),
    races: Number(item.races || 0),
    achievements: Array.isArray(item.achievements) ? item.achievements : [],
    history: Array.isArray(item.history) ? item.history : [],
    racingStatus: item.racingStatus || "can-race",
    canRace:
      item.canRace !== undefined
        ? Boolean(item.canRace)
        : item.racingStatus !== "cannot-race",
    notes: item.notes || "",
    createdBy: item.createdBy || "",
    updatedBy: item.updatedBy || "",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function appendHorsePayload(formData, payload = {}, options = {}) {
  if (payload.name !== undefined) formData.append("name", payload.name ?? "");
  if (payload.breed !== undefined)
    formData.append("breed", payload.breed ?? "");
  if (payload.gender !== undefined)
    formData.append("gender", payload.gender ?? "");
  if (payload.birthDate !== undefined)
    formData.append("birthDate", payload.birthDate ?? "");
  if (payload.ownerName !== undefined)
    formData.append("ownerName", payload.ownerName ?? "");
  if (payload.notes !== undefined)
    formData.append("notes", payload.notes ?? "");

  if (options.isEdit) {
    if (payload.healthStatus !== undefined) {
      formData.append("healthStatus", payload.healthStatus ?? "");
    }
    if (payload.racingStatus !== undefined) {
      formData.append("racingStatus", payload.racingStatus ?? "");
    }
  } else if (payload.racingStatus !== undefined) {
    formData.append("racingStatus", payload.racingStatus ?? "");
  }

  if (options.imageFile) formData.append("image", options.imageFile);
  if (options.licenseFile) formData.append("licenseImage", options.licenseFile);
}

function toFormData(payload, options = {}) {
  const formData = new FormData();
  appendHorsePayload(formData, payload, options);
  return formData;
}

export const horseService = {
  async listMine(params = {}) {
    const list = await axiosClient
      .get(ENDPOINTS.horses.list, { params: { ...params, mine: true } })
      .then(unwrapResponse);

    return (Array.isArray(list) ? list : []).map(mapHorse).filter(Boolean);
  },

  async getById(id) {
    const item = await axiosClient
      .get(ENDPOINTS.horses.byId(id))
      .then(unwrapResponse);
    const mapped = mapHorse(item);
    if (!mapped) throw new Error("Horse not found");
    return mapped;
  },

  async create(payload, imageFile, licenseFile) {
    const formData = toFormData(payload, {
      imageFile,
      licenseFile,
      isEdit: false,
    });
    const item = await axiosClient
      .post(ENDPOINTS.horses.list, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrapResponse);

    const mapped = mapHorse(item);
    if (!mapped) throw new Error("Horse not found");
    return mapped;
  },

  async update(id, payload, imageFile, licenseFile) {
    const formData = toFormData(payload, {
      imageFile,
      licenseFile,
      isEdit: true,
    });
    const item = await axiosClient
      .patch(ENDPOINTS.horses.byId(id), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrapResponse);

    const mapped = mapHorse(item);
    if (!mapped) throw new Error("Horse not found");
    return mapped;
  },

  async remove(id) {
    await axiosClient.delete(ENDPOINTS.horses.byId(id)).then(unwrapResponse);
  },
};
