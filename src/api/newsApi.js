import api from '@/api/axios'

const FALLBACK_THUMBNAIL =
  'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'

function unwrap(res) {
  const body = res.data
  if (body && typeof body === 'object' && 'success' in body) {
    if (!body.success) throw new Error(body.message || 'Request failed')
    return body.data
  }
  return body
}

/** Map BE NewsArticleResponse → shape used by FE components */
export function mapNewsArticle(article) {
  if (!article) return null

  const publishedAt = article.publishedAt ?? article.createdAt

  return {
    id: String(article.id),
    title: article.title ?? '',
    shortDescription: article.summary ?? '',
    content: article.content ?? '',
    thumbnail: article.imageUrl || FALLBACK_THUMBNAIL,
    category: article.category || 'Tin tức',
    author: article.createdBy || 'Ban quản trị',
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

export const newsApi = {
  /** Public: GET /news/all — Admin: GET /admin/news (cần token ADMIN) */
  async getAllNews(params = {}) {
    const list = params.admin
      ? await api.get('/admin/news').then(unwrap)
      : await api.get('/news/all').then(unwrap)

    const mapped = (Array.isArray(list) ? list : []).map(mapNewsArticle).filter(Boolean)
    return { data: applyFilters(mapped, params) }
  },

  /** Public: GET /news/{id} */
  async getNewsById(id) {
    const article = await api.get(`/news/${id}`).then(unwrap)
    const mapped = mapNewsArticle(article)
    if (!mapped) throw new Error('News not found')
    return { data: mapped }
  },

  /** Public: GET /news?featured=true */
  async getFeaturedNews(limit = 3) {
    const list = await api
      .get('/news', { params: { featured: true } })
      .then(unwrap)

    const mapped = (Array.isArray(list) ? list : []).map(mapNewsArticle).filter(Boolean)
    return { data: mapped.slice(0, limit) }
  },

  /** Public: cùng category với bài hiện tại */
  async getRelatedNews(newsId, limit = 3) {
    const current = await api.get(`/news/${newsId}`).then(unwrap)
    const category = current?.category

    const list = category
      ? await api.get('/news', { params: { category } }).then(unwrap)
      : await api.get('/news/all').then(unwrap)

    const mapped = (Array.isArray(list) ? list : [])
      .map(mapNewsArticle)
      .filter((item) => item && item.id !== String(newsId))

    return { data: mapped.slice(0, limit) }
  },
}
