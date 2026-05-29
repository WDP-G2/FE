import axiosClient from "@/api/axiosClient";
import { unwrapResponse } from "@/api/response";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

/** Map BE NewsArticleResponse -> shape used by FE components */
export function mapNewsArticle(article) {
  if (!article) return null;

  const publishedAt = article.publishedAt ?? article.createdAt;

  return {
    id: String(article.id),
    title: article.title ?? "",
    shortDescription: article.summary ?? "",
    content: article.content ?? "",
    thumbnail: article.imageUrl || article.thumbnail || FALLBACK_THUMBNAIL,
    category: article.category || "Tin tức",
    author:
      article.author ||
      article.authorName ||
      article.createdBy ||
      "Ban quản trị",
    createdAt: publishedAt,
    updatedAt: article.updatedAt,
    featured: Boolean(article.featured),
    status: article.status ?? "published",
  };
}

function matchesSearch(news, search) {
  if (!search?.trim()) return true;

  const query = search.trim().toLowerCase();
  return (
    news.title.toLowerCase().includes(query) ||
    news.shortDescription.toLowerCase().includes(query) ||
    news.category.toLowerCase().includes(query) ||
    news.author.toLowerCase().includes(query)
  );
}

function applyFilters(items, params = {}) {
  let filtered = [...items];

  if (params.category) {
    filtered = filtered.filter((item) => item.category === params.category);
  }

  if (typeof params.featured === "boolean") {
    filtered = filtered.filter((item) => item.featured === params.featured);
  }

  if (params.search) {
    filtered = filtered.filter((item) => matchesSearch(item, params.search));
  }

  return filtered;
}

export const newsService = {
  async getAllNews(params = {}) {
    const list = params.admin
      ? await axiosClient
          .get("/news", { params: { admin: true } })
          .then(unwrapResponse)
      : await axiosClient.get("/news").then(unwrapResponse);

    const mapped = (Array.isArray(list) ? list : [])
      .map(mapNewsArticle)
      .filter(Boolean);
    return { data: applyFilters(mapped, params) };
  },

  async getNewsById(id) {
    const article = await axiosClient.get(`/news/${id}`).then(unwrapResponse);
    const mapped = mapNewsArticle(article);
    if (!mapped) throw new Error("News not found");
    return { data: mapped };
  },

  async getFeaturedNews(limit = 3) {
    const list = await axiosClient
      .get("/news", { params: { featured: true } })
      .then(unwrapResponse);

    const mapped = (Array.isArray(list) ? list : [])
      .map(mapNewsArticle)
      .filter(Boolean);
    return { data: mapped.slice(0, limit) };
  },

  async getRelatedNews(newsId, limit = 3) {
    const current = await axiosClient
      .get(`/news/${newsId}`)
      .then(unwrapResponse);
    const category = current?.category;

    const list = category
      ? await axiosClient
          .get("/news", { params: { category } })
          .then(unwrapResponse)
      : await axiosClient.get("/news").then(unwrapResponse);

    const mapped = (Array.isArray(list) ? list : [])
      .map(mapNewsArticle)
      .filter((item) => item && item.id !== String(newsId));

    return { data: mapped.slice(0, limit) };
  },

  async getAdminNewsById(id) {
    const article = await axiosClient
      .get(`/news/${id}`, { params: { admin: true } })
      .then(unwrapResponse);
    const mapped = mapNewsArticle(article);
    if (!mapped) throw new Error("News not found");
    return { data: mapped };
  },

  async createNews(payload) {
    const body = {
      title: payload.title,
      summary: payload.summary ?? payload.shortDescription ?? "",
      content: payload.content,
      category: payload.category,
      featured: Boolean(payload.featured),
      status: payload.status ?? "published",
      thumbnail: payload.thumbnail || payload.imageUrl || "",
      imageUrl: payload.thumbnail || payload.imageUrl || "",
    };

    const article = await axiosClient.post("/news", body).then(unwrapResponse);
    return { data: mapNewsArticle(article) };
  },

  async updateNews(id, payload) {
    const body = {
      title: payload.title,
      summary: payload.summary ?? payload.shortDescription ?? "",
      content: payload.content,
      category: payload.category,
      featured: Boolean(payload.featured),
      status: payload.status,
      thumbnail: payload.thumbnail || payload.imageUrl,
      imageUrl: payload.thumbnail || payload.imageUrl,
    };

    const article = await axiosClient
      .patch(`/news/${id}`, body)
      .then(unwrapResponse);
    return { data: mapNewsArticle(article) };
  },

  async deleteNews(id) {
    await axiosClient.delete(`/news/${id}`);
  },
};
