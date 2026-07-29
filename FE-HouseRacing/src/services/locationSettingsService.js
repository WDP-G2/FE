import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

function mapProvince(province) {
  return {
    id: String(province?.id ?? ''),
    name: province?.name ?? '',
    code: province?.code ?? '',
    active: province?.active !== false,
    raw: province,
  }
}

function mapVenue(venue) {
  return {
    id: String(venue?.id ?? ''),
    provinceId: String(venue?.provinceId ?? ''),
    provinceName: venue?.provinceName ?? '',
    name: venue?.name ?? '',
    address: venue?.address ?? '',
    active: venue?.active !== false,
    raw: venue,
  }
}

export const locationSettingsService = {
  async getProvinces() {
    const provinces = await axiosClient.get(ENDPOINTS.locationSettings.provinces).then(unwrapResponse)
    return { data: (Array.isArray(provinces) ? provinces : []).map(mapProvince).filter((item) => item.id) }
  },

  async createProvince(payload) {
    const province = await axiosClient.post(ENDPOINTS.locationSettings.provinces, payload).then(unwrapResponse)
    return { data: mapProvince(province), raw: province }
  },

  async updateProvince(id, payload) {
    const province = await axiosClient.put(ENDPOINTS.locationSettings.provinceById(id), payload).then(unwrapResponse)
    return { data: mapProvince(province), raw: province }
  },

  async deleteProvince(id) {
    return axiosClient.delete(ENDPOINTS.locationSettings.provinceById(id)).then(unwrapResponse)
  },

  async updateProvinceActive(id, active) {
    const province = await axiosClient
      .put(ENDPOINTS.locationSettings.provinceActive(id), null, { params: { active } })
      .then(unwrapResponse)
    return { data: mapProvince(province), raw: province }
  },

  async getVenuesByProvince(provinceId) {
    const venues = await axiosClient.get(ENDPOINTS.locationSettings.provinceVenues(provinceId)).then(unwrapResponse)
    return { data: (Array.isArray(venues) ? venues : []).map(mapVenue).filter((item) => item.id) }
  },

  async createVenue(provinceId, payload) {
    const venue = await axiosClient.post(ENDPOINTS.locationSettings.provinceVenues(provinceId), payload).then(unwrapResponse)
    return { data: mapVenue(venue), raw: venue }
  },

  async updateVenue(id, payload) {
    const venue = await axiosClient.put(ENDPOINTS.locationSettings.venueById(id), payload).then(unwrapResponse)
    return { data: mapVenue(venue), raw: venue }
  },

  async deleteVenue(id) {
    return axiosClient.delete(ENDPOINTS.locationSettings.venueById(id)).then(unwrapResponse)
  },

  async updateVenueActive(id, active) {
    const venue = await axiosClient
      .put(ENDPOINTS.locationSettings.venueActive(id), null, { params: { active } })
      .then(unwrapResponse)
    return { data: mapVenue(venue), raw: venue }
  },

  async getTournamentVenues(tournamentId) {
    const venues = await axiosClient.get(ENDPOINTS.tournaments.adminVenues(tournamentId)).then(unwrapResponse)
    return { data: (Array.isArray(venues) ? venues : []).map(mapVenue).filter((item) => item.id) }
  },
}
