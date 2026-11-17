'use client';

import { useState } from 'react';
import { LayoutGrid, List, Search, Plus, Sparkles, Film, Tv, Heart, Star, SearchX } from 'lucide-react';
import type { UserLibraryEntry, FilterState, WatchStatus, MediaType, SortOption, ViewMode } from '@/lib/types';

interface LibraryPageProps {
  library: {
    filteredLibrary: UserLibraryEntry[];
    filter: FilterState;
    setFilter: (f: FilterState) => void;
    addEpisode: (id: string) => void;
    subtractEpisode: (id: string) => void;
    handleExportJSON: () => void;
    handleExportCSV: () => void;
  };
  onOpenDetail: (entry: UserLibraryEntry) => void;
  onOpenSearch: () => void;
}

const STATUS_OPTIONS: { value: WatchStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'watching', label: 'กำลังดูอยู่' },
  { value: 'completed', label: 'ดูจบแล้ว' },
  { value: 'dropped', label: 'ดรอป/หยุดดู' },
  { value: 'plan_to_watch', label: 'วางแผนจะดู' },
];

const TYPE_OPTIONS: { value: MediaType | 'all'; label: string }[] = [
  { value: 'all', label: 'ทุกประเภท' },
  { value: 'anime', label: 'อนิเมะ' },
  { value: 'movie', label: 'ภาพยนตร์' },
  { value: 'series', label: 'ซีรีส์' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recently_updated', label: 'อัปเดตล่าสุด' },
  { value: 'recently_added', label: 'เพิ่มล่าสุด' },
  { value: 'a_z', label: 'เรียงตามชื่อ A-Z' },
  { value: 'rating', label: 'คะแนนของคุณ' },
  { value: 'release_date', label: 'ปีที่ออกฉาย' },
];

const STATUS_COLOR: Record<string, string> = {
  watching: 'var(--accent-green)', completed: '#60a5fa', dropped: '#f87171', plan_to_watch: 'var(--text-muted)',
};
const STATUS_LABEL: Record<string, string> = {
  watching: 'กำลังดูอยู่', completed: 'ดูจบแล้ว', dropped: 'ดรอป/หยุดดู', plan_to_watch: 'วางแผนจะดู',
};
const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  anime: Sparkles, movie: Film, series: Tv,
};

function getProgress(entry: UserLibraryEntry): number {
  if (entry.media.type === 'movie') return entry.progressPercent || 0;
  if (entry.currentEpisode && entry.media.totalEpisodes) {
    return Math.round((entry.currentEpisode / entry.media.totalEpisodes) * 100);
  }
  return 0;
}

export default function LibraryPage({ library, onOpenDetail, onOpenSearch }: LibraryPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { filter, setFilter, filteredLibrary } = library;

  function updateFilter(updates: Partial<FilterState>) {
    setFilter({ ...filter, ...updates });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)' }}>คลังสื่อของคุณ</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>พบทั้งหมด {filteredLibrary.length} รายการ</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            id="library-export-json"
            onClick={library.handleExportJSON}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}
          >ส่งออก JSON</button>
          <button
            id="library-export-csv"
            onClick={library.handleExportCSV}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}
          >ส่งออก CSV</button>
          <button
            id="library-add"
            onClick={onOpenSearch}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent-primary)',
              color: 'white', border: 'none', borderRadius: '6px',
              padding: '8px 16px', cursor: 'pointer', fontWeight: 800, fontSize: '13px',
            }}
          >
            <Plus size={15} /> + เพิ่มสื่อใหม่
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: '8px', padding: '12px 16px',
      }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', padding: '7px 12px', flex: '1', minWidth: '180px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            id="library-search"
            value={filter.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
            placeholder="ค้นหาในคลังสื่อ..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', flex: 1 }}
          />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              id={`library-filter-${s.value}`}
              onClick={() => updateFilter({ status: s.value })}
              style={{
                padding: '6px 12px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                background: filter.status === s.value ? 'rgba(229, 9, 20, 0.2)' : 'rgba(255,255,255,0.04)',
                color: filter.status === s.value ? 'var(--accent-primary)' : 'var(--text-muted)',
                outline: filter.status === s.value ? '1px solid var(--accent-primary)' : 'none',
                transition: 'all 0.15s',
              }}
            >{s.label}</button>
          ))}
        </div>

        {/* Type filter */}
        <select
          id="library-type-filter"
          value={filter.type}
          onChange={(e) => updateFilter({ type: e.target.value as MediaType | 'all' })}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '6px 10px', color: 'var(--text-primary)',
            fontSize: '13px', outline: 'none', cursor: 'pointer',
          }}
        >
          {TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        {/* Sort */}
        <select
          id="library-sort"
          value={filter.sort}
          onChange={(e) => updateFilter({ sort: e.target.value as SortOption })}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
            borderRadius: '6px', padding: '6px 10px', color: 'var(--text-primary)',
            fontSize: '13px', outline: 'none', cursor: 'pointer',
          }}
        >
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        {/* View toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginLeft: 'auto' }}>
          {([['grid', LayoutGrid], ['list', List]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              id={`library-view-${mode}`}
              onClick={() => setViewMode(mode as ViewMode)}
              style={{
                padding: '7px 10px', border: 'none', cursor: 'pointer',
                background: viewMode === mode ? 'rgba(229, 9, 20, 0.2)' : 'transparent',
                color: viewMode === mode ? 'var(--accent-primary)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center',
              }}
            ><Icon size={15} /></button>
          ))}
        </div>
      </div>

      {/* Content */}
      {filteredLibrary.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <SearchX size={40} style={{ marginBottom: '12px', color: 'var(--text-muted)' }} />
          <div style={{ fontSize: '16px', marginBottom: '6px', color: 'var(--text-secondary)', fontWeight: 700 }}>ไม่พบรายการในคลัง</div>
          <div>ลองปรับเปลี่ยนตัวกรองหรือค้นหาด้วยคำอื่น</div>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
          {filteredLibrary.map((entry) => {
            const TypeIcon = TYPE_ICONS[entry.media.type] || Film;
            return (
              <div
                key={entry.id}
                className="card-hover poster-wrap"
                onClick={() => onOpenDetail(entry)}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
                }}
              >
                {/* Poster */}
                <div style={{ position: 'relative', aspectRatio: '2/3', overflow: 'hidden', background: '#1a1a26' }}>
                  <img className="poster-img" src={entry.media.poster} alt={entry.media.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* Overlay */}
                  <div className="poster-overlay" style={{ position: 'absolute', inset: 0 }} />
                  {/* Type badge */}
                  <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', padding: '4px' }}>
                    <TypeIcon size={13} style={{ color: 'var(--accent-primary)' }} />
                  </div>
                  {/* Favorite */}
                  {entry.isFavorite && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', borderRadius: '4px', padding: '4px' }}>
                      <Heart size={13} fill="var(--accent-primary)" style={{ color: 'var(--accent-primary)' }} />
                    </div>
                  )}
                  {/* Progress bar */}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                    {(entry.currentEpisode || 0) > 0 && entry.media.totalEpisodes && (
                      <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)' }}>
                        <div style={{
                          height: '100%',
                          width: `${getProgress(entry)}%`,
                          background: 'var(--accent-primary)',
                        }} />
                      </div>
                    )}
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: '10px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                    {entry.media.title}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: STATUS_COLOR[entry.status], fontWeight: 700 }}>
                      {STATUS_LABEL[entry.status]}
                    </span>
                    {entry.currentEpisode && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ep {entry.currentEpisode}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredLibrary.map((entry) => {
            const TypeIcon = TYPE_ICONS[entry.media.type] || Film;
            return (
              <div
                key={entry.id}
                className="card-hover"
                onClick={() => onOpenDetail(entry)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: '8px', padding: '12px 16px', cursor: 'pointer',
                }}
              >
                <div style={{ width: 44, height: 62, borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={entry.media.poster} alt={entry.media.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TypeIcon size={14} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
                    <span>{entry.media.title}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {entry.media.year} • {entry.media.genres.slice(0, 3).join(', ')}
                  </div>
                  {entry.media.totalEpisodes && (
                    <div className="progress-bar" style={{ width: '120px', marginTop: '6px' }}>
                      <div className="progress-fill" style={{ width: `${getProgress(entry)}%` }} />
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: STATUS_COLOR[entry.status] }}>
                    {STATUS_LABEL[entry.status]}
                  </span>
                  {entry.currentEpisode && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Ep {entry.currentEpisode}{entry.media.totalEpisodes ? `/${entry.media.totalEpisodes}` : ''}
                    </span>
                  )}
                  {entry.userRating ? (
                    <span style={{ fontSize: '12px', color: 'var(--accent-orange)', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 700 }}>
                      <Star size={12} fill="var(--accent-orange)" /> {entry.userRating}
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
