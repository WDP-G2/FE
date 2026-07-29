import { useEffect, useState } from "react";
import { Bell, Check, ClipboardX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { notificationService } from "@/services/notificationService";
import { getApiErrorMessage } from "@/utils/apiError";
import { GlassCard, GhostButton } from "../admin/AdminLayout";
import { HorseOwnerLayout } from "./HorseOwnerLayout";

export function HorseOwnerNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    notificationService
      .getMyNotifications({ size: 50 })
      .then((page) => {
        if (!cancelled) setNotifications(page.content || []);
      })
      .catch((error) => {
        if (!cancelled) {
          toast.error(getApiErrorMessage(error) || "Không thể tải thông báo");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const unread = notifications.filter((item) => !item.read).length;

  const openNotification = async (item) => {
    if (!item.read) {
      try {
        await notificationService.markRead(item.id);
        setNotifications((current) =>
          current.map((row) => (row.id === item.id ? { ...row, read: true } : row)),
        );
      } catch {
        // Navigation remains available if marking the notification fails.
      }
    }
    const link =
      item.type === "REGISTRATION_REJECTED"
        ? "/horse-owner/registrations"
        : item.metadata?.link;
    if (link) navigate(link);
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "Không thể đánh dấu đã đọc");
    }
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Thông báo"
      subtitle={loading ? "Đang tải..." : `${unread} thông báo chưa đọc`}
      actions={
        unread > 0 ? (
          <GhostButton icon={Check} onClick={markAllRead}>
            Đánh dấu tất cả đã đọc
          </GhostButton>
        ) : undefined
      }
    >
      {loading ? (
        <GlassCard className="p-10 text-center text-white/50">Đang tải thông báo...</GlassCard>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            const rejected = item.type === "REGISTRATION_REJECTED";
            const Icon = rejected ? ClipboardX : Bell;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openNotification(item)}
                className="block w-full text-left"
              >
                <GlassCard className={!item.read ? "border-[#D4A017]/30 bg-[#D4A017]/[0.04]" : ""}>
                  <div className="flex items-start gap-4 p-4">
                    <Icon className={rejected ? "mt-0.5 h-5 w-5 text-rose-300" : "mt-0.5 h-5 w-5 text-sky-300"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!item.read && <span className="h-2 w-2 rounded-full bg-[#D4A017]" />}
                        <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      </div>
                      <p className="mt-1 text-sm text-white/60">{item.message}</p>
                      <p className="mt-1 text-xs text-white/35">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "—"}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </button>
            );
          })}
          {!notifications.length && (
            <GlassCard className="p-10 text-center text-white/45">
              Chưa có thông báo nào
            </GlassCard>
          )}
        </div>
      )}
    </HorseOwnerLayout>
  );
}
