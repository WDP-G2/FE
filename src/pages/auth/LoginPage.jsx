import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Mail, Globe } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import TextInput from '@/components/forms/TextInput'
import PasswordInput from '@/components/forms/PasswordInput'
import AuthButton from '@/components/ui/AuthButton'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/utils/apiError'
import { getRoleHomePath, normalizeRole } from '@/utils/roleRedirect'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

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
      const from = location.state?.from?.pathname
      const home = from || getRoleHomePath(normalizeRole(user?.role))
      navigate(home, { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Sai email hoặc mật khẩu')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    toast.info('Đăng nhập Google sẽ được cập nhật sớm')
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
            />
            Ghi nhớ đăng nhập
          </label>
          <Link to="/forgot-password" className="text-[#D4A017] hover:underline font-medium">
            Quên mật khẩu?
          </Link>
        </div>

        <AuthButton loading={loading}>Đăng nhập</AuthButton>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-400">hoặc</span>
          </div>
        </div>

        <AuthButton type="button" variant="outline" onClick={handleGoogle}>
          <Globe className="w-5 h-5" />
          Đăng nhập với Google
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
