import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Camera,
  CheckCircle2,
  ImageUp,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import { roleApplicationService } from '@/services/roleApplicationService'
import { getApiErrorMessage } from '@/utils/apiError'
import { validateKycImage } from '@/utils/roleApplicationValidation'

const OCR_FIELDS = [
  ['fullName', 'Họ và tên'],
  ['idNumberMasked', 'Số CCCD'],
  ['dateOfBirth', 'Ngày sinh'],
  ['gender', 'Giới tính'],
  ['address', 'Địa chỉ'],
  ['issueDate', 'Ngày cấp'],
]

function PreviewImage({ file, alt }) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  if (!url) return null
  return <img src={url} alt={alt} className="mt-3 h-36 w-full rounded-xl object-cover" />
}

function ImagePicker({ label, file, error, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[#1E3A5F]">{label}</p>
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed bg-[#FAFAFA] px-4 py-4 transition hover:border-[#D4A017] ${
          error ? 'border-red-400' : 'border-gray-300'
        }`}
      >
        <ImageUp className="h-5 w-5 shrink-0 text-[#D4A017]" />
        <span className="min-w-0 flex-1 truncate text-sm text-[#1E3A5F]/70">
          {file?.name || 'Chọn ảnh JPEG hoặc PNG, tối đa 5MB'}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(event) => {
            onChange(event.target.files?.[0] ?? null)
            event.target.value = ''
          }}
        />
      </label>
      <PreviewImage file={file} alt={label} />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

function OcrSummary({ data }) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-emerald-700">
        <CheckCircle2 className="h-5 w-5" />
        <p className="font-semibold">Đã đọc CCCD thành công</p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        {OCR_FIELDS.map(([key, label]) => (
          <div key={key}>
            <dt className="text-xs text-[#1E3A5F]/55">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold text-[#1E3A5F]">
              {data?.[key] || 'Không có thông tin'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export default function KycVerificationSteps({ role, onComplete, onProgressChange }) {
  const [step, setStep] = useState('cccd')
  const [cccdFront, setCccdFront] = useState(null)
  const [cccdBack, setCccdBack] = useState(null)
  const [selfie, setSelfie] = useState(null)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [ocrData, setOcrData] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraActive(false)
  }, [])

  useEffect(() => stopCamera, [stopCamera])

  const startCamera = async () => {
    setCameraError('')
    stopCamera()
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Trình duyệt không hỗ trợ camera. Vui lòng tải ảnh lên.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch {
      setCameraError('Không thể mở camera. Hãy cấp quyền hoặc tải ảnh selfie lên.')
    }
  }

  const captureSelfie = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera chưa sẵn sàng, vui lòng thử lại.')
      return
    }
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Không thể chụp ảnh, vui lòng thử lại.')
          return
        }
        setSelfie(new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' }))
        setErrors((current) => ({ ...current, selfie: '' }))
        setCameraError('')
        stopCamera()
      },
      'image/jpeg',
      0.9,
    )
  }

  const setImage = (key, file, setter) => {
    const error = validateKycImage(file)
    setErrors((current) => ({ ...current, [key]: error }))
    setter(error ? null : file)
  }

  const submitOcr = async () => {
    const nextErrors = {
      cccdFront: validateKycImage(cccdFront),
      cccdBack: validateKycImage(cccdBack),
    }
    setErrors(nextErrors)
    if (nextErrors.cccdFront || nextErrors.cccdBack) return

    try {
      setSubmitting(true)
      setApiError('')
      const result = await roleApplicationService.verifyCccd(role, cccdFront, cccdBack)
      setOcrData(result)
      setStep('selfie')
      onProgressChange?.('selfie')
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const submitSelfie = async () => {
    const selfieError = validateKycImage(selfie)
    setErrors((current) => ({ ...current, selfie: selfieError }))
    if (selfieError) return

    try {
      setSubmitting(true)
      setApiError('')
      stopCamera()
      const result = await roleApplicationService.verifyFace(
        ocrData.kycVerificationId,
        selfie,
      )
      setStep('complete')
      onProgressChange?.('complete')
      await onComplete(result)
    } catch (error) {
      setApiError(getApiErrorMessage(error))
      setOcrData(null)
      setSelfie(null)
      setStep('cccd')
      onProgressChange?.('cccd')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'complete') {
    return (
      <div className="py-10 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
        <h3 className="mt-4 text-xl font-bold text-[#1E3A5F]">KYC thành công</h3>
        <p className="mt-2 text-sm text-[#1E3A5F]/65">Hồ sơ đang được gửi để chờ duyệt.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl bg-[#D4A017]/10 p-4">
        <ShieldCheck className="h-6 w-6 shrink-0 text-[#D4A017]" />
        <div>
          <p className="font-semibold text-[#1E3A5F]">
            {step === 'cccd' ? 'Bước 2: Xác minh CCCD' : 'Bước 3: Đối chiếu khuôn mặt'}
          </p>
          <p className="text-xs text-[#1E3A5F]/60">
            Ảnh chỉ được dùng để xác minh danh tính cho hồ sơ này.
          </p>
          {step === 'cccd' && (
            <p className="mt-1 text-xs font-medium text-[#B8941F]">
              Họ và tên tài khoản phải khớp với họ tên được đọc từ CCCD.
            </p>
          )}
        </div>
      </div>

      {apiError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
          {step === 'cccd' && (
            <p className="mt-1 text-xs">Vui lòng kiểm tra ảnh CCCD và thực hiện lại từ bước này.</p>
          )}
        </div>
      )}

      {step === 'cccd' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImagePicker
              label="CCCD mặt trước *"
              file={cccdFront}
              error={errors.cccdFront}
              onChange={(file) => setImage('cccdFront', file, setCccdFront)}
            />
            <ImagePicker
              label="CCCD mặt sau *"
              file={cccdBack}
              error={errors.cccdBack}
              onChange={(file) => setImage('cccdBack', file, setCccdBack)}
            />
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={submitOcr}
            className="w-full rounded-xl bg-[#D4A017] py-3 font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Đang đọc thông tin CCCD...' : 'Xác minh CCCD'}
          </button>
        </>
      ) : (
        <>
          <OcrSummary data={ocrData} />
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-950">
            <video
              ref={videoRef}
              muted
              playsInline
              className={`aspect-video w-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
            />
            {!cameraActive && (
              <div className="flex aspect-video items-center justify-center text-white/60">
                <Camera className="h-12 w-12" />
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          {cameraError && <p className="text-sm text-red-600">{cameraError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={cameraActive ? captureSelfie : startCamera}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4A017] py-3 font-semibold text-[#B8941F]"
            >
              {cameraActive ? <Camera className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
              {cameraActive ? 'Chụp ảnh' : 'Mở camera'}
            </button>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-semibold text-[#1E3A5F]">
              <ImageUp className="h-5 w-5" />
              Tải ảnh selfie
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={(event) => {
                  setImage('selfie', event.target.files?.[0] ?? null, setSelfie)
                  stopCamera()
                  event.target.value = ''
                }}
              />
            </label>
          </div>
          <PreviewImage file={selfie} alt="Ảnh selfie" />
          {errors.selfie && <p className="text-xs font-medium text-red-600">{errors.selfie}</p>}
          <button
            type="button"
            disabled={submitting}
            onClick={submitSelfie}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D4A017] py-3 font-semibold text-white disabled:opacity-50"
          >
            {submitting && <LoaderCircle className="h-5 w-5 animate-spin" />}
            {submitting ? 'Đang đối chiếu khuôn mặt...' : 'Hoàn tất xác minh'}
          </button>
        </>
      )}
    </div>
  )
}
