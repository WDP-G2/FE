import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { jockeyService } from "@/services/jockeyService";
import { buildConflictMap, groupPendingInvitations } from "../utils/jockeyInvitationUtils";

export function useJockeyInvitations() {
  const [invitations, setInvitations] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [acceptTarget, setAcceptTarget] = useState(null);

  const pendingCount = invitations.filter((item) => item.statusCode === "PENDING").length;
  const conflictMap = useMemo(() => buildConflictMap(invitations), [invitations]);
  const pendingGroups = useMemo(() => groupPendingInvitations(invitations), [invitations]);
  const otherInvitations = useMemo(
    () => invitations.filter((item) => item.statusCode !== "PENDING"),
    [invitations],
  );

  const loadInvitations = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const data = await jockeyService.getJockeyInvitations();
      setInvitations(data);
    } catch (error) {
      console.error("Không thể tải lời mời jockey", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể tải lời mời thi đấu");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const reject = async (id) => {
    try {
      setSavingId(id);
      const invitation = await jockeyService.rejectJockeyInvitation(id);
      setInvitations((prev) =>
        prev.map((item) => (item.id === invitation.id ? invitation : item)),
      );
      toast.success("Đã từ chối lời mời thi đấu");
    } catch (error) {
      console.error("Không thể từ chối lời mời", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể từ chối lời mời");
    } finally {
      setSavingId(null);
    }
  };

  const confirmAccept = async () => {
    if (!acceptTarget) return;

    const conflicts = conflictMap[acceptTarget.id]?.pending ?? [];

    try {
      setSavingId(acceptTarget.id);
      await jockeyService.acceptJockeyInvitation(acceptTarget.id);
      setAcceptTarget(null);
      await loadInvitations({ silent: true });
      toast.success(
        conflicts.length > 0
          ? `Đã chấp nhận lời mời. ${conflicts.length} lời mời liên quan đã được cập nhật.`
          : "Đã chấp nhận lời mời thi đấu",
      );
    } catch (error) {
      console.error("Không thể chấp nhận lời mời", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể chấp nhận lời mời");
    } finally {
      setSavingId(null);
    }
  };

  return {
    invitations,
    filter,
    setFilter,
    loading,
    savingId,
    acceptTarget,
    setAcceptTarget,
    pendingCount,
    conflictMap,
    pendingGroups,
    otherInvitations,
    reject,
    confirmAccept,
  };
}
