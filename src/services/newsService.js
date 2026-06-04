import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { FALLBACK_NEWS_IMAGE } from '@/utils/cloudinary'

function appendIfPresent(formData, key, value) {
  if (value === undefined || value === null || value === '') return
  formData.append(key, value)
}

/** FormData khớp @ModelAttribute NewsArticleMultipartRequest trên BE */
function buildNewsFormData(payload, imageFile) {
  const formData = new FormData()

  appendIfPresent(formData, 'title', payload.title)
  appendIfPresent(formData, 'summary', payload.summary ?? payload.shortDescription)
  appendIfPresent(formData, 'content', payload.content)
  appendIfPresent(formData, 'category', payload.category)

  if (payload.featured !== undefined) {
    formData.append('featured', String(Boolean(payload.featured)))
  }

  appendIfPresent(formData, 'publishedAt', payload.publishedAt)

  if (imageFile) {
    formData.append('image', imageFile)
  }

  return formData
}

/** Map BE NewsArticleResponse -> shape used by FE components */
export function mapNewsArticle(article) {
  if (!article) return null

  const publishedAt = article.publishedAt ?? article.createdAt
  const imageUrl = article.imageUrl?.trim() || ''

  return {
    id: String(article.id),
    title: article.title ?? '',
    shortDescription: article.summary ?? '',
    content: article.content ?? '',
    imageUrl,
    thumbnail: imageUrl || FALLBACK_NEWS_IMAGE,
    category: article.category || 'Tin tuc',
    author: article.createdBy || 'Ban quan tri',
    createdAt: publishedAt,
    updatedAt: article.updatedAt,
    featured: Boolean(article.featured),
    status: 'published',
  }
}

function matchesSearch(news, search) {
  if (!search?.trim()) return true

  const query = search.trim().toLowerCase()
  return (
    news.title.toLowerCase().includes(query) ||
    news.shortDescription.toLowerCase().includes(query) ||
    news.category.toLowerCase().includes(query) ||
    news.author.toLowerCase().includes(query)
  )
}

function applyFilters(items, params = {}) {
  let filtered = [...items]

  if (params.category) {
    filtered = filtered.filter((item) => item.category === params.category)
  }

  if (typeof params.featured === 'boolean') {
    filtered = filtered.filter((item) => item.featured === params.featured)
  }

  if (params.search) {
    filtered = filtered.filter((item) => matchesSearch(item, params.search))
  }

  return filtered
}

const multipartHeaders = { 'Content-Type': 'multipart/form-data' }

export const newsService = {
  async getAllNews(params = {}) {
    const list = params.admin
      ? await axiosClient.get(ENDPOINTS.news.adminList).then(unwrapResponse)
      : await axiosClient.get(ENDPOINTS.news.all).then(unwrapResponse)

    const mapped = (Array.isArray(list) ? list : []).map(mapNewsArticle).filter(Boolean)
    return { data: applyFilters(mapped, params) }
  },

  async getNewsById(id) {
    const article = await axiosClient.get(ENDPOINTS.news.byId(id)).then(unwrapResponse)
    const mapped = mapNewsArticle(article)
    if (!mapped) throw new Error('News not found')
    return { data: mapped }
  },

  async getFeaturedNews(limit = 3) {
    const list = await axiosClient
      .get(ENDPOINTS.news.list, { params: { featured: true } })
      .then(unwrapResponse)

    const mapped = (Array.isArray(list) ? list : []).map(mapNewsArticle).filter(Boolean)
    return { data: mapped.slice(0, limit) }
  },

  async getRelatedNews(newsId, limit = 3) {
    const current = await axiosClient.get(ENDPOINTS.news.byId(newsId)).then(unwrapResponse)
    const category = current?.category

    const list = category
      ? await axiosClient.get(ENDPOINTS.news.list, { params: { category } }).then(unwrapResponse)
      : await axiosClient.get(ENDPOINTS.news.all).then(unwrapResponse)

    const mapped = (Array.isArray(list) ? list : [])
      .map(mapNewsArticle)
      .filter((item) => item && item.id !== String(newsId))

    return { data: mapped.slice(0, limit) }
  },

  async getAdminNewsById(id) {
    const article = await axiosClient.get(ENDPOINTS.news.adminById(id)).then(unwrapResponse)
    const mapped = mapNewsArticle(article)
    if (!mapped) throw new Error('News not found')
    return { data: mapped }
  },

  async createNews(payload, imageFile) {
    const body = {
      title: payload.title,
      summary: payload.summary ?? payload.shortDescription ?? '',
      content: payload.content,
      category: payload.category,
      featured: Boolean(payload.featured),
      publishedAt: payload.publishedAt ?? new Date().toISOString().slice(0, 19),
    }

    if (imageFile) {
      const article = await axiosClient
        .post(ENDPOINTS.news.adminList, buildNewsFormData(body, imageFile), {
          headers: multipartHeaders,
        })
        .then(unwrapResponse)
      return { data: mapNewsArticle(article) }
    }

    const article = await axiosClient.post(ENDPOINTS.news.adminList, body).then(unwrapResponse)
    return { data: mapNewsArticle(article) }
  },

  async updateNews(id, payload, imageFile) {
    const body = {
      title: payload.title,
      summary: payload.summary ?? payload.shortDescription ?? '',
      content: payload.content,
      category: payload.category,
      featured: Boolean(payload.featured),
    }

    if (imageFile) {
      const article = await axiosClient
        .put(ENDPOINTS.news.adminById(id), buildNewsFormData(body, imageFile), {
          headers: multipartHeaders,
        })
        .then(unwrapResponse)
      return { data: mapNewsArticle(article) }
    }

    const article = await axiosClient.put(ENDPOINTS.news.adminById(id), body).then(unwrapResponse)
    return { data: mapNewsArticle(article) }
  },

  async deleteNews(id) {
    await axiosClient.delete(ENDPOINTS.news.adminById(id)).then(unwrapResponse)
  },
}
