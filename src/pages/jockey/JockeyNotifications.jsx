import { useState } from "react";
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
import { jockeyNotifications as initNotifs } from "./data";
import { toast } from "sonner";

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

export function JockeyNotifications() {
  const [notifs, setNotifs] = useState(initNotifs);
  const unread = notifs.filter((n) => !n.read).length;
  const markAll = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Đã đánh dấu tất cả là đã đọc");
  };
  const markRead = (id) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  const del = (id) => setNotifs((prev) => prev.filter((n) => n.id !== id));
  return (
    <JockeyLayout
      title="Jockey · Thông báo"
      subtitle={`${unread} thông báo chưa đọc`}
      actions={
        unread > 0 ? (
          <GhostButton icon={Check} onClick={markAll}>
            Đánh dấu tất cả đã đọc
          </GhostButton>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {notifs.map((n) => {
          const Icon = typeIcon(n.type);
          return (
            <GlassCard
              key={n.id}
              className={
                !n.read ? "border-[#D4A017]/20 bg-[#D4A017]/[0.03]" : ""
              }
            >
              <div className="p-4 flex items-start gap-4">
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
                      onClick={() => markRead(n.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  )}
                  <button
                    onClick={() => del(n.id)}
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
      {notifs.length === 0 && (
        <div className="text-center py-16 text-white/40">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Không có thông báo nào</p>
        </div>
      )}
    </JockeyLayout>
  );
}
