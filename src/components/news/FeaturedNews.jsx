import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { newsApi } from '@/api/newsApi'
import NewsCard from '@/components/news/NewsCard'

export default function FeaturedNews() {
  const [featuredNews, setFeaturedNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeaturedNews() {
      try {
        setLoading(true)
        const response = await newsApi.getFeaturedNews()
        setFeaturedNews(response.data)
      } catch (error) {
        console.error('Error loading featured news:', error)
        toast.error('Khong the tai tin tuc noi bat')
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedNews()
  }, [])

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAFA] to-white py-24">
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="overflow-hidden rounded-2xl bg-white shadow-sm animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="space-y-3 p-6">
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="h-6 rounded bg-gray-200" />
                <div className="h-4 rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (featuredNews.length === 0) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFAFA] to-white py-24">
      <div className="absolute left-10 top-20 h-64 w-64 rounded-full bg-[#D4A017] opacity-5 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-[#1E3A5F] opacity-5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center space-x-3">
            <Star className="h-10 w-10 fill-[#D4A017] text-[#D4A017]" />
            <h2 className="text-5xl font-bold text-[#1E3A5F]">Tin tuc noi bat</h2>
            <Star className="h-10 w-10 fill-[#D4A017] text-[#D4A017]" />
          </div>
          <div className="mx-auto h-1.5 w-32 rounded-full bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {featuredNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </div>
    </section>
  )
}
