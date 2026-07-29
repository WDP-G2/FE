import { ChevronDown, Edit2, FileText, PawPrint, Trash2 } from "lucide-react";
import { GlassCard, Pill } from "../../../admin/AdminLayout";
import { HorseOwnerInfoItem } from "../HorseOwnerInfoItem";

export function HorseOwnerHorseCard({
  horse,
  canEdit,
  canDelete,
  genderLabel,
  isReasonOpen,
  onDelete,
  onEdit,
  onToggleReason,
}) {
  return (
    <GlassCard>
      <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#D4A017]/10 to-[#0F1E3A] md:h-72">
        {horse.imageUrl ? (
          <img
            src={horse.imageUrl}
            alt={horse.name}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <PawPrint className="h-20 w-20 text-[#D4A017]/30" />
        )}
        <div className="absolute right-3 top-3">
          <Pill tone={horse.healthTone}>{horse.status}</Pill>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-white">{horse.name}</h3>
            <p className="mt-0.5 text-[12px] text-white/50">
              {horse.breed || "Chưa cập nhật"} · {horse.color || "Chưa cập nhật"}
            </p>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(horse)}
              className="rounded-lg bg-white/5 p-1.5 transition-all hover:bg-[#D4A017]/15 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canEdit}
              title="Chỉnh sửa"
            >
              <Edit2 className="h-3.5 w-3.5 text-white/60 hover:text-[#D4A017]" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(horse)}
              className="rounded-lg bg-white/5 p-1.5 transition-all hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={!canDelete}
              title="Xóa"
            >
              <Trash2 className="h-3.5 w-3.5 text-white/60 hover:text-red-400" />
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <HorseOwnerInfoItem label="Tuổi" value={`${horse.age || 0} tuổi`} />
          <HorseOwnerInfoItem label="Cân nặng" value={`${horse.weight || 0} kg`} />
          <HorseOwnerInfoItem label="Giới tính" value={genderLabel} />
          <HorseOwnerInfoItem
            label="Chiều cao"
            value={horse.height ? `${horse.height} cm` : "Chưa cập nhật"}
          />
        </div>

        {horse.reviewReason && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => onToggleReason(horse.id)}
              className="flex w-full items-center justify-between rounded-xl border border-red-400/20 bg-red-500/8 px-3 py-2 text-left text-xs font-semibold text-red-200 transition hover:border-red-400/35 hover:bg-red-500/12"
            >
              <span>Lý do từ chối</span>
              <ChevronDown
                className={`h-4 w-4 transition ${isReasonOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isReasonOpen && (
              <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-100">
                {horse.reviewReason}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 rounded-xl bg-white/[0.04] p-3">
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-[#D4A017]">{horse.wins}</div>
            <div className="text-[10px] text-white/50">Thắng</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-white">{horse.races}</div>
            <div className="text-[10px] text-white/50">Tổng race</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex-1 text-center">
            <div className="text-lg font-bold text-emerald-300">
              {horse.races > 0 ? Math.round((horse.wins / horse.races) * 100) : 0}%
            </div>
            <div className="text-[10px] text-white/50">Tỷ lệ thắng</div>
          </div>
        </div>

        {horse.documentUrl && (
          <a
            href={horse.documentUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white/60 transition-all hover:bg-white/10"
          >
            <FileText className="h-3.5 w-3.5" /> Xem giấy chứng nhận
          </a>
        )}
      </div>
    </GlassCard>
  );
}
