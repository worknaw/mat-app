'use client';

import { useState, useEffect } from 'react';
import { Bell, Loader2, ArrowRight, ChevronUp, CheckCircle2 } from 'lucide-react';
import type { AiringScheduleItem } from '@/lib/anilist';

export default function UpcomingEpisodes() {
  const [upcoming, setUpcoming] = useState<AiringScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [notified, setNotified] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/upcoming')
      .then((res) => res.json())
      .then((data) => {
        if (data.schedules && Array.isArray(data.schedules)) {
          setUpcoming(data.schedules);
        }
      })
      .catch((e) => console.error('Failed to load upcoming schedules:', e))
      .finally(() => setLoading(false));
  }, []);

  function toggleNotification(item: AiringScheduleItem) {
    const isNowNotified = !notified[item.id];
    setNotified((prev) => ({ ...prev, [item.id]: isNowNotified }));

    const msg = isNowNotified
      ? `ตั้งเตือน: ${item.title} (ตอนที่ ${item.episode}) เรียบร้อยแล้ว`
      : `ยกเลิกการเตือน: ${item.title}`;

    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }

  if (!loading && upcoming.length === 0) {
    return null;
  }

  const displayedUpcoming = upcoming.slice(0, showAll ? upcoming.length : 4);

  return (
    <section style={{ position: 'relative' }}>
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          background: 'var(--bg-secondary)', border: '1px solid var(--accent-primary)',
          borderRadius: '8px', padding: '12px 18px', color: 'var(--text-primary)',
          fontSize: '14px', fontWeight: 700, boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--accent-primary)' }} />
          {toastMsg}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 4, height: 20, background: 'var(--accent-primary)', borderRadius: '99px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>ปฏิทินตอนใหม่ที่กำลังจะออนแอร์ (Live Airing)</h2>
        </div>

        {upcoming.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            aria-label={showAll ? 'ย่อลง' : 'ดูเพิ่มเติม'}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: 'none', color: 'var(--accent-primary)',
              cursor: 'pointer', fontSize: '14px', fontWeight: 700,
            }}
          >
            {showAll ? (
              <>ย่อลง <ChevronUp size={16} /></>
            ) : (
              <>ดูเพิ่มเติม ({upcoming.length}) <ArrowRight size={16} /></>
            )}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '10px' }} />
          <span style={{ fontSize: '14px' }}>กำลังดึงข้อมูลปฏิทินตอนใหม่ออนแอร์สด...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {displayedUpcoming.map((item) => {
            const isBellActive = notified[item.id];
            return (
              <div
                key={item.id}
                className="card-hover"
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '14px', cursor: 'pointer',
                }}
              >
                <div style={{ width: 48, height: 68, borderRadius: '4px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-card)' }}>
                  <img
                    src={item.poster}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80';
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
                      background: item.dayGroup === 'วันนี้' ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                      color: item.dayGroup === 'วันนี้' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    }}>{item.dayGroup}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.airDate}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    ตอนที่ {item.episode}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNotification(item);
                  }}
                  title={isBellActive ? 'ยกเลิกการเตือน' : 'เปิดแจ้งเตือนตอนใหม่'}
                  style={{
                    background: isBellActive ? 'rgba(229, 9, 20, 0.2)' : 'transparent',
                    border: isBellActive ? '1px solid var(--accent-primary)' : 'none',
                    borderRadius: '50%', padding: '6px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Bell size={18} style={{ color: isBellActive ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
