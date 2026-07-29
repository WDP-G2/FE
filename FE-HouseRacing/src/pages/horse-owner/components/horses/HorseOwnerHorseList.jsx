import { PawPrint } from "lucide-react";
import { HorseOwnerHorseCard } from "./HorseOwnerHorseCard";

export function HorseOwnerHorseList({
  horses,
  canDeleteHorse,
  canEditHorse,
  getGenderLabel,
  onDelete,
  onEdit,
  onToggleReason,
  openReasonId,
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {horses.map((horse) => (
        <HorseOwnerHorseCard
          key={horse.id}
          horse={horse}
          canDelete={canDeleteHorse(horse)}
          canEdit={canEditHorse(horse)}
          genderLabel={getGenderLabel(horse.gender)}
          isReasonOpen={openReasonId === horse.id}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggleReason={onToggleReason}
        />
      ))}

      {horses.length === 0 && (
        <div className="col-span-full py-16 text-center text-white/40">
          <PawPrint className="mx-auto mb-3 h-12 w-12 opacity-30" />
          <p>Không tìm thấy ngựa nào</p>
        </div>
      )}
    </div>
  );
}
