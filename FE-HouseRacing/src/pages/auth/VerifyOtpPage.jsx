import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import OtpInput from '@/components/forms/OtpInput'
import AuthButton from '@/components/ui/AuthButton'
import { authService } from '@/services/authService'
import { getApiErrorMessage } from '@/utils/apiError'
import { saveResetFlow } from '@/utils/resetFlow'

const RESEND_SECONDS = 60

export default function VerifyOtpPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password', { replace: true })
    }
  }, [email, navigate])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleVerify = (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error('Vui lòng nhập đủ 6 số OTP')
      return
    }
    saveResetFlow(email, otp)
    toast.success('Xác thực OTP thành công.')
    navigate('/reset-password', { replace: true })
  }

  const handleResend = async () => {
    if (countdown > 0) return
    setLoading(true)
    try {
      await authService.forgotPassword(email)
      toast.success('Mã OTP đã được gửi lại.')
      setCountdown(RESEND_SECONDS)
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Xác thực OTP" subtitle="Mã xác thực đã được gửi tới email của bạn.">
      <form onSubmit={handleVerify} className="space-y-6">
        <p className="text-sm text-center text-gray-500 truncate">{email}</p>
        <OtpInput value={otp} onChange={setOtp} />
        <AuthButton loading={loading}>Xác nhận OTP</AuthButton>
        <AuthButton
          type="button"
          variant="ghost"
          loading={loading}
          onClick={handleResend}
          className={countdown > 0 ? 'opacity-50 pointer-events-none' : ''}
        >
          {countdown > 0 ? `Gửi lại mã (${countdown}s)` : 'Gửi lại mã'}
        </AuthButton>
        <p className="text-center text-sm">
          <Link to="/forgot-password" className="text-[#D4A017] hover:underline">
            Đổi email
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
