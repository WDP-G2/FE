import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder = '••••••••',
  error,
  id = 'password',
}) {
  const [show, setShow] = useState(false)

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#1E3A5F] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 transition ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1E3A5F]"
          aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
