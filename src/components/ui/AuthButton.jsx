export default function AuthButton({
  children,
  loading,
  disabled = false,
  type = 'submit',
  variant = 'primary',
  onClick,
  className = '',
}) {
  const base =
    'w-full py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
  const variants = {
    primary:
      'bg-gradient-to-r from-[#D4A017] to-[#B8860B] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]',
    outline:
      'border-2 border-gray-200 bg-white text-[#1E3A5F] hover:border-[#D4A017] hover:bg-[#FFF8F0]',
    ghost: 'text-[#1E3A5F] hover:bg-gray-50',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? (
        <>
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Đang xử lý...
        </>
      ) : (
        children
      )}
    </button>
  )
}
