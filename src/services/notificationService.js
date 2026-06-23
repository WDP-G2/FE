import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

function normalizePage(page) {
  if (Array.isArray(page)) {
    return {
      content: page,
      totalElements: page.length,
      totalPages: 1,
      number: 0,
      size: page.length,
    }
  }

  return {
    content: Array.isArray(page?.content) ? page.content : [],
    totalElements: Number(page?.totalElements ?? 0),
    totalPages: Number(page?.totalPages ?? 0),
    number: Number(page?.number ?? 0),
    size: Number(page?.size ?? 0),
  }
}

export function mapNotification(notification) {
  return {
    id: notification?.id,
    type: notification?.type,
    title: notification?.title || 'Thông báo',
    message: notification?.message || notification?.content || '',
    readStatus: notification?.readStatus,
    read: notification?.readStatus === 'READ' || notification?.read === true,
    createdAt: notification?.createdAt,
    metadata: notification?.metadata,
    raw: notification,
  }
}

export const notificationService = {
  async getMyNotifications(params = {}) {
    const page = await axiosClient
      .get(ENDPOINTS.notifications.list, { params })
      .then(unwrapResponse)
    const normalized = normalizePage(page)
    return {
      ...normalized,
      content: normalized.content.map(mapNotification),
    }
  },

  async getUnreadCount() {
    const data = await axiosClient.get(ENDPOINTS.notifications.unreadCount).then(unwrapResponse)
    return Number(data?.count ?? data?.unreadCount ?? data ?? 0)
  },

  async markRead(id) {
    const data = await axiosClient.put(ENDPOINTS.notifications.markRead(id)).then(unwrapResponse)
    return mapNotification(data)
  },

  async markAllRead() {
    const data = await axiosClient.put(ENDPOINTS.notifications.markAllRead).then(unwrapResponse)
    return Number(data?.count ?? data?.unreadCount ?? data ?? 0)
  },
}
