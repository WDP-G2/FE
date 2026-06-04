import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import TextInput from '@/components/forms/TextInput'
import PasswordInput from '@/components/forms/PasswordInput'
import AuthButton from '@/components/ui/AuthButton'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/utils/apiError'
import { validatePassword } from '@/utils/validation'
import { getRoleHomePath, normalizeRole } from '@/utils/roleRedirect'

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle)
  const loginWithFacebook = useAuthStore((s) => s.loginWithFacebook)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const pwdErr = validatePassword(form.password)
    if (pwdErr) {
      setErrors((e) => ({ ...e, password: pwdErr }))
      toast.error(pwdErr)
      return
    }
    if (form.password !== form.confirmPassword) {
      setErrors((e) => ({ ...e, confirmPassword: 'Mật khẩu xác nhận không khớp' }))
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })
      toast.success(`Đăng ký thành công! Xin chào ${form.fullName.trim()}`)
      navigate('/profile?welcome=1&tab=roles', { replace: true, state: { welcome: true } })
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (idToken) => {
    setSocialLoading(true)
    try {
      const { user } = await loginWithGoogle(idToken)
      toast.success('Đăng ký / đăng nhập Google thành công')
      navigate(getRoleHomePath(normalizeRole(user?.role)), { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Đăng ký Google thất bại')
    } finally {
      setSocialLoading(false)
    }
  }

  const handleFacebookSuccess = async (accessToken) => {
    setSocialLoading(true)
    try {
      const { user } = await loginWithFacebook(accessToken)
      toast.success('Đăng ký / đăng nhập Facebook thành công')
      navigate(getRoleHomePath(normalizeRole(user?.role)), { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Đăng ký Facebook thất bại')
    } finally {
      setSocialLoading(false)
    }
  }

  const busy = loading || socialLoading

  return (
    <AuthLayout title="Đăng ký" subtitle="Tham gia hệ thống quản lý giải đua ngựa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="fullName"
          label="Họ và tên"
          icon={UserIcon}
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Nguyễn Văn A"
          autoComplete="name"
        />
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
          onChange={(e) => {
            const password = e.target.value
            setForm({ ...form, password })
            setErrors({ ...errors, password: validatePassword(password) })
          }}
          error={errors.password}
        />
        <PasswordInput
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          value={form.confirmPassword}
          onChange={(e) => {
            const confirmPassword = e.target.value
            setForm({ ...form, confirmPassword })
            setErrors({
              ...errors,
              confirmPassword:
                confirmPassword && confirmPassword !== form.password
                  ? 'Mật khẩu xác nhận không khớp'
                  : '',
            })
          }}
          error={errors.confirmPassword}
        />

        <p className="text-xs text-gray-500 bg-[#FFF8F0] border border-[#D4A017]/20 rounded-xl p-3">
          Tài khoản sẽ được quản trị viên xác minh và cấp quyền phù hợp.
        </p>

        <AuthButton loading={loading} disabled={socialLoading}>
          Đăng ký
        </AuthButton>

        <SocialAuthButtons
          mode="register"
          onGoogleSuccess={handleGoogleSuccess}
          onFacebookSuccess={handleFacebookSuccess}
          disabled={busy}
        />

        <p className="text-center text-sm text-gray-500">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-[#D4A017] font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
