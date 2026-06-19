import { useState } from 'react';
import { AlertTriangle, Search, Filter, Camera, Gavel } from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, Pill, TextInput, Select, StatCard } from '@/pages/admin/AdminLayout';
import { useRefereeViolations } from './refereeViolationsMock';
import { ViolationEvidencePreviewModal } from './ViolationEvidencePreview';
import { severityTone } from '@/utils/refereeRaceUtils';

export function RefereeViolations() {
  const [q, setQ] = useState('');
  const [sev, setSev] = useState('all');
  const [previewFile, setPreviewFile] = useState(null);
  const violations = useRefereeViolations();

  const filtered = violations.filter((v) => {
    if (q && !`${v.horse} ${v.jockey} ${v.raceName} ${v.id}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (sev !== 'all' && v.severity !== sev) return false;
    return true;
  });

  return (
    <RefereeLayout
      title="Trọng tài · Vi phạm đã ghi"
      subtitle="Tổng hợp các vi phạm bạn đã ghi nhận xuyên suốt các race"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng vi phạm" value={String(violations.length)} icon={AlertTriangle} tone="gold" />
        <StatCard label="Phạt nặng" value={String(violations.filter((v) => v.severity === 'Phạt nặng').length)} icon={Gavel} tone="purple" />
        <StatCard label="Loại" value={String(violations.filter((v) => v.severity === 'Loại').length)} icon={AlertTriangle} tone="purple" />
        <StatCard label="Bằng chứng" value={String(violations.reduce((s, v) => s + (v.evidence?.length ?? 0), 0))} icon={Camera} tone="blue" />
      </div>

      <GlassCard>
        <div className="p-5 border-b border-white/10 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <TextInput
              className="pl-11"
              placeholder="Tìm theo ngựa, jockey, mã vi phạm..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={sev} onChange={(e) => setSev(e.target.value)} className="md:w-48">
            <option value="all">Tất cả mức độ</option>
            <option>Cảnh cáo</option>
            <option>Phạt nhẹ</option>
            <option>Phạt nặng</option>
            <option>Loại</option>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-white/40 border-b border-white/10">
                <th className="px-6 py-3">Mã</th>
                <th className="px-6 py-3">Race</th>
                <th className="px-6 py-3">Ngựa & Jockey</th>
                <th className="px-6 py-3">Loại</th>
                <th className="px-6 py-3 text-center">Mức độ</th>
                <th className="px-6 py-3">Hình phạt</th>
                <th className="px-6 py-3 text-center">Bằng chứng</th>
                <th className="px-6 py-3">Thời điểm</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-6 py-3 text-xs text-[#D4A017] font-mono font-semibold">{v.id}</td>
                  <td className="px-6 py-3 text-sm text-white/80">{v.raceName}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex w-7 h-7 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30 items-center justify-center font-bold text-xs">
                        #{v.horseNo}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">{v.horse}</div>
                        <div className="text-[11px] text-white/50">{v.jockey}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3"><Pill tone="red">{v.type}</Pill></td>
                  <td className="px-6 py-3 text-center"><Pill tone={severityTone(v.severity)}>{v.severity}</Pill></td>
                  <td className="px-6 py-3 text-sm text-white/70 max-w-xs truncate">{v.penalty}</td>
                  <td className="px-6 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setPreviewFile(v.evidence?.[0] ?? null)}
                      disabled={!v.evidence?.length}
                      className="inline-flex items-center gap-1 text-xs text-[#D4A017] hover:text-[#E5B82F] disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
                      title="Xem bằng chứng"
                    >
                      <Camera className="w-3.5 h-3.5" /> {v.evidence?.length ?? 0}
                    </button>
                  </td>
                  <td className="px-6 py-3 text-xs text-white/60">{v.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/40 text-sm">
            <Filter className="w-10 h-10 mx-auto mb-2 opacity-30" />
            Không có vi phạm phù hợp.
          </div>
        )}
      </GlassCard>

      <ViolationEvidencePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
    </RefereeLayout>
  );
}
