'use client';

import { useState } from 'react';
import { Play, Plus, Minus, Info, Clock } from 'lucide-react';
import type { UserLibraryEntry } from '@/lib/types';

interface ContinueWatchingProps {
  entries: UserLibraryEntry[];
  onOpenDetail: (entry: UserLibraryEntry) => void;
  onAddEpisode: (id: string) => void;
  onSubtractEpisode: (id: string) => void;
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

function getProgress(entry: UserLibraryEntry): number {
  if (entry.currentEpisode && entry.media.totalEpisodes) {
    return Math.round((entry.currentEpisode / entry.media.totalEpisodes) * 100);
  }
  return 0;
}

export default function ContinueWatching({ entries, onOpenDetail, onAddEpisode, onSubtractEpisode }: ContinueWatchingProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!entries.length) return null;

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 4, height: 20, background: 'var(--accent-primary)', borderRadius: '99px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>รับชมต่อ</h2>
          <span style={{ background: 'rgba(229, 9, 20, 0.2)', color: 'var(--accent-primary)', borderRadius: '99px', padding: '2px 10px', fontSize: '12px', fontWeight: 800 }}>
            {entries.length} เรื่อง
          </span>
        </div>
      </div>

      {/* Horizontal Shelf */}
      <div className="shelf-row">
        {entries.map((entry) => {
          const isHovered = hoveredId === entry.id;
          const progress = getProgress(entry);

          return (
            <div
              key={entry.id}
              style={{
                flex: '0 0 280px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isHovered ? '0 12px 30px rgba(0,0,0,0.8)' : 'none',
                borderColor: isHovered ? 'var(--accent-primary)' : 'var(--border)',
              }}
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onOpenDetail(entry)}
            >
              {/* Poster Backdrop */}
              <div style={{ position: 'relative', height: '140px', overflow: 'hidden' }}>
                <img
                  src={entry.media.banner || entry.media.poster}
                  alt={entry.media.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 80%)' }} />

                {/* Episode Badge Overlay */}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <span style={{
                    background: 'rgba(0,0,0,0.75)', color: 'white', fontSize: '11px',
                    fontWeight: 800, padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)',
                  }}>
                    {entry.media.type === 'series' && entry.currentSeason ? `ซีซั่น ${entry.currentSeason} ` : ''}ตอนที่ {entry.currentEpisode || 0}
                  </span>
                </div>

                {/* Play Button Center Overlay on Hover */}
                {isHovered && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                      boxShadow: '0 4px 12px rgba(229,9,20,0.6)',
                    }}>
                      <Play size={20} fill="white" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.media.title}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> {timeAgo(entry.updatedAt)}
                  </span>
                  {entry.media.totalEpisodes ? (
                    <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{progress}%</span>
                  ) : null}
                </div>

                {/* Progress bar */}
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{ height: '100%', width: `${Math.max(progress, 3)}%`, background: 'var(--accent-primary)', borderRadius: '99px' }} />
                </div>

                {/* Episode Quick Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onAddEpisode(entry.id)}
                    aria-label={`เพิ่มตอนเรื่อง ${entry.media.title}`}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      background: 'var(--accent-primary)', color: 'white', border: 'none',
                      borderRadius: '4px', padding: '6px 12px', fontSize: '12px', fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> +1 ตอน
                  </button>

                  <button
                    onClick={() => onSubtractEpisode(entry.id)}
                    title="ตอนก่อนหน้า"
                    aria-label="ตอนก่อนหน้า"
                    style={{
                      width: 30, height: 30, borderRadius: '4px', border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                  >
                    <Minus size={13} />
                  </button>

                  <button
                    onClick={() => onOpenDetail(entry)}
                    title="รายละเอียดเพิ่มเติม"
                    aria-label="รายละเอียดเพิ่มเติม"
                    style={{
                      width: 30, height: 30, borderRadius: '4px', border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                  >
                    <Info size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
