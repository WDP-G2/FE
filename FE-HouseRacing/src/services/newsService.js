import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { FALLBACK_NEWS_IMAGE } from '@/utils/cloudinary'
import { cachedRequest, invalidateCachedRequest } from '@/utils/requestCache'

const multipartHeaders = {
  'Content-Type': 'multipart/form-data',
}

/** Danh mục mặc định gửi BE khi admin không chọn danh mục. */
export const DEFAULT_NEWS_CATEGORY = 'Tin tức'

function buildNewsFormData(payload, imageFile) {
  const formData = new FormData()

  formData.append('title', payload.title)
  formData.append('summary', payload.summary || '')
  formData.append('content', payload.content)
  formData.append('category', payload.category)
  formData.append('featured', !!payload.featured)

  if (payload.publishedAt) {
    formData.append('publishedAt', payload.publishedAt)
  }

  if (imageFile) {
    formData.append('image', imageFile)
  }

  return formData
}

function mapNewsArticle(article) {
  if (!article) return null

  return {
    id: String(article.id),
    title: article.title || '',
    shortDescription: article.summary || '',
    content: article.content || '',
    imageUrl: article.imageUrl || '',
    thumbnail: article.imageUrl || FALLBACK_NEWS_IMAGE,
    category: article.category || 'Tin tuc',
    author: article.createdBy || 'Ban quan tri',
    createdAt: article.publishedAt || article.createdAt,
    updatedAt: article.updatedAt,
    featured: !!article.featured,
    status: 'published',
  }
}

function mapNewsList(list) {
  return (list || []).map(mapNewsArticle).filter(Boolean)
}

function filterNews(newsList, params = {}) {
  return newsList.filter((news) => {
    if (params.category && news.category !== params.category) {
      return false
    }

    if (
      typeof params.featured === 'boolean' &&
      news.featured !== params.featured
    ) {
      return false
    }

    if (params.search) {
      const keyword = params.search.toLowerCase()

      const found =
        news.title.toLowerCase().includes(keyword) ||
        news.shortDescription.toLowerCase().includes(keyword) ||
        news.category.toLowerCase().includes(keyword) ||
        news.author.toLowerCase().includes(keyword)

      if (!found) return false
    }

    return true
  })
}

export const newsService = {
  async getAllNews(params = {}) {
    const endpoint = params.admin
      ? ENDPOINTS.news.adminList
      : ENDPOINTS.news.all

    const useAdminCache = params.admin && !params.search
    const list = useAdminCache
      ? await cachedRequest('admin:news', () => axiosClient.get(endpoint).then(unwrapResponse))
      : await axiosClient.get(endpoint).then(unwrapResponse)

    return {
      data: filterNews(mapNewsList(list), params),
    }
  },

  async getNewsById(id) {
    const article = await axiosClient
      .get(ENDPOINTS.news.byId(id))
      .then(unwrapResponse)

    return {
      data: mapNewsArticle(article),
    }
  },

  async getAdminNewsById(id) {
    const article = await axiosClient
      .get(ENDPOINTS.news.adminById(id))
      .then(unwrapResponse)

    return {
      data: mapNewsArticle(article),
    }
  },

  async getFeaturedNews(limit = 3) {
    const list = await axiosClient
      .get(ENDPOINTS.news.list, {
        params: { featured: true },
      })
      .then(unwrapResponse)

    return {
      data: mapNewsList(list).slice(0, limit),
    }
  },

  async getRelatedNews(newsId, limit = 3) {
    const list = await axiosClient.get(ENDPOINTS.news.all).then(unwrapResponse)

    return {
      data: mapNewsList(list)
        .filter((item) => item.id !== String(newsId))
        .slice(0, limit),
    }
  },

  async createNews(payload, imageFile) {
    const body = {
      title: payload.title,
      summary: payload.summary || payload.shortDescription || '',
      content: payload.content,
      category: payload.category || DEFAULT_NEWS_CATEGORY,
      featured: false,
      publishedAt:
        payload.publishedAt ||
        new Date().toISOString().slice(0, 19),
    }

    const article = imageFile
      ? await axiosClient
          .post(
            ENDPOINTS.news.adminList,
            buildNewsFormData(body, imageFile),
            { headers: multipartHeaders }
          )
          .then(unwrapResponse)
      : await axiosClient
          .post(ENDPOINTS.news.adminList, body)
          .then(unwrapResponse)

    invalidateCachedRequest('admin:news')
    return {
      data: mapNewsArticle(article),
    }
  },

  async updateNews(id, payload, imageFile) {
    const body = {
      title: payload.title,
      summary: payload.summary || payload.shortDescription || '',
      content: payload.content,
      category: payload.category || DEFAULT_NEWS_CATEGORY,
      featured: false,
    }

    const article = imageFile
      ? await axiosClient
          .put(
            ENDPOINTS.news.adminById(id),
            buildNewsFormData(body, imageFile),
            { headers: multipartHeaders }
          )
          .then(unwrapResponse)
      : await axiosClient
          .put(ENDPOINTS.news.adminById(id), body)
          .then(unwrapResponse)

    invalidateCachedRequest('admin:news')
    return {
      data: mapNewsArticle(article),
    }
  },

  async deleteNews(id) {
    await axiosClient
      .delete(ENDPOINTS.news.adminById(id))
      .then(unwrapResponse)
    invalidateCachedRequest('admin:news')
  },
}