'use client';

import { useState, useEffect } from 'react';
import { useLibrary } from '@/hooks/useLibrary';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Dashboard from '@/components/dashboard/Dashboard';
import LibraryPage from '@/components/library/LibraryPage';
import StatsPage from '@/components/stats/StatsPage';
import HistoryPage from '@/components/history/HistoryPage';
import SettingsPage from '@/components/settings/SettingsPage';
import QuickSearchModal from '@/components/search/QuickSearchModal';
import MediaDetailModal from '@/components/media/MediaDetailModal';
import AuthModal from '@/components/auth/AuthModal';

// Story Chronology Components & Presets
import ChronologyHub from '@/components/timeline/ChronologyHub';
import ChronologyTimelineView from '@/components/timeline/ChronologyTimelineView';
import CreateUniverseModal from '@/components/timeline/CreateUniverseModal';
import { PRESET_UNIVERSES, type UniversePreset, type TimelineNodeItem } from '@/lib/chronologyPresets';
import { findMatchingLibraryEntry } from '@/lib/timelineApi';

import type { UserLibraryEntry, MediaItem } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

export type PageView = 'home' | 'library' | 'chronology' | 'stats' | 'history' | 'settings';

export default function Home() {
  const [page, setPage] = useState<PageView>('home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [detailEntry, setDetailEntry] = useState<UserLibraryEntry | null>(null);

  // Chronology State
  const [universes, setUniverses] = useState<UniversePreset[]>(PRESET_UNIVERSES);
  const [selectedUniverse, setSelectedUniverse] = useState<UniversePreset | null>(null);
  const [createUniverseOpen, setCreateUniverseOpen] = useState(false);

  const library = useLibrary();

  // Supabase Auth Check & Subscription
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { continueWatching, addEpisode } = library;

  // Keyboard shortcuts listener: Ctrl+K for search, Space for next episode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }

      if (e.code === 'Space' && !searchOpen && !authOpen && !detailEntry && !createUniverseOpen) {
        e.preventDefault();
        if (continueWatching.length > 0) {
          addEpisode(continueWatching[0].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, authOpen, detailEntry, createUniverseOpen, continueWatching, addEpisode]);

  // Handle toggling "Watched" state for a timeline node
  const handleToggleWatchedNode = (node: TimelineNodeItem) => {
    // Search if already in user library using robust matching
    const matchedEntry = findMatchingLibraryEntry(library.state.library, node);

    if (matchedEntry) {
      if (matchedEntry.status === 'completed') {
        library.updateEntry(matchedEntry.id, { status: 'plan_to_watch', currentEpisode: 0 });
      } else {
        library.updateEntry(matchedEntry.id, { status: 'completed', currentEpisode: node.episodes || 1 });
      }
    } else {
      const newMedia: MediaItem = {
        id: node.id ? `node-${node.id}` : (node.tmdbId ? `tmdb-${node.tmdbId}` : `media-node-${node.id}`),
        tmdbId: node.tmdbId,
        anilistId: node.anilistId,
        type: node.type === 'anime' || node.type === 'ova' ? 'anime' : node.type === 'series' ? 'series' : 'movie',
        title: node.title,
        titleEnglish: node.titleEnglish || node.title,
        poster: node.poster,
        banner: node.banner || node.poster,
        description: node.synopsis,
        genres: [node.era, 'Story Chronology'],
        rating: 8.5,
        year: node.releaseYear,
        runtime: node.runtimeMinutes || 120,
        totalEpisodes: node.episodes || 1,
      };

      const newEntry: UserLibraryEntry = {
        id: `entry-${Date.now()}`,
        mediaId: newMedia.id,
        media: newMedia,
        status: 'completed',
        currentEpisode: node.episodes || 1,
        userRating: 9,
        isFavorite: false,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      library.addEntry(newEntry);
    }
  };

  // Handle updating episode progress specifically for series/anime in timeline
  const handleUpdateEpisodeNode = (node: TimelineNodeItem, targetEpisode: number) => {
    const totalEpisodes = node.episodes || 1;
    const clampedEpisode = Math.max(0, Math.min(targetEpisode, totalEpisodes));

    const matchedEntry = findMatchingLibraryEntry(library.state.library, node);

    const newStatus: 'completed' | 'watching' | 'plan_to_watch' =
      clampedEpisode >= totalEpisodes ? 'completed' : clampedEpisode > 0 ? 'watching' : 'plan_to_watch';

    if (matchedEntry) {
      library.updateEntry(matchedEntry.id, {
        currentEpisode: clampedEpisode,
        status: newStatus,
      });
    } else {
      const newMedia: MediaItem = {
        id: node.id ? `node-${node.id}` : (node.tmdbId ? `tmdb-${node.tmdbId}` : `media-node-${node.id}`),
        tmdbId: node.tmdbId,
        anilistId: node.anilistId,
        type: node.type === 'anime' || node.type === 'ova' ? 'anime' : node.type === 'series' ? 'series' : 'movie',
        title: node.title,
        titleEnglish: node.titleEnglish || node.title,
        poster: node.poster,
        banner: node.banner || node.poster,
        description: node.synopsis,
        genres: [node.era, 'Story Chronology'],
        rating: 8.5,
        year: node.releaseYear,
        runtime: node.runtimeMinutes || 120,
        totalEpisodes: totalEpisodes,
      };

      const newEntry: UserLibraryEntry = {
        id: `entry-${Date.now()}`,
        mediaId: newMedia.id,
        media: newMedia,
        currentEpisode: clampedEpisode,
        status: newStatus,
        userRating: 9,
        isFavorite: false,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      library.addEntry(newEntry);
    }
  };

  // Open full MediaDetailModal (same as homepage) when clicking a timeline item
  const handleOpenNodeDetail = (node: TimelineNodeItem) => {
    const matchedEntry = findMatchingLibraryEntry(library.state.library, node);

    if (matchedEntry) {
      if (node.poster && matchedEntry.media.poster !== node.poster) {
        matchedEntry.media.poster = node.poster;
        library.updateEntry(matchedEntry.id, {
          media: { ...matchedEntry.media, poster: node.poster }
        });
      }
      setDetailEntry({ ...matchedEntry });
    } else {
      const newMedia: MediaItem = {
        id: node.id ? `node-${node.id}` : (node.tmdbId ? `tmdb-${node.tmdbId}` : `media-node-${node.id}`),
        tmdbId: node.tmdbId,
        anilistId: node.anilistId,
        type: node.type === 'anime' || node.type === 'ova' ? 'anime' : node.type === 'series' ? 'series' : 'movie',
        title: node.title,
        titleEnglish: node.titleEnglish || node.title,
        poster: node.poster,
        banner: node.banner || node.poster,
        description: node.synopsis,
        genres: [node.era, 'Story Chronology'],
        rating: 8.5,
        year: node.releaseYear,
        runtime: node.runtimeMinutes || 120,
        totalEpisodes: node.episodes || 1,
      };

      const tempEntry: UserLibraryEntry = {
        id: `temp-node-${node.id}`,
        mediaId: newMedia.id,
        media: newMedia,
        status: 'plan_to_watch',
        currentEpisode: 0,
        userRating: 0,
        isFavorite: false,
        addedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setDetailEntry(tempEntry);
    }
  };

  // Handle updating universe presets (editing items, adding items, deleting, reordering)
  const handleUpdateUniverse = (updatedUniverse: UniversePreset) => {
    setSelectedUniverse(updatedUniverse);
    setUniverses((prev) =>
      prev.map((u) => (u.id === updatedUniverse.id ? updatedUniverse : u))
    );
  };

  // Add custom universe
  const handleCreateUniverse = (newUniverse: UniversePreset) => {
    setUniverses((prev) => [newUniverse, ...prev]);
  };

  // Reset selected universe when navigating away from chronology page
  const handleNavigatePage = (targetPage: PageView) => {
    if (targetPage !== 'chronology') {
      setSelectedUniverse(null);
    }
    setPage(targetPage);
  };

  // Loading Screen
  if (authChecking) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '6px',
            background: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 900, color: 'white', margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(229,9,20,0.6)',
          }}>M</div>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>กำลังตรวจสอบสิทธิ์การใช้งาน MATFLIX...</div>
        </div>
      </div>
    );
  }

  // Mandatory Login Gate if user is NOT logged in
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <AuthModal onClose={() => {}} isMandatory={true} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <Sidebar currentPage={page} onNavigate={handleNavigatePage} stats={library.stats} />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Navbar
          onOpenSearch={() => setSearchOpen(true)}
          onOpenAuth={() => setAuthOpen(true)}
        />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {page === 'home' && (
            <Dashboard
              library={library}
              onOpenDetail={setDetailEntry}
              onOpenSearch={() => setSearchOpen(true)}
            />
          )}

          {page === 'library' && (
            <LibraryPage
              library={library}
              onOpenDetail={setDetailEntry}
              onOpenSearch={() => setSearchOpen(true)}
            />
          )}

          {/* ─── Story Chronology System (2 Pages) ────────────────────────── */}
          {page === 'chronology' && !selectedUniverse && (
            <ChronologyHub
              universes={universes}
              userLibrary={library.state.library}
              onSelectUniverse={(univ) => setSelectedUniverse(univ)}
              onCreateCustomUniverse={() => setCreateUniverseOpen(true)}
            />
          )}

          {page === 'chronology' && selectedUniverse && (
            <ChronologyTimelineView
              universe={selectedUniverse}
              userLibrary={library.state.library}
              onBack={() => setSelectedUniverse(null)}
              onToggleWatched={handleToggleWatchedNode}
              onUpdateEpisode={handleUpdateEpisodeNode}
              onUpdateUniverse={handleUpdateUniverse}
              onOpenDetail={handleOpenNodeDetail}
            />
          )}

          {page === 'stats' && <StatsPage stats={library.stats} watchHistory={library.watchHistory} />}

          {page === 'history' && (
            <HistoryPage
              watchHistory={library.watchHistory}
              libraryEntries={library.state.library}
            />
          )}

          {page === 'settings' && (
            <SettingsPage
              onExportJSON={library.handleExportJSON}
              onExportCSV={library.handleExportCSV}
            />
          )}
        </main>
      </div>

      {/* Quick Search Modal */}
      {searchOpen && (
        <QuickSearchModal
          onClose={() => setSearchOpen(false)}
          libraryEntries={library.state.library}
          onAddEntry={library.addEntry}
        />
      )}

      {/* Manual Auth Modal toggle */}
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} isMandatory={false} />}

      {/* Custom Universe Creator Modal */}
      {createUniverseOpen && (
        <CreateUniverseModal
          onClose={() => setCreateUniverseOpen(false)}
          onCreate={handleCreateUniverse}
        />
      )}

      {/* Media Detail Modal */}
      {detailEntry && (
        <MediaDetailModal
          entry={detailEntry}
          onClose={() => setDetailEntry(null)}
          onUpdate={(updates) => {
            if (detailEntry.id.startsWith('temp-node-')) {
              const newEntry: UserLibraryEntry = {
                ...detailEntry,
                ...updates,
                id: `entry-${Date.now()}`,
                addedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              library.addEntry(newEntry);
            } else {
              library.updateEntry(detailEntry.id, updates);
            }
            setDetailEntry(null);
          }}
          onRemove={() => {
            if (!detailEntry.id.startsWith('temp-node-')) {
              library.removeEntry(detailEntry.id);
            }
            setDetailEntry(null);
          }}
          onAddEpisode={() => {
            if (!detailEntry.id.startsWith('temp-node-')) {
              library.addEpisode(detailEntry.id);
            }
            setDetailEntry(prev => prev ? { ...prev, currentEpisode: (prev.currentEpisode || 0) + 1 } : null);
          }}
          onSubtractEpisode={() => {
            if (!detailEntry.id.startsWith('temp-node-')) {
              library.subtractEpisode(detailEntry.id);
            }
            setDetailEntry(prev => prev ? { ...prev, currentEpisode: Math.max(1, (prev.currentEpisode || 1) - 1) } : null);
          }}
          collections={library.collections}
          onToggleCollection={library.toggleItemInCollection}
        />
      )}
    </div>
  );
}
