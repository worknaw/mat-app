'use client';

import { Clock, Film, Tv, Sparkles } from 'lucide-react';
import type { UserLibraryEntry } from '@/lib/types';

interface RecentlyUpdatedProps {
  entries: UserLibraryEntry[];
  onOpenDetail: (entry: UserLibraryEntry) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชม. ที่แล้ว`;
  if (days === 1) return 'เมื่อวานนี้';
  return `${days} วันที่แล้ว`;
}

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = { anime: Sparkles, movie: Film, series: Tv };
const STATUS_COLOR: Record<string, string> = {
  watching: 'var(--accent-green)', completed: '#60a5fa', dropped: '#f87171', plan_to_watch: 'var(--text-muted)',
};
const STATUS_LABEL: Record<string, string> = {
  watching: 'กำลังดูอยู่', completed: 'ดูจบแล้ว', dropped: 'ดรอป/หยุดดู', plan_to_watch: 'วางแผนจะดู',
};

export default function RecentlyUpdated({ entries, onOpenDetail }: RecentlyUpdatedProps) {
  const recent = entries
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8);

  if (!recent.length) return null;

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div style={{ width: 4, height: 20, background: 'var(--accent-primary)', borderRadius: '99px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>อัปเดตล่าสุด</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {recent.map((entry) => {
          const TypeIcon = TYPE_ICONS[entry.media.type] || Film;
          return (
            <div
              key={entry.id}
              className="card-hover"
              onClick={() => onOpenDetail(entry)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '12px 16px', cursor: 'pointer',
              }}
            >
              {/* Poster */}
              <div style={{ width: 44, height: 60, borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-card)' }}>
                <img src={entry.media.poster} alt={entry.media.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TypeIcon size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.media.title}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {entry.media.type === 'movie'
                    ? 'ภาพยนตร์'
                    : `${entry.currentSeason ? `ซีซั่น ${entry.currentSeason} ` : ''}${entry.currentEpisode ? `ตอนที่ ${entry.currentEpisode}` : ''}`}
                </div>
              </div>

              {/* Status + time */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                <span style={{
                  fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.05)', color: STATUS_COLOR[entry.status] || 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}>{STATUS_LABEL[entry.status]}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Clock size={11} /> {timeAgo(entry.updatedAt)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
