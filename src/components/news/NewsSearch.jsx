import { useState } from 'react'
import { Search } from 'lucide-react'

export default function NewsSearch({ onSearch }) {
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
      <div className="group relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#D4A017]/20 to-[#1E3A5F]/20 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
        <div className="relative">
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1E3A5F]/40 transition-colors group-focus-within:text-[#D4A017]" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Tim kiem tin tuc..."
            className="w-full rounded-2xl border-2 border-gray-200 bg-white py-5 pl-14 pr-6 text-lg font-medium text-[#1E3A5F] shadow-lg outline-none transition-all placeholder:text-[#1E3A5F]/40 hover:shadow-xl focus:border-[#D4A017] focus:ring-4 focus:ring-[#D4A017]/10"
          />
        </div>
      </div>
    </form>
  )
}
