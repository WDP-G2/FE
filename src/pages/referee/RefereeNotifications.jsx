import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Clock,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  Settings as SettingsIcon,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, Pill, GhostButton } from '@/pages/admin/AdminLayout';
import { notifications as initial } from './refereeNotificationsMock';

const TYPE_META = {
  reminder: { icon: Clock, tone: 'gold', label: 'Nhắc race' },
  checkin: { icon: ClipboardCheck, tone: 'red', label: 'Check-in' },
  schedule: { icon: Calendar, tone: 'blue', label: 'Lịch' },
  result: { icon: CheckCircle2, tone: 'green', label: 'Kết quả' },
  system: { icon: SettingsIcon, tone: 'purple', label: 'Hệ thống' },
};

export function RefereeNotifications() {
  const [list, setList] = useState(initial);
  const [tab, setTab] = useState('all');

  const filtered = tab === 'unread' ? list.filter((n) => !n.read) : list;
  const unread = list.filter((n) => !n.read).length;

  const markAll = () => setList((l) => l.map((n) => ({ ...n, read: true })));
  const markOne = (id) => setList((l) => l.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <RefereeLayout
      title="Trọng tài · Thông báo"
      subtitle={`${unread} thông báo chưa đọc`}
      actions={
        <GhostButton icon={CheckCheck} onClick={markAll} disabled={unread === 0}>
          Đánh dấu đã đọc tất cả
        </GhostButton>
      }
    >
      <GlassCard>
        <div className="p-5 border-b border-white/10 flex flex-wrap gap-2">
          {[
            { k: 'all', l: 'Tất cả', c: list.length },
            { k: 'unread', l: 'Chưa đọc', c: unread },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                tab === t.k
                  ? 'bg-[#D4A017] text-white shadow-md shadow-[#D4A017]/30'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {t.l}
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${tab === t.k ? 'bg-white/20' : 'bg-white/10'}`}>{t.c}</span>
            </button>
          ))}
        </div>

        <div className="p-3 space-y-2">
          {filtered.map((n) => {
            const meta = TYPE_META[n.type];
            const Icon = meta.icon;
            const inner = (
              <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                n.read
                  ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  : 'bg-[#D4A017]/5 border-[#D4A017]/30 hover:bg-[#D4A017]/10'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  meta.tone === 'gold' ? 'bg-[#D4A017]/15 text-[#D4A017]' :
                  meta.tone === 'green' ? 'bg-emerald-500/15 text-emerald-300' :
                  meta.tone === 'blue' ? 'bg-sky-500/15 text-sky-300' :
                  meta.tone === 'purple' ? 'bg-purple-500/15 text-purple-300' :
                  'bg-red-500/15 text-red-300'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {!n.read && <span className="w-1.5 h-1.5 bg-[#D4A017] rounded-full" />}
                    <Pill tone={meta.tone}>{meta.label}</Pill>
                    <span className="text-[10px] text-white/40 ml-auto">{n.time}</span>
                  </div>
                  <div className="font-bold text-white text-sm">{n.title}</div>
                  <div className="text-xs text-white/60 mt-0.5 leading-relaxed">{n.body}</div>
                  {n.link && (
                    <div className="text-[11px] text-[#D4A017] font-semibold mt-2 flex items-center gap-1">
                      Mở chi tiết <ArrowRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
            return n.link ? (
              <Link key={n.id} to={n.link} onClick={() => markOne(n.id)} className="block">
                {inner}
              </Link>
            ) : (
              <button key={n.id} onClick={() => markOne(n.id)} className="block w-full text-left">
                {inner}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-white/40 text-sm">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              Không có thông báo nào.
            </div>
          )}
        </div>
      </GlassCard>
    </RefereeLayout>
  );
}
