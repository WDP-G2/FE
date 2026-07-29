import { useState } from 'react'
import { Search } from 'lucide-react'

export default function NewsSearch({ onSearch, compact = false }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch(query)
  }

  const handleChange = (event) => {
    const value = event.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E3A5F]/40" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Tìm kiếm tin tức..."
          className={
            compact
              ? 'h-11 w-full rounded-xl border border-[#1E3A5F]/10 bg-[#FAFAFA] pl-11 pr-4 text-sm text-[#1E3A5F] outline-none transition placeholder:text-[#1E3A5F]/40 focus:border-[#D4A017] focus:bg-white focus:ring-2 focus:ring-[#D4A017]/15'
              : 'w-full rounded-2xl border border-[#1E3A5F]/10 bg-white py-4 pl-12 pr-5 text-base text-[#1E3A5F] shadow-sm outline-none transition placeholder:text-[#1E3A5F]/40 focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/15'
          }
        />
      </div>
    </form>
  )
}
