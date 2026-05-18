import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, User as UserIcon, Globe } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import TextInput from '@/components/forms/TextInput'
import PasswordInput from '@/components/forms/PasswordInput'
import AuthButton from '@/components/ui/AuthButton'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/utils/apiError'
import { validatePassword } from '@/utils/validation'

export default function RegisterPage() {
  const navigate = useNavigate()
  const register = useAuthStore((s) => s.register)
  const [loading, setLoading] = useState(false)
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
      toast.success('Đăng ký thành công')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

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

        <AuthButton loading={loading}>Đăng ký</AuthButton>

        <AuthButton type="button" variant="outline" onClick={() => toast.info('Google đăng ký sẽ được cập nhật sớm')}>
          <Globe className="w-5 h-5" />
          Đăng ký với Google
        </AuthButton>

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
