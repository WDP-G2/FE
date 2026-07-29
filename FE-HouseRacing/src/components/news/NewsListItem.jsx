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

export default function NewsListItem({ news }) {
  return (
    <Link
      to={`/news/${news.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[#1E3A5F]/8 bg-white shadow-sm transition-all duration-300 hover:border-[#D4A017]/35 hover:shadow-lg sm:flex-row"
    >
      <div className="relative h-52 w-full shrink-0 overflow-hidden sm:h-auto sm:w-72 md:w-80">
        <NewsImage
          src={news.imageUrl || news.thumbnail}
          alt={news.title}
          preset={NEWS_IMAGE_PRESETS.card}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A5F]/20 to-transparent sm:bg-gradient-to-t sm:from-[#1E3A5F]/40" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center p-6 sm:p-7">
        <div className="mb-3 flex items-center gap-1.5 text-sm text-[#1E3A5F]/55">
          <Calendar className="h-4 w-4 text-[#D4A017]" />
          {formatDisplayDate(news.createdAt)}
        </div>

        <h2
          className="mb-3 text-xl font-bold leading-snug text-[#1E3A5F] transition-colors group-hover:text-[#D4A017] md:text-2xl"
          style={clampStyle(2)}
        >
          {news.title}
        </h2>

        <p className="mb-5 text-[#1E3A5F]/65 leading-relaxed" style={clampStyle(2)}>
          {news.shortDescription}
        </p>

        <span className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#D4A017] transition-all group-hover:gap-3">
          Đọc bài viết
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  )
}
