import { GoogleLogin } from '@react-oauth/google'
import { Globe } from 'lucide-react'
import { toast } from 'sonner'

export default function GoogleSignInCompact({ onSuccess, disabled = false }) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center space-x-2 py-3 bg-gray-50 border border-gray-200 rounded-xl opacity-60 cursor-not-allowed"
      >
        <Globe className="w-5 h-5 text-[#1E3A5F]/40" />
        <span className="text-[#1E3A5F]/40 font-medium text-sm">Google</span>
      </button>
    )
  }

  return (
    <div className="relative w-full">
      <button
        type="button"
        className="w-full flex items-center justify-center space-x-2 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl hover:border-[#D4A017] hover:bg-white hover:shadow-md transition-all group pointer-events-none"
        tabIndex={-1}
        aria-hidden
      >
        <Globe className="w-5 h-5 text-[#1E3A5F]/60 group-hover:text-[#D4A017] transition-colors" />
        <span className="text-[#1E3A5F] font-medium text-sm">Google</span>
      </button>
      <div className="absolute inset-0 z-10 opacity-[0.01] google-signin-compact overflow-hidden rounded-xl">
        <GoogleLogin
          onSuccess={(response) => {
            if (response?.credential) {
              onSuccess(response.credential)
            } else {
              toast.error('Không lấy được token Google')
            }
          }}
          onError={() => toast.error('Đăng nhập Google thất bại')}
          theme="outline"
          size="large"
          text="signin_with"
          shape="rectangular"
          locale="vi"
          width="200"
        />
      </div>
    </div>
  )
}
