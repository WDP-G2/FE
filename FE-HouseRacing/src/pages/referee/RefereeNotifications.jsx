import { useEffect, useState } from 'react';
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
  LoaderCircle,
  Banknote,
} from 'lucide-react';
import { RefereeLayout } from './RefereeLayout';
import { GlassCard, Pill, GhostButton } from '@/pages/admin/AdminLayout';
import { notificationService } from '@/services/notificationService';
import { getApiErrorMessage } from '@/utils/apiError';

const TYPE_META = {
  reminder: { icon: Clock, tone: 'gold', label: 'Nhắc race' },
  checkin: { icon: ClipboardCheck, tone: 'red', label: 'Check-in' },
  schedule: { icon: Calendar, tone: 'blue', label: 'Lịch' },
  result: { icon: CheckCircle2, tone: 'green', label: 'Kết quả' },
  payout: { icon: Banknote, tone: 'green', label: 'Lương' },
  system: { icon: SettingsIcon, tone: 'purple', label: 'Hệ thống' },
};

function mapNotificationType(beType) {
  const type = String(beType ?? '').toUpperCase();
  if (type.includes('PAYOUT') || type === 'REFEREE_PAYOUT_PAID') return 'payout';
  if (type.includes('CHECK_IN')) return 'checkin';
  if (type.includes('RESULT')) return 'result';
  if (type.includes('RACE') || type.includes('INVITATION')) return 'schedule';
  if (type.includes('STARTED')) return 'reminder';
  return 'system';
}

function mapNotificationLink(item) {
  const type = String(item?.type ?? '').toUpperCase();
  const refId = item?.referenceId;
  if (!refId) return null;
  if (type === 'REFEREE_PAYOUT_PAID') return '/referee/wallet';
  if (type.startsWith('RACE_')) return `/referee/races/${refId}`;
  return null;
}

function formatNotificationTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function mapNotification(item) {
  return {
    id: item.id,
    title: item.title || 'Thông báo',
    body: item.message || '',
    read: Boolean(item.readAt),
    time: formatNotificationTime(item.createdAt),
    type: mapNotificationType(item.type),
    link: mapNotificationLink(item),
  };
}

export function RefereeNotifications() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await notificationService.getMyNotifications({ size: 50 });
      setList((response.content || []).map(mapNotification));
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Không tải được thông báo');
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = tab === 'unread' ? list.filter((n) => !n.read) : list;
  const unread = list.filter((n) => !n.read).length;

  const markAll = async () => {
    try {
      await notificationService.markAllRead();
      setList((items) => items.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(getApiErrorMessage(err) || 'Không thể đánh dấu đã đọc');
    }
  };

  const markOne = async (id) => {
    try {
      await notificationService.markRead(id);
      setList((items) => items.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      setList((items) => items.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  return (
    <RefereeLayout
      title="Trọng tài · Thông báo"
      subtitle={loading ? 'Đang tải...' : `${unread} thông báo chưa đọc`}
      actions={
        <GhostButton icon={CheckCheck} onClick={markAll} disabled={unread === 0 || loading}>
          Đánh dấu đã đọc tất cả
        </GhostButton>
      }
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

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
          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-white/40">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Đang tải từ GET /notifications...
            </div>
          )}
          {!loading && filtered.map((n) => {
            const meta = TYPE_META[n.type] ?? TYPE_META.system;
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
          {!loading && filtered.length === 0 && (
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
