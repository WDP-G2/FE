import GoogleSignInCompact from '@/components/auth/GoogleSignInCompact'
import FacebookSignInButton from '@/components/auth/FacebookSignInButton'

export default function SocialAuthButtons({
  mode = 'login',
  onGoogleSuccess,
  onFacebookSuccess,
  disabled = false,
}) {
  const label = mode === 'register' ? 'Hoặc đăng ký với' : 'Hoặc đăng nhập với'

  return (
    <>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-[#1E3A5F]/60">{label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GoogleSignInCompact onSuccess={onGoogleSuccess} disabled={disabled} />
        <FacebookSignInButton onSuccess={onFacebookSuccess} disabled={disabled} />
      </div>
    </>
  )
}
