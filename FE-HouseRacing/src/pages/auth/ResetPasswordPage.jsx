import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import PasswordInput from '@/components/forms/PasswordInput'
import PasswordStrength from '@/components/forms/PasswordStrength'
import AuthButton from '@/components/ui/AuthButton'
import { authService } from '@/services/authService'
import { getApiErrorMessage } from '@/utils/apiError'
import { getResetFlow, clearResetFlow } from '@/utils/resetFlow'
import { validatePassword } from '@/utils/validation'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' })
  const flow = getResetFlow()

  useEffect(() => {
    if (!flow?.email || !flow?.otp) {
      navigate('/forgot-password', { replace: true })
    }
  }, [flow, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const pwdErr = validatePassword(password)
    if (pwdErr) {
      setErrors((e) => ({ ...e, password: pwdErr }))
      toast.error(pwdErr)
      return
    }
    if (password !== confirmPassword) {
      setErrors((e) => ({ ...e, confirmPassword: 'Mật khẩu xác nhận không khớp' }))
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword({
        email: flow.email,
        otp: flow.otp,
        newPassword: password,
      })
      clearResetFlow()
      toast.success('Mật khẩu đã được cập nhật thành công.')
      setTimeout(() => navigate('/login', { replace: true }), 1500)
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Mã OTP không hợp lệ')
    } finally {
      setLoading(false)
    }
  }

  if (!flow?.email) return null

  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Tạo mật khẩu mới cho tài khoản của bạn.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <PasswordInput
            label="Mật khẩu mới"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors({ ...errors, password: validatePassword(e.target.value) })
            }}
            error={errors.password}
          />
          <PasswordStrength password={password} />
        </div>
        <PasswordInput
          id="confirm"
          label="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />
        <AuthButton loading={loading}>Cập nhật mật khẩu</AuthButton>
        <p className="text-center text-sm">
          <Link to="/login" className="text-[#D4A017] hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
