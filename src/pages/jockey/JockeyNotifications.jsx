import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Trophy,
  CheckCircle,
  AlertTriangle,
  Info,
  Check,
  Trash2,
} from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import { GlassCard, GhostButton } from "../admin/AdminLayout";
import { notificationService } from "@/services/notificationService";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";

const typeIcon = (type) =>
  type === "success"
    ? CheckCircle
    : type === "warning"
      ? AlertTriangle
      : type === "trophy"
        ? Trophy
        : Info;

const typeBg = (type) =>
  type === "success"
    ? "bg-emerald-500/15 text-emerald-300"
    : type === "warning"
      ? "bg-amber-500/15 text-amber-300"
      : type === "trophy"
        ? "bg-[#D4A017]/15 text-[#D4A017]"
        : "bg-sky-500/15 text-sky-300";

function mapNotificationType(beType) {
  const type = String(beType ?? "").toUpperCase();
  if (type.includes("RESULT") || type.includes("PAYOUT")) return "trophy";
  if (type.includes("INVITATION") || type.includes("RACE")) return "warning";
  if (type.includes("ACCEPT") || type.includes("SUCCESS")) return "success";
  return "info";
}

function mapNotification(item) {
  return {
    id: item.id,
    title: item.title || "Thông báo",
    body: item.message || "",
    read: item.readStatus === "READ" || item.read === true,
    type: mapNotificationType(item.type),
    link:
      item.type === "JOCKEY_ASSIGNMENT_CANCELLED"
        ? "/jockey/invitations"
        : item.metadata?.link || "",
    time: item.createdAt
      ? new Date(item.createdAt).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—",
  };
}

export function JockeyNotifications() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await notificationService.getMyNotifications({ size: 50 });
      setNotifs((response.content ?? []).map(mapNotification));
    } catch (err) {
      setError(getApiErrorMessage(err) || "Không thể tải thông báo");
      setNotifs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  const markAll = async () => {
    try {
      await notificationService.markAllRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Không thể đánh dấu đã đọc");
    }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  return (
    <JockeyLayout
      title="Jockey · Thông báo"
      subtitle={loading ? "Đang tải..." : `${unread} thông báo chưa đọc`}
      actions={
        unread > 0 ? (
          <GhostButton icon={Check} onClick={markAll}>
            Đánh dấu tất cả đã đọc
          </GhostButton>
        ) : undefined
      }
    >
      {error && (
        <GlassCard className="mb-6 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </GlassCard>
      )}

      {loading ? (
        <GlassCard className="p-10 text-center text-white/50">Đang tải thông báo...</GlassCard>
      ) : (
        <div className="space-y-3">
          {notifs.map((n) => {
            const Icon = typeIcon(n.type);
            return (
              <GlassCard
                key={n.id}
                className={`${!n.read ? "border-[#D4A017]/20 bg-[#D4A017]/[0.03]" : ""} ${n.link ? "cursor-pointer" : ""}`}
              >
                <div
                  className="p-4 flex items-start gap-4"
                  onClick={() => {
                    if (!n.read) markRead(n.id);
                    if (n.link) navigate(n.link);
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeBg(n.type)}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {!n.read && (
                        <span className="w-2 h-2 bg-[#D4A017] rounded-full flex-shrink-0" />
                      )}
                      <h3 className="text-sm font-bold text-white">{n.title}</h3>
                    </div>
                    <p className="text-sm text-white/60">{n.body}</p>
                    <p className="text-xs text-white/40 mt-1">{n.time}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          markRead(n.id);
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-lg"
                      >
                        <Check className="w-3.5 h-3.5 text-white/50" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setNotifs((prev) => prev.filter((item) => item.id !== n.id));
                      }}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white/30 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {!loading && notifs.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Không có thông báo nào</p>
        </div>
      )}
    </JockeyLayout>
  );
}
