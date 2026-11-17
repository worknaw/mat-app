import type { AppState, UserLibraryEntry, WatchHistoryEntry } from '@/lib/types';

export function getDefaultState(): AppState {
  return { library: [], watchHistory: [], collections: [], universeTimelines: [] };
}

export function loadState(): AppState {
  return getDefaultState();
}

export function saveState(): void {
  // LocalStorage disabled in favor of Supabase Database
}

export function addToLibrary(state: AppState, entry: UserLibraryEntry): AppState {
  return { ...state, library: [entry, ...state.library] };
}

export function updateLibraryEntry(state: AppState, entryId: string, updates: Partial<UserLibraryEntry>): AppState {
  return {
    ...state,
    library: state.library.map((e) =>
      e.id === entryId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
    ),
  };
}

export function removeFromLibrary(state: AppState, entryId: string): AppState {
  return { ...state, library: state.library.filter((e) => e.id !== entryId) };
}

export function incrementEpisode(state: AppState, entryId: string): AppState {
  const entry = state.library.find((e) => e.id === entryId);
  if (!entry) return state;

  const newEpisode = (entry.currentEpisode || 0) + 1;
  const historyEntry: WatchHistoryEntry = {
    id: `hist-${Date.now()}`,
    libraryEntryId: entryId,
    mediaId: entry.mediaId,
    mediaTitle: entry.media.title,
    mediaPoster: entry.media.poster,
    mediaType: entry.media.type,
    episode: newEpisode,
    season: entry.currentSeason,
    watchedAt: new Date().toISOString(),
    durationWatched: entry.media.runtime,
  };

  return {
    ...state,
    library: state.library.map((e) =>
      e.id === entryId ? { ...e, currentEpisode: newEpisode, updatedAt: new Date().toISOString() } : e
    ),
    watchHistory: [historyEntry, ...state.watchHistory],
  };
}

export function decrementEpisode(state: AppState, entryId: string): AppState {
  const entry = state.library.find((e) => e.id === entryId);
  if (!entry || !entry.currentEpisode || entry.currentEpisode <= 1) return state;
  return {
    ...state,
    library: state.library.map((e) =>
      e.id === entryId
        ? { ...e, currentEpisode: (e.currentEpisode || 1) - 1, updatedAt: new Date().toISOString() }
        : e
    ),
  };
}

export function exportJSON(state: AppState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mat-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(state: AppState): void {
  const rows = [
    ['Title', 'Type', 'Status', 'Episode', 'Season', 'Rating', 'Added', 'Updated'],
    ...state.library.map((e) => [
      e.media.title, e.media.type, e.status,
      String(e.currentEpisode || ''), String(e.currentSeason || ''),
      String(e.userRating || ''), e.addedAt.split('T')[0], e.updatedAt.split('T')[0],
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mat-library-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(jsonText: string): AppState {
  return JSON.parse(jsonText) as AppState;
}

export function computeStats(state: AppState) {
  const lib = state.library;
  const genreCount: Record<string, number> = {};
  lib.forEach((e) => e.media.genres.forEach((g) => { genreCount[g] = (genreCount[g] || 0) + 1; }));
  const totalGenre = Object.values(genreCount).reduce((a, b) => a + b, 0);
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([genre, count]) => ({ genre, count, percent: totalGenre ? Math.round((count / totalGenre) * 100) : 0 }));

  let totalMinutes = 0;
  state.watchHistory.forEach((h) => { totalMinutes += h.durationWatched || 0; });

  return {
    totalMovies: lib.filter((e) => e.media.type === 'movie').length,
    totalAnime: lib.filter((e) => e.media.type === 'anime').length,
    totalSeries: lib.filter((e) => e.media.type === 'series').length,
    totalEpisodesWatched: state.watchHistory.length,
    totalHoursWatched: Math.round(totalMinutes / 60),
    topGenres,
    watchingCount: lib.filter((e) => e.status === 'watching').length,
    completedCount: lib.filter((e) => e.status === 'completed').length,
    droppedCount: lib.filter((e) => e.status === 'dropped').length,
    planToWatchCount: lib.filter((e) => e.status === 'plan_to_watch').length,
  };
}
