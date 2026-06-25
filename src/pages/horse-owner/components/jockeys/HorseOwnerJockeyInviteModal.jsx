import { Send, X } from "lucide-react";
import { GlassCard, GhostButton, PrimaryButton, TextInput } from "../../../admin/AdminLayout";
import { HorseOwnerFormField } from "../HorseOwnerFormField";
import { formatMoneyInput, parseMoneyInput } from "@/utils/formatCurrency";

export function HorseOwnerJockeyInviteModal({
  approvedHorses,
  form,
  inviteTarget,
  isHorseDisabledForSelectedRace,
  isRaceDisabledForSelectedHorse,
  onChangeForm,
  onChangeHorse,
  onChangeRace,
  onClose,
  onSubmit,
  pendingJockeyRaceConflicts,
  raceOptions,
  saving,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="font-bold text-white">Mời jockey</h2>
            <p className="mt-1 text-sm text-white/45">{inviteTarget.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all hover:bg-white/10"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <HorseOwnerFormField label="Chọn ngựa đã duyệt">
            <select
              value={form.horseId}
              onChange={(event) => onChangeHorse(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#17191d] px-4 py-2.5 text-sm text-white focus:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20"
            >
              {approvedHorses.map((horse) => (
                <option
                  key={horse.id}
                  value={horse.id}
                  disabled={isHorseDisabledForSelectedRace(horse.id)}
                  className="bg-[#17191d] text-white"
                >
                  {horse.name}
                  {isHorseDisabledForSelectedRace(horse.id) ? " · đã có lời mời" : ""}
                </option>
              ))}
            </select>
          </HorseOwnerFormField>

          <HorseOwnerFormField label="Cuộc đua">
            <select
              value={form.raceId}
              onChange={(event) => onChangeRace(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#17191d] px-4 py-2.5 text-sm text-white focus:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20"
            >
              {raceOptions.map((race) => (
                <option
                  key={race.id}
                  value={race.id}
                  disabled={isRaceDisabledForSelectedHorse(race.id)}
                  className="bg-[#17191d] text-white"
                >
                  {race.label} · {race.meta}
                  {isRaceDisabledForSelectedHorse(race.id) ? " · ngựa đã có lời mời" : ""}
                </option>
              ))}
            </select>
          </HorseOwnerFormField>

          <HorseOwnerFormField label="Thù lao lời mời (VNĐ)">
            {pendingJockeyRaceConflicts.length > 0 && (
              <div className="mb-4 rounded-xl border border-[#D4A017]/30 bg-[#D4A017]/10 p-3 text-xs text-white/70">
                <div className="font-semibold text-[#D4A017]">Lưu ý lịch jockey</div>
                <p className="mt-1">
                  Jockey này đang có {pendingJockeyRaceConflicts.length} lời mời pending trùng giờ.
                  Nếu jockey nhận một lời mời, backend sẽ tự hủy các lời mời còn lại bị trùng lịch.
                </p>
              </div>
            )}

            <TextInput
              type="text"
              inputMode="numeric"
              value={formatMoneyInput(form.remunerationAmount)}
              onChange={(event) =>
                onChangeForm({ ...form, remunerationAmount: parseMoneyInput(event.target.value) })
              }
              placeholder="VD: 5000000"
            />
          </HorseOwnerFormField>

          <HorseOwnerFormField label="Lời nhắn">
            <TextInput
              value={form.message}
              onChange={(event) => onChangeForm({ ...form, message: event.target.value })}
              placeholder="Gửi lời mời tham gia đội..."
            />
          </HorseOwnerFormField>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
          <GhostButton onClick={onClose} disabled={saving}>
            Hủy
          </GhostButton>
          <PrimaryButton onClick={onSubmit} disabled={saving} icon={Send}>
            {saving ? "Đang gửi..." : "Gửi lời mời"}
          </PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}
