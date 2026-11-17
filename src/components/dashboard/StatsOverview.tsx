'use client';

import { Film, Tv, Sparkles, Clock } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalMovies: number;
    totalAnime: number;
    totalSeries: number;
    totalHoursWatched: number;
    watchingCount: number;
    completedCount: number;
    droppedCount: number;
    planToWatchCount: number;
    topGenres: { genre: string; count: number; percent: number }[];
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px 20px',
      }}
    >
      {/* Media Type Counts */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Film size={16} style={{ color: '#5a8af0' }} />
          <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.totalMovies}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>ภาพยนตร์</span>
        </div>

        <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
          <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.totalAnime}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>อนิเมะ</span>
        </div>

        <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tv size={16} style={{ color: 'var(--accent-green)' }} />
          <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-primary)' }}>{stats.totalSeries}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>ซีรีส์</span>
        </div>

        <div style={{ width: '1px', height: '16px', background: 'var(--border)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} style={{ color: 'var(--accent-orange)' }} />
          <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--accent-orange)' }}>{stats.totalHoursWatched}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>ชม. รับชม</span>
        </div>
      </div>

      {/* Status Breakdown Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} />
          <span style={{ color: 'var(--text-muted)' }}>กำลังดู:</span>
          <span style={{ fontWeight: 800, color: 'var(--accent-green)' }}>{stats.watchingCount}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#60a5fa' }} />
          <span style={{ color: 'var(--text-muted)' }}>ดูจบ:</span>
          <span style={{ fontWeight: 800, color: '#60a5fa' }}>{stats.completedCount}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171' }} />
          <span style={{ color: 'var(--text-muted)' }}>ดรอป:</span>
          <span style={{ fontWeight: 800, color: '#f87171' }}>{stats.droppedCount}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-muted)' }} />
          <span style={{ color: 'var(--text-muted)' }}>วางแผน:</span>
          <span style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>{stats.planToWatchCount}</span>
        </div>
      </div>
    </div>
  );
}
