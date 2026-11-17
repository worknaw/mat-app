'use client';

import ContinueWatching from '@/components/dashboard/ContinueWatching';
import StatsOverview from '@/components/dashboard/StatsOverview';
import RecentlyUpdated from '@/components/dashboard/RecentlyUpdated';
import UpcomingEpisodes from '@/components/dashboard/UpcomingEpisodes';
import Recommendations from '@/components/dashboard/Recommendations';
import type { UserLibraryEntry } from '@/lib/types';

interface DashboardProps {
  library: {
    continueWatching: UserLibraryEntry[];
    state: { library: UserLibraryEntry[] };
    stats: {
      totalMovies: number; totalAnime: number; totalSeries: number;
      totalHoursWatched: number; watchingCount: number; completedCount: number;
      droppedCount: number; planToWatchCount: number;
      topGenres: { genre: string; count: number; percent: number }[];
    };
    addEpisode: (id: string) => void;
    subtractEpisode: (id: string) => void;
    addEntry: (entry: UserLibraryEntry) => void;
    hydrated: boolean;
  };
  onOpenDetail: (entry: UserLibraryEntry) => void;
  onOpenSearch: () => void;
}

export default function Dashboard({ library, onOpenDetail, onOpenSearch }: DashboardProps) {
  if (!library.hydrated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          <div>กำลังโหลดคลังสื่อของคุณ...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', maxWidth: '1400px', margin: '0 auto' }} className="fade-in">
      {/* Analytics Overview Bar */}
      <StatsOverview stats={library.stats} />

      {/* Continue Watching Shelf */}
      {library.continueWatching.length > 0 && (
        <ContinueWatching
          entries={library.continueWatching}
          onOpenDetail={onOpenDetail}
          onAddEpisode={library.addEpisode}
          onSubtractEpisode={library.subtractEpisode}
        />
      )}

      {/* Upcoming Episodes Calendar Shelf */}
      <UpcomingEpisodes />

      {/* Recently Updated & Top Genres Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px' }}>
        <RecentlyUpdated entries={library.state.library} onOpenDetail={onOpenDetail} />

        {/* Top Genres */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: 4, height: 20, background: 'var(--accent-primary)', borderRadius: '99px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>หมวดหมู่อยอดนิยม</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {library.stats.topGenres.slice(0, 6).map((g, i) => (
              <div
                key={g.genre}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)', borderRadius: '8px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent-primary)', minWidth: '24px' }}>#{i + 1}</span>
                <span style={{ flex: 1, fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>{g.genre}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${g.percent}%`, background: 'var(--accent-primary)', borderRadius: '99px' }} />
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', minWidth: '34px', textAlign: 'right', fontWeight: 600 }}>{g.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recommended For You */}
      <Recommendations
        onOpenSearch={onOpenSearch}
        onAddEntry={library.addEntry}
        libraryEntries={library.state.library}
      />
    </div>
  );
}
