import type { MediaItem, SearchResult } from '@/lib/types';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

function key() {
  return process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
}

function poster(path?: string | null, size = 'w500') {
  return path ? `${IMG}/${size}${path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80';
}

function backdrop(path?: string | null) {
  return path ? `${IMG}/original${path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80';
}

async function tmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = key();
  const sp = new URLSearchParams({ api_key: apiKey, language: 'en-US', ...params });
  const res = await fetch(`${TMDB_BASE}${endpoint}?${sp}`);
  if (!res.ok) throw new Error(`TMDB error ${res.status}`);
  return res.json();
}

export async function searchMovies(query: string, limit = 5): Promise<SearchResult[]> {
  try {
    const data = await tmdb<{ results: { id: number; title: string; poster_path?: string; vote_average: number; release_date?: string }[] }>('/search/movie', { query });
    if (!data.results) return [];
    return data.results.slice(0, limit).map((m) => ({
      id: `tmdb-movie-${m.id}`,
      tmdbId: m.id,
      type: 'movie' as const,
      title: m.title,
      poster: poster(m.poster_path),
      year: m.release_date ? parseInt(m.release_date) : 0,
      rating: m.vote_average || undefined,
    }));
  } catch (e) {
    console.error('TMDB searchMovies error:', e);
    return [];
  }
}

export async function searchSeries(query: string, limit = 5): Promise<SearchResult[]> {
  try {
    const data = await tmdb<{ results: { id: number; name: string; poster_path?: string; vote_average: number; first_air_date?: string }[] }>('/search/tv', { query });
    if (!data.results) return [];
    return data.results.slice(0, limit).map((s) => ({
      id: `tmdb-tv-${s.id}`,
      tmdbId: s.id,
      type: 'series' as const,
      title: s.name,
      poster: poster(s.poster_path),
      year: s.first_air_date ? parseInt(s.first_air_date) : 0,
      rating: s.vote_average || undefined,
    }));
  } catch (e) {
    console.error('TMDB searchSeries error:', e);
    return [];
  }
}

export async function getTrendingMovies(limit = 4) {
  try {
    const data = await tmdb<{ results: { id: number; title: string; overview: string; poster_path?: string; vote_average: number; release_date?: string }[] }>('/trending/movie/week');
    if (!data.results) return [];
    return data.results.slice(0, limit).map((m) => ({
      id: `trending-tmdb-${m.id}`,
      mediaId: m.id,
      title: m.title,
      type: 'ภาพยนตร์',
      rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : 8.0,
      poster: poster(m.poster_path),
      genres: ['ภาพยนตร์ฮิต'],
      reason: 'ภาพยนตร์ฮิตติดเทรนด์โลก',
    }));
  } catch (e) {
    console.error('TMDB trending movies error:', e);
    return [];
  }
}

export async function getUpcomingMovies(limit = 3) {
  try {
    const data = await tmdb<{ results: { id: number; title: string; poster_path?: string; release_date?: string }[] }>('/movie/upcoming');
    if (!data.results) return [];
    return data.results.slice(0, limit).map((m) => {
      const releaseDate = m.release_date ? new Date(m.release_date) : new Date();
      const dateLabel = releaseDate.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' });
      return {
        id: `airing-tmdb-${m.id}`,
        mediaId: m.id,
        title: m.title,
        episode: 1,
        airDate: `ฉาย ${dateLabel}`,
        dayGroup: 'เร็วๆ นี้',
        poster: poster(m.poster_path),
      };
    });
  } catch (e) {
    console.error('TMDB upcoming movies error:', e);
    return [];
  }
}

export async function getMovieDetail(tmdbId: number): Promise<MediaItem | null> {
  try {
    const m = await tmdb<{
      id: number; title: string; original_title?: string; overview: string; poster_path?: string; backdrop_path?: string;
      genres?: { name: string }[]; vote_average: number; release_date?: string; runtime?: number;
      production_companies?: { name: string }[];
    }>(`/movie/${tmdbId}`);
    return {
      id: `tmdb-movie-${m.id}`,
      tmdbId: m.id,
      type: 'movie',
      title: m.title,
      titleEnglish: m.original_title || m.title,
      titleNative: m.original_title || m.title,
      poster: poster(m.poster_path),
      banner: backdrop(m.backdrop_path),
      description: m.overview || '',
      genres: m.genres?.map((g) => g.name) || [],
      rating: m.vote_average || 0,
      year: m.release_date ? parseInt(m.release_date) : 0,
      studio: m.production_companies?.[0]?.name,
      runtime: m.runtime,
      status: 'completed',
    };
  } catch {
    // Quietly fallback for unreleased/missing TMDB entries
    return null;
  }
}

export async function getSeriesDetail(tmdbId: number): Promise<MediaItem | null> {
  try {
    const s = await tmdb<{
      id: number; name: string; original_name?: string; overview: string; poster_path?: string; backdrop_path?: string;
      genres?: { name: string }[]; vote_average: number; first_air_date?: string;
      number_of_seasons?: number; number_of_episodes?: number; episode_run_time?: number[];
      networks?: { name: string }[];
    }>(`/tv/${tmdbId}`);
    return {
      id: `tmdb-tv-${s.id}`,
      tmdbId: s.id,
      type: 'series',
      title: s.name,
      titleEnglish: s.original_name || s.name,
      titleNative: s.original_name || s.name,
      poster: poster(s.poster_path),
      banner: backdrop(s.backdrop_path),
      description: s.overview || '',
      genres: s.genres?.map((g) => g.name) || [],
      rating: s.vote_average || 0,
      year: s.first_air_date ? parseInt(s.first_air_date) : 0,
      studio: s.networks?.[0]?.name,
      runtime: s.episode_run_time?.[0],
      totalEpisodes: s.number_of_episodes,
      totalSeasons: s.number_of_seasons,
      status: 'ongoing',
    };
  } catch {
    // Quietly fallback for unreleased/missing TMDB entries
    return null;
  }
}
