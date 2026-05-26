import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import TextInput from '@/components/forms/TextInput'
import AuthButton from '@/components/ui/AuthButton'
import { authApi } from '@/api/authApi'
import { getApiErrorMessage } from '@/utils/apiError'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Vui lòng nhập email')
      return
    }
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      toast.success('Mã OTP đã được gửi đến email của bạn.')
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`, { replace: true })
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Quên mật khẩu" subtitle="Nhập email để nhận mã xác thực đặt lại mật khẩu.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          id="email"
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
        />
        <AuthButton loading={loading}>Gửi mã OTP</AuthButton>
        <p className="text-center text-sm">
          <Link to="/login" className="text-[#D4A017] hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
