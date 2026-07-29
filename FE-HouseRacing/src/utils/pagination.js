/** Số bài tin tức tối đa trên mỗi trang (lưới 3 cột). */
export const DEFAULT_NEWS_PAGE_SIZE = 9

/**
 * Phân trang client-side cho danh sách.
 * @param {Array} items
 * @param {{ page?: number, pageSize?: number }} options
 */
export function paginateItems(items, { page = 1, pageSize = DEFAULT_NEWS_PAGE_SIZE } = {}) {
  const list = Array.isArray(items) ? items : []
  const size = Math.max(1, Number(pageSize) || DEFAULT_NEWS_PAGE_SIZE)
  const totalItems = list.length
  const totalPages = Math.max(1, Math.ceil(totalItems / size))
  const safePage = Math.min(Math.max(1, Number(page) || 1), totalPages)
  const start = (safePage - 1) * size

  return {
    items: list.slice(start, start + size),
    page: safePage,
    pageSize: size,
    totalItems,
    totalPages,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  }
}

/** Các số trang hiển thị trên thanh phân trang (tối đa 5 nút). */
export function getVisiblePageNumbers(currentPage, totalPages, maxButtons = 5) {
  const total = Math.max(1, totalPages)
  const current = Math.min(Math.max(1, currentPage), total)
  const count = Math.min(maxButtons, total)
  const half = Math.floor(count / 2)
  let start = Math.max(1, current - half)
  let end = start + count - 1

  if (end > total) {
    end = total
    start = Math.max(1, end - count + 1)
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
}
