import { getPasswordStrength } from '@/utils/validation'

const COLORS = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']

export default function PasswordStrength({ password }) {
  const { score, label } = getPasswordStrength(password)
  if (!password) return null

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              score >= i ? COLORS[score] : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      {label && <p className="text-xs text-gray-500 mt-1">Độ mạnh: {label}</p>}
    </div>
  )
}
