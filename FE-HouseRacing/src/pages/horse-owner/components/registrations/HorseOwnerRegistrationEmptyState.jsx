import { ClipboardList } from "lucide-react";
import { GlassCard } from "../../../admin/AdminLayout";

export function HorseOwnerRegistrationEmptyState({ hasRegistrationOptions }) {
  return (
    <GlassCard className="p-10 text-center text-sm text-white/55">
      <ClipboardList className="mx-auto mb-3 h-12 w-12 text-white/25" />
      <p>Chưa có đăng ký thi đấu nào</p>
      {!hasRegistrationOptions && (
        <p className="mt-2 text-xs text-white/35">
          Chưa có jockey đã nhận lời mời để đăng ký thi đấu.
        </p>
      )}
    </GlassCard>
  );
}
