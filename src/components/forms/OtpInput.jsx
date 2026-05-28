import { useRef, useEffect } from 'react'

export default function OtpInput({ length = 6, value, onChange }) {
  const refs = useRef([])

  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  const digits = value.padEnd(length, ' ').slice(0, length).split('')

  const update = (next) => {
    const clean = next.replace(/\D/g, '').slice(0, length)
    onChange(clean)
  }

  const handleChange = (index, char) => {
    if (!/^\d?$/.test(char)) return
    const arr = digits.map((d) => (d === ' ' ? '' : d))
    arr[index] = char
    const joined = arr.join('').replace(/\s/g, '')
    update(joined)
    if (char && index < length - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    update(pasted)
    const focusIndex = Math.min(pasted.length, length - 1)
    refs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] === ' ' ? '' : digits[i]}
          onChange={(e) => handleChange(i, e.target.value.slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/50 focus:border-[#D4A017]"
        />
      ))}
    </div>
  )
}
