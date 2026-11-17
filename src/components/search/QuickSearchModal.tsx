'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, Check, Zap, Loader2, Sparkles, Film, Tv, SearchX, Star } from 'lucide-react';
import type { SearchResult, UserLibraryEntry, MediaItem, WatchStatus } from '@/lib/types';
import { getMovieDetail, getSeriesDetail } from '@/lib/tmdb';
import { getAnimeDetail } from '@/lib/anilist';

interface QuickSearchModalProps {
  onClose: () => void;
  libraryEntries: UserLibraryEntry[];
  onAddEntry: (entry: UserLibraryEntry) => void;
}

const TYPE_LABELS: Record<string, { label: string; className: string; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }> }> = {
  anime: { label: 'อนิเมะ', className: 'badge-anime', Icon: Sparkles },
  movie: { label: 'ภาพยนตร์', className: 'badge-movie', Icon: Film },
  series: { label: 'ซีรีส์', className: 'badge-series', Icon: Tv },
};

export default function QuickSearchModal({ onClose, libraryEntries, onAddEntry }: QuickSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set(
    libraryEntries.map((e) => e.mediaId)
  ));
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Ctrl+K / Escape handling
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.length < 2) {
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleAdd = useCallback(async (result: SearchResult, status: WatchStatus = 'watching') => {
    if (addedIds.has(result.id)) return;
    setAdding(result.id);

    try {
      // Fetch full detail
      let media: MediaItem | null = null;
      if (result.type === 'anime' && result.anilistId) {
        media = await getAnimeDetail(result.anilistId);
      } else if (result.type === 'movie' && result.tmdbId) {
        media = await getMovieDetail(result.tmdbId);
      } else if (result.type === 'series' && result.tmdbId) {
        media = await getSeriesDetail(result.tmdbId);
      }

      if (!media) {
        // Fallback: use search result data
        media = {
          id: result.id,
          tmdbId: result.tmdbId,
          anilistId: result.anilistId,
          type: result.type,
          title: result.title,
          poster: result.poster,
          description: '',
          genres: [],
          rating: result.rating || 0,
          year: result.year,
        };
      }

      const entry: UserLibraryEntry = {
        id: `entry-${Date.now()}`,
        mediaId: result.id,
        media,
        status,
        isFavorite: false,
        currentEpisode: status === 'watching' ? 1 : undefined,
        currentSeason: media.type === 'series' ? 1 : undefined,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startedAt: status === 'watching' ? new Date().toISOString() : undefined,
      };

      onAddEntry(entry);
      setAddedIds((prev) => new Set([...prev, result.id]));
    } catch (e) {
      console.error('Add entry error:', e);
    } finally {
      setAdding(null);
    }
  }, [addedIds, onAddEntry]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ค้นหาสื่อด่วน"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-enter"
        style={{
          width: '640px', maxWidth: '95vw',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-bright)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <Search size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            id="quick-search-input"
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (!val.trim() || val.length < 2) {
                setResults([]);
                setLoading(false);
              }
            }}
            placeholder="พิมพ์ชื่อภาพยนตร์, อนิเมะ หรือซีรีส์ที่ต้องการค้นหา..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontSize: '16px',
            }}
          />
          {loading && <Loader2 size={18} style={{ color: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />}
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700,
            }}
          >ESC</button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
          {!query && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Zap size={32} style={{ margin: '0 auto 12px', color: 'var(--accent-primary)', opacity: 0.8 }} />
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>ค้นหาและเพิ่มรายการใน 3 วินาที</div>
              <div style={{ fontSize: '13px' }}>พิมพ์ชื่อเรื่องที่ต้องการค้นหาในระบบฐานข้อมูลภาพยนตร์ อนิเมะ และซีรีส์</div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['One Piece', 'Inception', 'Breaking Bad', 'Frieren'].map((s) => (
                  <button key={s} onClick={() => setQuery(s)} style={{
                    background: 'rgba(229, 9, 20, 0.15)', border: '1px solid rgba(229, 9, 20, 0.3)',
                    borderRadius: '99px', padding: '6px 14px', cursor: 'pointer',
                    color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(229, 9, 20, 0.3)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(229, 9, 20, 0.15)'; }}
                  >{s}</button>
                ))}
              </div>
            </div>
          )}

          {query && !loading && results.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <SearchX size={36} style={{ margin: '0 auto 8px', color: 'var(--text-muted)' }} />
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>ไม่พบผลลัพธ์สำหรับ &quot;{query}&quot;</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>ลองพิมพ์ด้วยชื่อภาษาอังกฤษ หรือคำค้นหาอื่น</div>
            </div>
          )}

          {results.length > 0 && (
            <div style={{ padding: '8px' }}>
              {results.map((result) => {
                const isAdded = addedIds.has(result.id);
                const isAdding = adding === result.id;
                const typeInfo = TYPE_LABELS[result.type] || TYPE_LABELS.anime;
                const FallbackIcon = typeInfo.Icon;

                return (
                  <div
                    key={result.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      padding: '10px 12px', borderRadius: '10px',
                      transition: 'background 0.15s',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    {/* Poster */}
                    <div style={{
                      width: 44, height: 62, borderRadius: '6px', overflow: 'hidden', flexShrink: 0,
                      background: 'rgba(255,255,255,0.05)',
                    }}>
                      {result.poster && result.poster !== '/placeholder.jpg' ? (
                        <img src={result.poster} alt={result.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <FallbackIcon size={20} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {result.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span className={`badge ${typeInfo.className}`}>{typeInfo.label}</span>
                        {result.year > 0 && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{result.year}</span>}
                        {result.rating && result.rating > 0 && (
                          <span style={{ fontSize: '12px', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                            <Star size={12} fill="var(--accent-orange)" /> {result.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Add button */}
                    <button
                      id={`add-${result.id}`}
                      onClick={() => handleAdd(result, 'watching')}
                      disabled={isAdded || isAdding}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '6px', border: 'none',
                        cursor: isAdded ? 'default' : 'pointer',
                        fontWeight: 700, fontSize: '13px',
                        background: isAdded
                          ? 'rgba(70, 211, 105, 0.15)'
                          : 'var(--accent-primary)',
                        color: isAdded ? 'var(--accent-green)' : 'white',
                        transition: 'all 0.2s',
                        minWidth: '95px',
                        justifyContent: 'center',
                      }}
                    >
                      {isAdding ? (
                        <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : isAdded ? (
                        <><Check size={14} /> เพิ่มแล้ว</>
                      ) : (
                        <><Plus size={14} /> เพิ่มลงคลัง</>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: '20px', fontSize: '12px', color: 'var(--text-muted)',
          background: 'var(--bg-primary)',
        }}>
          <span>พิมพ์เพื่อค้นหา</span>
          <span>กดเพื่อเพิ่มสถานะกำลังดูอยู่</span>
          <span>ESC เพื่อปิดหน้าต่าง</span>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
