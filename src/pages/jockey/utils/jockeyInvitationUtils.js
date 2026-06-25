export const INVITATION_STATUS_META = {
  PENDING: { label: "Chờ phản hồi", tone: "gold" },
  ACCEPTED: { label: "Đã nhận", tone: "green" },
  REJECTED: { label: "Từ chối", tone: "red" },
  CANCELLED: { label: "Đã hủy", tone: "gray" },
};

export const INVITATION_FILTERS = [
  { key: "ALL", label: "Tất cả" },
  { key: "PENDING", label: "Chờ phản hồi" },
  { key: "ACCEPTED", label: "Đã nhận" },
  { key: "REJECTED", label: "Từ chối" },
  { key: "CANCELLED", label: "Đã hủy" },
];

export function getInvitationStatusMeta(statusCode) {
  return (
    INVITATION_STATUS_META[statusCode] ?? {
      label: statusCode || "Không rõ",
      tone: "gray",
    }
  );
}

function parseDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatInvitationDate(value, fallback = "Chưa cập nhật") {
  const date = parseDate(value);
  if (!date) return value || fallback;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatInvitationTime(value, fallback = "--:--") {
  const raw = String(value ?? "");
  const match = raw.match(/T(\d{2}:\d{2})/);
  if (match) return match[1];

  const date = parseDate(value);
  if (!date) return fallback;

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatInvitationDateTime(value, fallback = "Chưa cập nhật") {
  if (!value) return fallback;
  return `${formatInvitationDate(value, fallback)} · ${formatInvitationTime(value, "")}`.trim();
}

export function formatRaceWindow(invitation) {
  const start = invitation.raceScheduledStartAt;
  const end = invitation.raceScheduledEndAt;

  if (!start || !end) return "Chưa có lịch race";

  return `${formatInvitationDate(start)} · ${formatInvitationTime(start)} - ${formatInvitationTime(end)}`;
}

function schedulesOverlap(first, second) {
  const firstStart = parseDate(first.raceScheduledStartAt);
  const firstEnd = parseDate(first.raceScheduledEndAt);
  const secondStart = parseDate(second.raceScheduledStartAt);
  const secondEnd = parseDate(second.raceScheduledEndAt);

  if (!firstStart || !firstEnd || !secondStart || !secondEnd) return false;
  return firstStart < secondEnd && firstEnd > secondStart;
}

function conflictReason(candidate, target) {
  if (!candidate || !target || String(candidate.id) === String(target.id)) return null;
  if (candidate.raceId && target.raceId && String(candidate.raceId) === String(target.raceId)) {
    return "Cùng cuộc đua";
  }
  if (schedulesOverlap(candidate, target)) {
    return "Trùng khung giờ";
  }
  return null;
}

export function buildConflictMap(invitations) {
  return invitations.reduce((map, invitation) => {
    if (invitation.statusCode !== "PENDING") {
      map[invitation.id] = { pending: [], accepted: [] };
      return map;
    }

    const pending = [];
    const accepted = [];

    invitations.forEach((candidate) => {
      const reason = conflictReason(candidate, invitation);
      if (!reason) return;

      const item = { invitation: candidate, reason };
      if (candidate.statusCode === "PENDING") {
        pending.push(item);
      } else if (candidate.statusCode === "ACCEPTED") {
        accepted.push(item);
      }
    });

    map[invitation.id] = { pending, accepted };
    return map;
  }, {});
}

export function groupPendingInvitations(invitations) {
  const pendingInvs = invitations.filter((inv) => inv.statusCode === "PENDING");
  const visited = new Set();
  const groups = [];

  for (const inv of pendingInvs) {
    if (visited.has(inv.id)) continue;

    const group = [];
    const queue = [inv];
    visited.add(inv.id);

    while (queue.length > 0) {
      const current = queue.shift();
      group.push(current);

      for (const candidate of pendingInvs) {
        if (!visited.has(candidate.id) && conflictReason(current, candidate)) {
          visited.add(candidate.id);
          queue.push(candidate);
        }
      }
    }

    group.sort((a, b) => (b.remunerationAmount || 0) - (a.remunerationAmount || 0));
    groups.push(group);
  }

  return groups;
}

export function formatGroupTimeRange(group) {
  let earliestStart = null;
  let latestEnd = null;

  group.forEach((inv) => {
    const start = parseDate(inv.raceScheduledStartAt);
    const end = parseDate(inv.raceScheduledEndAt);
    if (start && (!earliestStart || start < earliestStart)) earliestStart = start;
    if (end && (!latestEnd || end > latestEnd)) latestEnd = end;
  });

  if (!earliestStart || !latestEnd) return "Chưa cập nhật lịch";

  const isSameDay = earliestStart.toDateString() === latestEnd.toDateString();
  if (isSameDay) {
    return `${formatInvitationDate(earliestStart)} · ${formatInvitationTime(earliestStart)} - ${formatInvitationTime(latestEnd)}`;
  }

  return `${formatInvitationDate(earliestStart)} · ${formatInvitationTime(earliestStart)} - ${formatInvitationDate(latestEnd)} · ${formatInvitationTime(latestEnd)}`;
}
