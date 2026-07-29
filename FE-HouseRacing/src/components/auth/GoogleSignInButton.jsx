import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'sonner'

export default function GoogleSignInButton({ onSuccess, disabled = false }) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className="w-full py-3 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-400 font-semibold cursor-not-allowed"
      >
        Đang xử lý...
      </button>
    )
  }

  return (
    <div className="w-full google-signin-btn flex justify-center">
      <GoogleLogin
        onSuccess={(response) => {
          if (response?.credential) {
            onSuccess(response.credential)
          } else {
            toast.error('Không lấy được token Google')
          }
        }}
        onError={() => {
          toast.error('Đăng nhập Google thất bại')
        }}
        theme="outline"
        size="large"
        text="signin_with"
        shape="rectangular"
        locale="vi"
        width="360"
      />
    </div>
  )
}
