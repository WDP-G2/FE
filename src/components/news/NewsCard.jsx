import { Link } from 'react-router-dom'
import { ArrowRight, Calendar } from 'lucide-react'

function clampStyle(lines) {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function NewsCard({ news }) {
  return (
    <Link
      to={`/news/${news.id}`}
      className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:border-[#D4A017]/30 hover:shadow-2xl"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={news.thumbnail}
          alt={news.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-gradient-to-r from-[#D4A017] to-[#B8941F] px-4 py-1.5 text-xs font-bold text-white shadow-lg">
            {news.category}
          </span>
        </div>

        {news.featured && (
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
              Nổi bật
            </span>
          </div>
        )}
      </div>

      <div className="p-7">
        <div className="mb-4 flex items-center space-x-2 text-sm text-[#1E3A5F]/60">
          <Calendar className="h-4 w-4 text-[#D4A017]" />
          <span className="font-medium">{formatDate(news.createdAt)}</span>
        </div>

        <h3
          className="mb-4 text-2xl font-bold leading-tight text-[#1E3A5F] transition-colors group-hover:text-[#D4A017]"
          style={clampStyle(2)}
        >
          {news.title}
        </h3>

        <p className="mb-5 leading-relaxed text-[#1E3A5F]/70" style={clampStyle(3)}>
          {news.shortDescription}
        </p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1 font-bold text-[#D4A017] transition-all group-hover:gap-2">
            <span>Đọc thêm</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
