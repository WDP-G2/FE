import { Users } from "lucide-react";
import { HorseOwnerJockeyCard } from "./HorseOwnerJockeyCard";

export function HorseOwnerJockeyList({
  jockeys,
  onCancelInvite,
  onOpenDetail,
  onOpenInvitationDetail,
  onOpenInvite,
  saving,
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {jockeys.map((jockey) => (
        <HorseOwnerJockeyCard
          key={jockey.id}
          jockey={jockey}
          onCancelInvite={onCancelInvite}
          onOpenDetail={onOpenDetail}
          onOpenInvitationDetail={onOpenInvitationDetail}
          onOpenInvite={onOpenInvite}
          saving={saving}
        />
      ))}

      {jockeys.length === 0 && (
        <div className="col-span-full py-16 text-center text-white/40">
          <Users className="mx-auto mb-3 h-12 w-12 opacity-30" />
          <p>Không tìm thấy jockey nào</p>
        </div>
      )}
    </div>
  );
}
