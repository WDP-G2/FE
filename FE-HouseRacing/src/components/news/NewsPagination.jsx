import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getVisiblePageNumbers } from '@/utils/pagination'

export default function NewsPagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = getVisiblePageNumbers(page, totalPages)

  return (
    <nav
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
      aria-label="Phân trang tin tức"
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-11 items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#1E3A5F] transition hover:border-[#D4A017]/40 hover:text-[#D4A017] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Trước
      </button>

      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          type="button"
          onClick={() => onPageChange(pageNumber)}
          aria-current={pageNumber === page ? 'page' : undefined}
          className={`inline-flex h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
            pageNumber === page
              ? 'border-[#D4A017] bg-[#D4A017] text-white shadow-md'
              : 'border-gray-200 bg-white text-[#1E3A5F] hover:border-[#D4A017]/40 hover:text-[#D4A017]'
          }`}
        >
          {pageNumber}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex h-11 items-center gap-1 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-[#1E3A5F] transition hover:border-[#D4A017]/40 hover:text-[#D4A017] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sau
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
