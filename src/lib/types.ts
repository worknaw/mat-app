// ─── Core Media Types ───────────────────────────────────────────────────────

export type MediaType = 'movie' | 'series' | 'anime';

export type WatchStatus =
  | 'watching'
  | 'completed'
  | 'dropped'
  | 'plan_to_watch';

export type Platform =
  | 'Netflix'
  | 'Disney+'
  | 'Prime'
  | 'Crunchyroll'
  | 'Bilibili'
  | 'HBO'
  | 'AppleTV'
  | 'Hulu'
  | 'Other';

export interface MediaItem {
  id: string;
  tmdbId?: number;
  anilistId?: number;
  type: MediaType;
  title: string;
  titleEnglish?: string;
  titleNative?: string;
  poster: string;
  banner?: string;
  description: string;
  genres: string[];
  cast?: string[];
  rating: number;
  year: number;
  studio?: string;
  runtime?: number;
  totalEpisodes?: number;
  totalSeasons?: number;
  status?: 'ongoing' | 'completed' | 'upcoming';
  nextEpisodeAirDate?: string;
  nextEpisodeNumber?: number;
}

// ─── User Library Entry ─────────────────────────────────────────────────────

export interface UserLibraryEntry {
  id: string;
  mediaId: string;
  media: MediaItem;
  status: WatchStatus;
  userRating?: number;
  notes?: string;
  tags?: string[];
  platforms?: Platform[];
  isFavorite: boolean;
  currentEpisode?: number;
  currentSeason?: number;
  progressPercent?: number;
  currentArc?: string;
  addedAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

// ─── Watch History ──────────────────────────────────────────────────────────

export interface WatchHistoryEntry {
  id: string;
  libraryEntryId: string;
  mediaId: string;
  mediaTitle: string;
  mediaPoster: string;
  mediaType: MediaType;
  episode?: number;
  season?: number;
  watchedAt: string;
  durationWatched?: number;
}

// ─── Collection ─────────────────────────────────────────────────────────────

export interface Collection {
  id: string;
  name: string;
  description?: string;
  emoji?: string;
  coverImage?: string;
  mediaIds?: string[];
  itemIds?: string[];
  items?: (MediaItem | Record<string, unknown>)[];
  createdAt: string;
  updatedAt: string;
}

// ─── Statistics ─────────────────────────────────────────────────────────────

export interface UserStats {
  totalMovies: number;
  totalAnime: number;
  totalSeries: number;
  totalEpisodesWatched: number;
  totalHoursWatched: number;
  topGenres: { genre: string; count: number; percent: number }[];
  watchingCount: number;
  completedCount: number;
  droppedCount: number;
  planToWatchCount: number;
}

// ─── Search ──────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  tmdbId?: number;
  anilistId?: number;
  type: MediaType;
  title: string;
  poster: string;
  year: number;
  rating?: number;
  isInLibrary?: boolean;
  libraryEntryId?: string;
}

// ─── AniList API Types ──────────────────────────────────────────────────────

export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english?: string;
    native?: string;
  };
  description?: string;
  coverImage: {
    large: string;
    extraLarge: string;
  };
  bannerImage?: string;
  genres: string[];
  averageScore?: number;
  startDate?: { year?: number; month?: number; day?: number };
  episodes?: number;
  duration?: number;
  status?: string;
  studios?: { nodes: { name: string }[] };
  characters?: { nodes: { name: { full: string } }[] };
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
  };
}

// ─── TMDB API Types ─────────────────────────────────────────────────────────

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  vote_average: number;
  release_date?: string;
  runtime?: number;
  production_companies?: { name: string }[];
}

export interface TMDBTVShow {
  id: number;
  name: string;
  overview: string;
  poster_path?: string;
  backdrop_path?: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  vote_average: number;
  first_air_date?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  episode_run_time?: number[];
  networks?: { name: string }[];
}

// ─── App State ──────────────────────────────────────────────────────────────

export interface AppState {
  library: UserLibraryEntry[];
  watchHistory: WatchHistoryEntry[];
  collections: Collection[];
  universeTimelines: Collection[];
}

export type ViewMode = 'grid' | 'list';

export type SortOption =
  | 'recently_updated'
  | 'recently_added'
  | 'a_z'
  | 'rating'
  | 'release_date';

export interface FilterState {
  status: WatchStatus | 'all';
  type: MediaType | 'all';
  sort: SortOption;
  platform?: Platform;
  search: string;
}
