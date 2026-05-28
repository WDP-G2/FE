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
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { GlassCard, GhostButton } from "../admin/AdminLayout";
import { ownerNotifications as initNotifs } from "./data";
import { toast } from "sonner";

const typeIcon = (type) => {
  if (type === "success") return CheckCircle;
  if (type === "warning") return AlertTriangle;
  if (type === "trophy") return Trophy;
  return Info;
};

const typeBg = (type) => {
  if (type === "success") return "bg-emerald-500/15 text-emerald-300";
  if (type === "warning") return "bg-amber-500/15 text-amber-300";
  if (type === "trophy") return "bg-[#D4A017]/15 text-[#D4A017]";
  return "bg-sky-500/15 text-sky-300";
};

export function HorseOwnerNotifications() {
  const [notifs, setNotifs] = useState(initNotifs);
  const [filter, setFilter] = useState("Tất cả");

  const unread = notifs.filter((n) => !n.read).length;
  const filtered =
    filter === "Chưa đọc" ? notifs.filter((n) => !n.read) : notifs;

  const markAll = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Đã đánh dấu tất cả là đã đọc");
  };

  const markRead = (id) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const deleteNotif = (id) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Thông báo"
      subtitle={`${unread} thông báo chưa đọc`}
      actions={
        unread > 0 ? (
          <GhostButton icon={Check} onClick={markAll}>
            Đánh dấu tất cả đã đọc
          </GhostButton>
        ) : undefined
      }
    >
      <div className="flex items-center gap-2 mb-6">
        {["Tất cả", "Chưa đọc"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              filter === f
                ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30"
                : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
            }`}
          >
            {f}{" "}
            {f === "Chưa đọc" && unread > 0 && (
              <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((n) => {
          const Icon = typeIcon(n.type);
          return (
            <GlassCard
              key={n.id}
              className={`transition-all ${!n.read ? "border-[#D4A017]/20 bg-[#D4A017]/[0.03]" : ""}`}
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
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.read && (
                    <button
                      onClick={() => markRead(n.id)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                      title="Đánh dấu đã đọc"
                    >
                      <Check className="w-3.5 h-3.5 text-white/50" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(n.id)}
                    className="p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Xóa"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white/30 hover:text-red-400" />
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/40">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Không có thông báo nào</p>
          </div>
        )}
      </div>
    </HorseOwnerLayout>
  );
}
