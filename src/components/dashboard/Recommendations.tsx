'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Plus, Loader2, Check, Sparkles, Star } from 'lucide-react';
import type { TrendingItem } from '@/lib/anilist';
import type { UserLibraryEntry } from '@/lib/types';

interface RecommendationsProps {
  onOpenSearch: () => void;
  onAddEntry: (entry: UserLibraryEntry) => void;
  libraryEntries: UserLibraryEntry[];
}

export default function Recommendations({ onOpenSearch, onAddEntry, libraryEntries }: RecommendationsProps) {
  const [items, setItems] = useState<TrendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch('/api/recommendations')
      .then((res) => res.json())
      .then((data) => {
        if (data.recommendations && Array.isArray(data.recommendations)) {
          setItems(data.recommendations);
        }
      })
      .catch((e) => console.error('Failed to load recommendations:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleDirectAdd = useCallback(async (item: TrendingItem) => {
    setAddingId(item.mediaId);
    try {
      const mediaType = item.type === 'ภาพยนตร์' ? 'movie' : 'anime';
      const res = await fetch(`/api/media?type=${mediaType}&id=${item.mediaId}`);
      const data = await res.json();
      if (data.media) {
        const newEntry: UserLibraryEntry = {
          id: `entry-${Date.now()}`,
          mediaId: data.media.id,
          media: data.media,
          status: 'plan_to_watch',
          currentEpisode: 0,
          currentSeason: 1,
          userRating: 0,
          isFavorite: false,
          notes: '',
          platforms: [],
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        onAddEntry(newEntry);
        setAddedIds((prev) => ({ ...prev, [item.mediaId]: true }));
      }
    } catch (e) {
      console.error('Direct add error:', e);
    } finally {
      setAddingId(null);
    }
  }, [onAddEntry]);

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 4, height: 20, background: 'var(--accent-primary)', borderRadius: '99px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>แนะนำยอดนิยมสำหรับคุณ (Live Trending)</h2>
        </div>
        <button
          onClick={onOpenSearch}
          aria-label="ค้นหาเพิ่มเติม"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'transparent', border: 'none', color: 'var(--accent-primary)',
            cursor: 'pointer', fontSize: '14px', fontWeight: 700,
          }}
        >
          ค้นหาเพิ่มเติม <ArrowRight size={16} />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', background: 'var(--bg-secondary)', borderRadius: '8px', color: 'var(--text-muted)' }}>
          <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '10px' }} />
          <span style={{ fontSize: '14px' }}>กำลังดึงข้อมูลรายการแนะนำยอดนิยมสด...</span>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {items.slice(0, 3).map((item) => {
            const inLibrary = addedIds[item.mediaId] || libraryEntries.some((e) => e.media.anilistId === item.mediaId || e.mediaId === `al-${item.mediaId}`);
            const isAdding = addingId === item.mediaId;

            return (
              <div
                key={item.id}
                className="card-hover"
                style={{
                  display: 'flex', gap: '14px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '14px', position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ width: 80, height: 114, borderRadius: '6px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg-card)' }}>
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

                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sparkles size={12} /> {item.reason}
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <span>{item.type}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--accent-orange)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={12} fill="var(--accent-orange)" /> {item.rating}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => !inLibrary && !isAdding && handleDirectAdd(item)}
                    disabled={inLibrary || isAdding}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '8px 14px',
                      background: inLibrary ? 'rgba(70,211,105,0.15)' : 'var(--accent-primary)',
                      color: inLibrary ? 'var(--accent-green)' : 'white',
                      border: inLibrary ? '1px solid rgba(70,211,105,0.3)' : 'none',
                      borderRadius: '6px', fontSize: '12px', fontWeight: 800,
                      cursor: inLibrary ? 'default' : 'pointer', width: 'fit-content', marginTop: '8px',
                    }}
                  >
                    {isAdding ? (
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : inLibrary ? (
                      <><Check size={14} /> อยู่ในคลังแล้ว</>
                    ) : (
                      <><Plus size={14} /> + เพิ่มลงคลังทันที</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
