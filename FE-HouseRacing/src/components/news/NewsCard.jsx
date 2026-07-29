import { Link } from 'react-router-dom'
import { ArrowRight, Calendar } from 'lucide-react'
import NewsImage from '@/components/news/NewsImage'
import { NEWS_IMAGE_PRESETS } from '@/utils/cloudinary'
import { formatDisplayDate } from '@/utils/dateFormat'

function clampStyle(lines) {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }
}

export default function NewsCard({ news, compact = false }) {
  return (
    <Link
      to={`/news/${news.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#1E3A5F]/8 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D4A017]/30 hover:shadow-md"
    >
      <div className={`relative overflow-hidden ${compact ? 'h-44' : 'h-52'}`}>
        <NewsImage
          src={news.imageUrl || news.thumbnail}
          alt={news.title}
          preset={NEWS_IMAGE_PRESETS.card}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A5F]/50 via-transparent to-transparent" />
      </div>

      <div className={compact ? 'flex flex-1 flex-col p-5' : 'flex flex-1 flex-col p-6'}>
        <div className="mb-2 flex items-center gap-1.5 text-xs text-[#1E3A5F]/55">
          <Calendar className="h-3.5 w-3.5 text-[#D4A017]" />
          <span>{formatDisplayDate(news.createdAt)}</span>
        </div>

        <h3
          className={`mb-2 font-bold leading-snug text-[#1E3A5F] transition-colors group-hover:text-[#D4A017] ${
            compact ? 'text-lg' : 'text-xl'
          }`}
          style={clampStyle(2)}
        >
          {news.title}
        </h3>

        <p
          className="mb-4 flex-1 text-sm leading-relaxed text-[#1E3A5F]/65"
          style={clampStyle(compact ? 2 : 3)}
        >
          {news.shortDescription}
        </p>

        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#D4A017]">
          Đọc thêm
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
