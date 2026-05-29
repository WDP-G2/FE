import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import TextInput from '@/components/forms/TextInput'
import PasswordInput from '@/components/forms/PasswordInput'
import AuthButton from '@/components/ui/AuthButton'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/utils/apiError'
import { getRoleHomePath, normalizeRole } from '@/utils/roleRedirect'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const loginWithFacebook = useAuthStore((s) => s.loginWithFacebook)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const redirectAfterAuth = (user) => {
    const from = location.state?.from?.pathname
    const home = from || getRoleHomePath(normalizeRole(user?.role))
    navigate(home, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Vui lòng nhập email và mật khẩu')
      return
    }
    setLoading(true)
    try {
      const { user } = await login(form)
      toast.success('Đăng nhập thành công')
      redirectAfterAuth(user)
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Sai email hoặc mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (idToken) => {
    setSocialLoading(true)
    try {
      const { user } = await loginWithGoogle(idToken)
      toast.success('Đăng nhập Google thành công')
      redirectAfterAuth(user)
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Đăng nhập Google thất bại')
    } finally {
      setSocialLoading(false)
    }
  }

  const handleFacebookSuccess = async (accessToken) => {
    setSocialLoading(true)
    try {
      const { user } = await loginWithFacebook(accessToken)
      toast.success('Đăng nhập Facebook thành công')
      redirectAfterAuth(user)
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Đăng nhập Facebook thất bại')
    } finally {
      setSocialLoading(false)
    }
  }

  const busy = loading || socialLoading

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng trở lại hệ thống quản lý giải đua ngựa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="email"
          label="Email"
          type="email"
          icon={Mail}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email@example.com"
          autoComplete="email"
        />
        <PasswordInput
          label="Mật khẩu"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer text-gray-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-[#D4A017] focus:ring-[#D4A017]"
              disabled={busy}
            />
            Ghi nhớ đăng nhập
          </label>
          <Link to="/forgot-password" className="text-[#D4A017] hover:underline font-medium">
            Quên mật khẩu?
          </Link>
        </div>

        <AuthButton loading={loading} disabled={socialLoading}>
          Đăng nhập
        </AuthButton>

        <SocialAuthButtons
          mode="login"
          onGoogleSuccess={handleGoogleSuccess}
          onFacebookSuccess={handleFacebookSuccess}
          disabled={busy}
        />

        <p className="text-center text-sm text-gray-500 pt-2">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-[#D4A017] font-semibold hover:underline">
            Đăng ký
          </Link>
        </p>

        <div className="rounded-xl border border-[#D4A017]/25 bg-[#D4A017]/10 px-4 py-3 text-xs text-gray-600">
          <p className="font-semibold text-gray-700">Tài khoản mẫu (MongoDB Atlas)</p>
          <p className="mt-1">Admin: admin@hr.vn / Password123!</p>
          <p>Owner: owner1@hr.vn / Password123!</p>
          <p>Jockey: jockey1@hr.vn / Password123!</p>
        </div>
      </form>
    </AuthLayout>
  )
}
