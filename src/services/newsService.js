import axiosClient from '@/api/axiosClient'
import { unwrapResponse } from '@/api/response'

const FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'

/** Map BE NewsArticleResponse -> shape used by FE components */
export function mapNewsArticle(article) {
  if (!article) return null

  const publishedAt = article.publishedAt ?? article.createdAt

  return {
    id: String(article.id),
    title: article.title ?? '',
    shortDescription: article.summary ?? '',
    content: article.content ?? '',
    thumbnail: article.imageUrl || FALLBACK_THUMBNAIL,
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

export const newsService = {
  async getAllNews(params = {}) {
    const list = params.admin
      ? await axiosClient.get('/admin/news').then(unwrapResponse)
      : await axiosClient.get('/news/all').then(unwrapResponse)

    const mapped = (Array.isArray(list) ? list : []).map(mapNewsArticle).filter(Boolean)
    return { data: applyFilters(mapped, params) }
  },

  async getNewsById(id) {
    const article = await axiosClient.get(`/news/${id}`).then(unwrapResponse)
    const mapped = mapNewsArticle(article)
    if (!mapped) throw new Error('News not found')
    return { data: mapped }
  },

  async getFeaturedNews(limit = 3) {
    const list = await axiosClient
      .get('/news', { params: { featured: true } })
      .then(unwrapResponse)

    const mapped = (Array.isArray(list) ? list : []).map(mapNewsArticle).filter(Boolean)
    return { data: mapped.slice(0, limit) }
  },

  async getRelatedNews(newsId, limit = 3) {
    const current = await axiosClient.get(`/news/${newsId}`).then(unwrapResponse)
    const category = current?.category

    const list = category
      ? await axiosClient.get('/news', { params: { category } }).then(unwrapResponse)
      : await axiosClient.get('/news/all').then(unwrapResponse)

    const mapped = (Array.isArray(list) ? list : [])
      .map(mapNewsArticle)
      .filter((item) => item && item.id !== String(newsId))

    return { data: mapped.slice(0, limit) }
  },

  async getAdminNewsById(id) {
    const article = await axiosClient.get(`/admin/news/${id}`).then(unwrapResponse)
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
      const formData = new FormData()
      formData.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }))
      formData.append('image', imageFile)
      const article = await axiosClient
        .post('/admin/news', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(unwrapResponse)
      return { data: mapNewsArticle(article) }
    }

    const article = await axiosClient.post('/admin/news', body).then(unwrapResponse)
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
      const formData = new FormData()
      formData.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }))
      formData.append('image', imageFile)
      const article = await axiosClient
        .put(`/admin/news/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(unwrapResponse)
      return { data: mapNewsArticle(article) }
    }

    const article = await axiosClient.put(`/admin/news/${id}`, body).then(unwrapResponse)
    return { data: mapNewsArticle(article) }
  },

  async deleteNews(id) {
    await axiosClient.delete(`/admin/news/${id}`).then(unwrapResponse)
  },
}
