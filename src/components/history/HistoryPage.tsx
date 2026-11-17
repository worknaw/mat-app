'use client';

import { useState } from 'react';
import { Clock, CheckCircle2, PlusCircle, PlayCircle } from 'lucide-react';
import type { WatchHistoryEntry, UserLibraryEntry } from '@/lib/types';

interface HistoryPageProps {
  watchHistory: WatchHistoryEntry[];
  libraryEntries?: UserLibraryEntry[];
}

function formatDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0 && date.getDate() === now.getDate()) return 'วันนี้';
  if (diffDays <= 1) return 'เมื่อวานนี้';
  return date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
}

export default function HistoryPage({ watchHistory, libraryEntries = [] }: HistoryPageProps) {
  const [filterType, setFilterType] = useState<'all' | 'episodes' | 'completed' | 'added'>('all');

  // Build combined chronological timeline events
  const events: Array<{
    id: string;
    type: 'episode' | 'completed' | 'added';
    title: string;
    subtitle: string;
    poster?: string;
    mediaType?: string;
    timestamp: string;
    dateLabel: string;
    timeLabel: string;
    rating?: number;
    badgeColor: string;
    badgeIcon: React.ComponentType<{ size?: number; className?: string }>;
  }> = [];

  // 1. Episode watch events
  watchHistory.forEach((h) => {
    events.push({
      id: `hist-${h.id}`,
      type: 'episode',
      title: h.mediaTitle,
      subtitle: `รับชมตอนที่ ${h.episode || 1} ${h.season ? `(ซีซั่น ${h.season})` : ''}`,
      poster: h.mediaPoster,
      mediaType: h.mediaType,
      timestamp: h.watchedAt,
      dateLabel: formatDateGroup(h.watchedAt),
      timeLabel: formatTime(h.watchedAt),
      badgeColor: 'var(--accent-primary)',
      badgeIcon: PlayCircle,
    });
  });

  // 2. Library added & completed events
  libraryEntries.forEach((entry) => {
    events.push({
      id: `add-${entry.id}`,
      type: 'added',
      title: entry.media.title,
      subtitle: `เพิ่มลงคลังสื่อ (${entry.status === 'watching' ? 'กำลังดู' : entry.status === 'completed' ? 'ดูจบแล้ว' : 'วางแผนจะดู'})`,
      poster: entry.media.poster,
      mediaType: entry.media.type,
      timestamp: entry.addedAt,
      dateLabel: formatDateGroup(entry.addedAt),
      timeLabel: formatTime(entry.addedAt),
      rating: entry.userRating,
      badgeColor: '#60a5fa',
      badgeIcon: PlusCircle,
    });

    if (entry.status === 'completed') {
      events.push({
        id: `comp-${entry.id}`,
        type: 'completed',
        title: entry.media.title,
        subtitle: `รับชมจบสมบูรณ์เรียบร้อย`,
        poster: entry.media.poster,
        mediaType: entry.media.type,
        timestamp: entry.updatedAt,
        dateLabel: formatDateGroup(entry.updatedAt),
        timeLabel: formatTime(entry.updatedAt),
        rating: entry.userRating,
        badgeColor: 'var(--accent-green)',
        badgeIcon: CheckCircle2,
      });
    }
  });

  // Sort events chronologically descending (newest first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (filterType === 'episodes') return e.type === 'episode';
    if (filterType === 'completed') return e.type === 'completed';
    if (filterType === 'added') return e.type === 'added';
    return true;
  });

  // Group events by Date
  const groupedEvents: Record<string, typeof events> = {};
  filteredEvents.forEach((ev) => {
    if (!groupedEvents[ev.dateLabel]) {
      groupedEvents[ev.dateLabel] = [];
    }
    groupedEvents[ev.dateLabel].push(ev);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px' }} className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)' }}>ประวัติการรับชมและกิจกรรม (Watch History & Timeline)</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            บันทึกรายการภาพยนตร์และตอนที่คุณรับชมเรียงตามลำดับเวลาในรูปแบบไทม์ไลน์
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          {[
            { key: 'all', label: 'ประวัติทั้งหมด' },
            { key: 'episodes', label: 'ตอนที่รับชม' },
            { key: 'completed', label: 'ดูจบแล้ว' },
            { key: 'added', label: 'แอดลงคลัง' },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilterType(btn.key as typeof filterType)}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: 'none',
                background: filterType === btn.key ? 'var(--accent-primary)' : 'transparent',
                color: filterType === btn.key ? 'white' : 'var(--text-secondary)',
                fontWeight: filterType === btn.key ? 800 : 500, fontSize: '12px', cursor: 'pointer',
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: '12px', color: 'var(--text-muted)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📜</div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            ยังไม่มีประวัติการรับชม
          </h3>
          <p style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
            เมื่อคุณรับชมภาพยนตร์ หรือกดเพิ่มจำนวนตอนที่ดู ประวัติการรับชมและกิจกรรมจะปรากฏบนไทม์ไลน์ตามเวลาจริงโดยอัตโนมัติ
          </p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '24px', marginTop: '10px' }}>
          {/* Vertical Connecting Glow Line */}
          <div style={{
            position: 'absolute', left: '11px', top: '10px', bottom: '10px',
            width: '2px', background: 'linear-gradient(to bottom, var(--accent-primary), rgba(255,255,255,0.05))',
          }} />

          {Object.entries(groupedEvents).map(([dateGroup, items]) => (
            <div key={dateGroup} style={{ marginBottom: '32px' }}>
              {/* Date Group Label Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(229, 9, 20, 0.15)', border: '1px solid rgba(229, 9, 20, 0.3)',
                color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '99px',
                fontSize: '12px', fontWeight: 800, marginBottom: '16px', position: 'relative', zIndex: 2,
              }}>
                <Clock size={13} /> {dateGroup}
              </div>

              {/* Items under date */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item) => {
                  const Icon = item.badgeIcon;
                  return (
                    <div
                      key={item.id}
                      style={{
                        position: 'relative', display: 'flex', alignItems: 'center', gap: '16px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        borderRadius: '10px', padding: '14px 18px', transition: 'transform 0.15s ease',
                      }}
                      className="card-hover"
                    >
                      {/* Timeline Node Icon */}
                      <div style={{
                        position: 'absolute', left: '-27px', top: '50%', transform: 'translateY(-50%)',
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'var(--bg-primary)', border: `2px solid ${item.badgeColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: item.badgeColor, zIndex: 2, boxShadow: `0 0 8px ${item.badgeColor}66`,
                      }}>
                        <Icon size={12} />
                      </div>

                      {/* Poster */}
                      {item.poster && (
                        <img
                          src={item.poster}
                          alt={item.title}
                          style={{ width: 42, height: 60, borderRadius: '6px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-bright)' }}
                        />
                      )}

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {item.title}
                          </span>
                          {item.mediaType && (
                            <span className={`type-badge type-${item.mediaType}`}>
                              {item.mediaType === 'movie' ? 'ภาพยนตร์' : item.mediaType === 'anime' ? 'อนิเมะ' : 'ซีรีส์'}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {item.subtitle}
                        </div>
                      </div>

                      {/* Right Meta Info */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                          {item.timeLabel}
                        </div>
                        {item.rating ? (
                          <div style={{ fontSize: '12px', color: 'var(--accent-yellow)', fontWeight: 800, marginTop: '4px' }}>
                            ★ {item.rating} / 10
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
