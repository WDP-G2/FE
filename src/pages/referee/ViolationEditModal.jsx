import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, Upload, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { GhostButton, PrimaryButton, Select, TextInput } from '@/pages/admin/AdminLayout';
import { systemSettingsService } from '@/services/systemSettingsService';
import { refereeService } from '@/services/refereeService';
import { getApiErrorMessage } from '@/utils/apiError';
import { buildViolationTimestamp, mapActiveViolationTypeLabels } from '@/utils/violationUtils';

const FALLBACK_VIOLATION_TYPES = [
  'Xuất phát sai',
  'Lái nguy hiểm',
  'Vi phạm trang bị',
  'Nghi doping',
  'Check-in muộn',
  'Khác',
]

function formatEvidenceSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extractTimeFromTimestamp(timestamp) {
  const match = /(\d{2}):(\d{2}):(\d{2})/.exec(String(timestamp ?? ''));
  return match ? `${match[1]}:${match[2]}:${match[3]}` : '00:00:00';
}

function extractDateFromTimestamp(timestamp) {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(timestamp ?? ''));
  if (match) return match[1];
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatTimeInputValue(raw) {
  const digits = String(raw).replace(/\D/g, '').slice(0, 6);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4)}`;
}

function isValidTimeOfDay(value) {
  const match = /^(\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59 && seconds >= 0 && seconds <= 59;
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-white/60 font-semibold mb-2">{label}</label>
      {children}
    </div>
  );
}

export function ViolationEditModal({ violation, onClose, onUpdated }) {
  const evidenceInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [violationTypeOptions, setViolationTypeOptions] = useState(FALLBACK_VIOLATION_TYPES);
  const [form, setForm] = useState({
    type: FALLBACK_VIOLATION_TYPES[0],
    severity: 'Phạt nhẹ',
    description: '',
    penalty: '',
    occurredAt: '00:00:00',
    evidenceFile: null,
    evidencePreview: '',
  });

  useEffect(() => {
    if (!violation) return;
    setForm({
      type: violation.type ?? FALLBACK_VIOLATION_TYPES[0],
      severity: violation.severity ?? 'Phạt nhẹ',
      description: violation.description === '(không có mô tả)' ? '' : (violation.description ?? ''),
      penalty: violation.penalty ?? '',
      occurredAt: extractTimeFromTimestamp(violation.timestamp),
      evidenceFile: null,
      evidencePreview: '',
    });
  }, [violation]);

  useEffect(() => {
    let cancelled = false

    async function loadViolationTypes() {
      try {
        const response = await systemSettingsService.getPublicViolationTypes()
        if (cancelled) return

        const labels = mapActiveViolationTypeLabels(response)

        if (labels.length) setViolationTypeOptions(labels)
      } catch {
        // fallback list keeps form usable when API is unavailable
      }
    }

    loadViolationTypes()
    return () => {
      cancelled = true
    }
  }, [])

  if (!violation) return null;

  const resolvedTypeOptions = violationTypeOptions.includes(form.type)
    ? violationTypeOptions
    : [form.type, ...violationTypeOptions]

  const resetEvidencePreview = (previewUrl) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  const close = () => {
    resetEvidencePreview(form.evidencePreview);
    onClose();
  };

  const handleEvidenceSelect = (file) => {
    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
    ];
    const allowedByName = /\.(jpe?g|png|webp|gif|mp4|mov)$/i.test(file.name);
    if (!allowedTypes.includes(file.type) && !allowedByName) {
      toast.error('Chỉ hỗ trợ JPG, PNG, GIF, WEBP, MP4, MOV');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File không được vượt quá 100MB');
      return;
    }

    setForm((previous) => {
      resetEvidencePreview(previous.evidencePreview);
      return {
        ...previous,
        evidenceFile: file,
        evidencePreview: file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : '',
      };
    });
  };

  const submit = async () => {
    if (!form.description.trim()) {
      toast.error('Vui lòng nhập mô tả chi tiết');
      return;
    }
    if (!isValidTimeOfDay(form.occurredAt)) {
      toast.error('Thời điểm không hợp lệ. Nhập theo định dạng HH:mm:ss');
      return;
    }

    setSubmitting(true);
    try {
      const occurredAt = buildViolationTimestamp(
        form.occurredAt,
        violation.timestamp ? new Date(String(violation.timestamp).replace(' ', 'T')) : new Date(),
      );

      await refereeService.updateViolation(
        violation.id,
        {
          type: form.type,
          severity: form.severity,
          description: form.description.trim(),
          penalty: form.penalty.trim() || 'Cảnh cáo',
          occurredAt,
        },
        form.evidenceFile || null,
      );

      resetEvidencePreview(form.evidencePreview);
      toast.success('Đã cập nhật vi phạm');
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err) || 'Không cập nhật được vi phạm');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={close}
    >
      <div
        className="bg-[#0F1E3A] border border-white/10 rounded-2xl max-w-2xl w-full my-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-br from-[#D4A017]/20 to-transparent">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#D4A017]" />
            <div>
              <h3 className="font-bold text-white">Chỉnh sửa vi phạm</h3>
              <p className="text-xs text-white/50 font-mono">{violation.displayCode || violation.id} · {violation.raceName}</p>
            </div>
          </div>
          <button type="button" onClick={close} className="text-white/60 hover:text-white">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/70">
            <span className="text-white/40">Ngựa & Jockey: </span>
            <span className="font-semibold text-white">#{violation.horseNo} · {violation.horse}</span>
            <span className="text-white/50"> · {violation.jockey}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Loại vi phạm *">
              <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="w-full">
                {resolvedTypeOptions.map((typeLabel) => (
                  <option key={typeLabel} value={typeLabel}>
                    {typeLabel}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Mức độ *">
              <Select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })} className="w-full">
                <option>Cảnh cáo</option>
                <option>Phạt nhẹ</option>
                <option>Phạt nặng</option>
                <option>Loại</option>
              </Select>
            </Field>
            <Field label="Thời điểm *">
              <TextInput
                value={form.occurredAt}
                onChange={(event) => setForm({
                  ...form,
                  occurredAt: formatTimeInputValue(event.target.value),
                })}
                placeholder="HH:mm:ss"
                className="font-mono tabular-nums"
                maxLength={8}
                inputMode="numeric"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Mô tả chi tiết *">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  placeholder="Mô tả hành vi vi phạm..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D4A017] resize-none"
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Hình phạt áp dụng">
                <TextInput
                  value={form.penalty}
                  onChange={(event) => setForm({ ...form, penalty: event.target.value })}
                  placeholder="VD: Trừ 3 giây thành tích · Loại khỏi race..."
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Bằng chứng (tùy chọn — để trống nếu giữ nguyên)">
                <input
                  ref={evidenceInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,.jpg,.jpeg,.png,.webp,.gif,.mp4,.mov"
                  className="hidden"
                  onChange={(event) => {
                    handleEvidenceSelect(event.target.files?.[0]);
                    event.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => evidenceInputRef.current?.click()}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    handleEvidenceSelect(event.dataTransfer.files?.[0]);
                  }}
                  className="w-full border-2 border-dashed border-[#D4A017]/40 bg-[#D4A017]/5 rounded-xl p-5 text-center transition-all hover:bg-[#D4A017]/10"
                >
                  <Upload className="w-5 h-5 text-[#D4A017] mx-auto mb-2" />
                  <div className="text-sm text-white font-semibold">Tải bằng chứng mới (nếu cần)</div>
                  <div className="text-[11px] text-white/50 mt-1">MP4, MOV, JPG, PNG · tối đa 100MB</div>
                </button>

                {form.evidenceFile ? (
                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    {form.evidencePreview ? (
                      <img
                        src={form.evidencePreview}
                        alt={form.evidenceFile.name}
                        className="h-14 w-14 rounded-lg object-cover border border-white/10"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                        <Camera className="h-6 w-6 text-[#D4A017]" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate">{form.evidenceFile.name}</div>
                      <div className="text-xs text-white/50">{formatEvidenceSize(form.evidenceFile.size)}</div>
                    </div>
                  </div>
                ) : violation.evidence?.[0] ? (
                  <div className="mt-3 text-xs text-white/50">
                    Đang giữ bằng chứng hiện tại: {violation.evidence[0].name}
                  </div>
                ) : null}
              </Field>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <GhostButton onClick={close}>Hủy</GhostButton>
          <PrimaryButton onClick={submit} disabled={submitting}>
            {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
