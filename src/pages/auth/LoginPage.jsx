import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import TextInput from '@/components/forms/TextInput'
import PasswordInput from '@/components/forms/PasswordInput'
import AuthButton from '@/components/ui/AuthButton'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/utils/apiError'
import { getPostLoginPath } from '@/utils/roleRedirect'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const redirectAfterAuth = (user) => {
    const storedReturn = sessionStorage.getItem('auth:returnTo')
    if (storedReturn) sessionStorage.removeItem('auth:returnTo')

    const fromPath =
      location.state?.from?.pathname
      || (typeof location.state?.from === 'string' ? location.state.from : null)
      || storedReturn

    navigate(getPostLoginPath(user, fromPath), { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Vui lòng nhập email và mật khẩu')
      return
    }
    setLoading(true)
    const loadingToast = toast.loading('Đang đăng nhập...')
    try {
      const { user } = await login(form)
      toast.dismiss(loadingToast)
      toast.success('Đăng nhập thành công')
      redirectAfterAuth(user)
    } catch (err) {
      toast.dismiss(loadingToast)
      toast.error(getApiErrorMessage(err, { scene: 'login' }), { duration: 6000 })
    } finally {
      setLoading(false)
    }
  }

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
              disabled={loading}
            />
            Ghi nhớ đăng nhập
          </label>
          <Link to="/forgot-password" className="text-[#D4A017] hover:underline font-medium">
            Quên mật khẩu?
          </Link>
        </div>

        <AuthButton loading={loading}>
          Đăng nhập
        </AuthButton>

        <p className="text-center text-sm text-gray-500 pt-2">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-[#D4A017] font-semibold hover:underline">
            Đăng ký
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
