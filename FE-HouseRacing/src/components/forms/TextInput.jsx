export default function TextInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  id,
  autoComplete,
}) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#1E3A5F] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-3 rounded-xl border bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 transition ${
            error ? 'border-red-300' : 'border-gray-200'
          }`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
