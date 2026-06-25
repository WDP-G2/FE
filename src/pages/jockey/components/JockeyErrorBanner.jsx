import { GlassCard } from "../../admin/AdminLayout";

export function JockeyErrorBanner({ message }) {
  if (!message) return null;

  return (
    <GlassCard className="mb-6 border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
      {message}
    </GlassCard>
  );
}
