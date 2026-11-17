import { getMovieDetail, getSeriesDetail, searchMovies, searchSeries } from '@/lib/tmdb';
import { getAnimeDetail } from '@/lib/anilist';
import type { TimelineNodeItem, UniversePreset } from '@/lib/chronologyPresets';
import type { UserLibraryEntry } from '@/lib/types';

const apiCache = new Map<string, Partial<TimelineNodeItem>>();

/**
 * Finds a matching entry in user library by tmdbId, anilistId, mediaId, or title similarity (Thai & English)
 */
export function findMatchingLibraryEntry(
  library: UserLibraryEntry[],
  node: TimelineNodeItem
): UserLibraryEntry | undefined {
  if (!library || !library.length) return undefined;

  return library.find((entry) => {
    const media = entry.media;
    if (!media) return false;

    // 1. Direct Node / Media ID match (HIGHEST PRIORITY)
    if (
      entry.mediaId === node.id ||
      media.id === node.id ||
      entry.mediaId === `node-${node.id}` ||
      media.id === `node-${node.id}` ||
      entry.mediaId === `media-node-${node.id}`
    ) {
      return true;
    }

    // 2. Exact Title Match
    const normMediaTitle = media.title ? media.title.toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '') : '';
    const normMediaEng = media.titleEnglish ? media.titleEnglish.toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '') : '';
    const normNodeTitle = node.title ? node.title.toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '') : '';
    const normNodeEng = node.titleEnglish ? node.titleEnglish.toLowerCase().replace(/[^a-z0-9\u0e00-\u0e7f]/g, '') : '';

    if (normNodeTitle && normMediaTitle && normNodeTitle === normMediaTitle) return true;
    if (normNodeEng && normMediaEng && normNodeEng === normMediaEng) return true;

    // 3. Direct TMDB ID match (ONLY if seasons/titles do not conflict)
    if (node.tmdbId && media.tmdbId && Number(node.tmdbId) === Number(media.tmdbId)) {
      const nodeSeason = (node.title || '').match(/\s+(S\d+|Season\s+\d+|Vol\.\s*\d+)$/i)?.[1]?.toLowerCase();
      const mediaSeason = (media.title || '').match(/\s+(S\d+|Season\s+\d+|Vol\.\s*\d+)$/i)?.[1]?.toLowerCase();

      if (nodeSeason || mediaSeason) {
        return nodeSeason === mediaSeason;
      }
      return true;
    }

    // 4. Direct AniList ID match
    if (node.anilistId && media.anilistId && Number(node.anilistId) === Number(media.anilistId)) {
      return true;
    }

    return false;
  });
}

/**
 * Hydrates timeline node items with real live poster ONLY directly from TMDB & AniList APIs
 * STRICTLY PRESERVES preset synopsis, title, era, storyYear and releaseYear!
 */
export async function hydrateTimelineItem(node: TimelineNodeItem): Promise<TimelineNodeItem> {
  const mediaType = node.tmdbMediaType || (node.type === 'series' ? 'tv' : 'movie');
  const cacheKey = node.tmdbId ? `tmdb-${mediaType}-${node.tmdbId}` : node.anilistId ? `al-${node.anilistId}` : `search-${node.title}`;

  if (cacheKey && apiCache.has(cacheKey)) {
    const cached = apiCache.get(cacheKey)!;
    return {
      ...node,
      ...cached,
      storyYear: node.storyYear,
      era: node.era,
      chronologicalOrder: node.chronologicalOrder,
    };
  }

  const applyMetadataFromDetail = (detail: {
    title?: string;
    titleEnglish?: string;
    titleNative?: string;
    description?: string;
    poster?: string;
    banner?: string;
    year?: number;
    runtime?: number;
    totalEpisodes?: number;
    totalSeasons?: number;
  } | null | undefined): Partial<TimelineNodeItem> | null => {
    if (!detail) return null;

    let title = detail.title || node.title;
    let titleEnglish = detail.titleEnglish || detail.title || node.titleEnglish || node.title;

    // Preserve season/volume suffix (e.g. S1, S2, Season 1) if preset node specifies it
    const seasonMatch = node.title.match(/\s+(S\d+|Season\s+\d+|Vol\.\s*\d+)$/i);
    if (seasonMatch && !title.toLowerCase().includes(seasonMatch[1].toLowerCase())) {
      title = `${title} ${seasonMatch[1]}`;
    }
    const seasonEngMatch = (node.titleEnglish || node.title).match(/\s+(S\d+|Season\s+\d+|Vol\.\s*\d+)$/i);
    if (seasonEngMatch && !titleEnglish.toLowerCase().includes(seasonEngMatch[1].toLowerCase())) {
      titleEnglish = `${titleEnglish} ${seasonEngMatch[1]}`;
    }
    const synopsis = detail.description || node.synopsis;
    const poster = detail.poster && !detail.poster.includes('unsplash') ? detail.poster : node.poster;
    const banner = detail.banner && !detail.banner.includes('unsplash') ? detail.banner : node.banner;
    const runtimeMinutes = typeof detail.runtime === 'number' ? detail.runtime : node.runtimeMinutes;
    const episodes = typeof detail.totalEpisodes === 'number' ? detail.totalEpisodes : node.episodes;
    const releaseYear = detail.year ? detail.year : node.releaseYear;

    return {
      title,
      titleEnglish,
      synopsis,
      poster,
      banner,
      releaseYear,
      runtimeMinutes,
      episodes,
    };
  };

  try {
    // Strategy 1: Use direct TMDB/AniList detail by ID when available
    if (node.tmdbId) {
      const isMovie = mediaType === 'movie';
      const detail = isMovie
        ? await getMovieDetail(node.tmdbId)
        : await getSeriesDetail(node.tmdbId);

      const update = applyMetadataFromDetail(detail);
      if (update) {
        apiCache.set(cacheKey, update);
        return {
          ...node,
          ...update,
          storyYear: node.storyYear,
          era: node.era,
          chronologicalOrder: node.chronologicalOrder,
        };
      }
    }

    // Strategy 2: If the direct detail is unavailable, search and then hydrate from the best match
    const isMovieType = node.type === 'movie' || node.type === 'special';
    const searchQuery = node.titleEnglish || node.title;

    if (isMovieType) {
      const searchResults = await searchMovies(searchQuery, 1);
      const top = searchResults[0];
      if (top?.tmdbId) {
        const detail = await getMovieDetail(top.tmdbId);
        const update = applyMetadataFromDetail(detail);
        if (update) {
          const hydratedUpdate: Partial<TimelineNodeItem> = {
            ...update,
            tmdbId: top.tmdbId || node.tmdbId,
          };
          apiCache.set(cacheKey, hydratedUpdate);
          return {
            ...node,
            ...hydratedUpdate,
            storyYear: node.storyYear,
            era: node.era,
            chronologicalOrder: node.chronologicalOrder,
          };
        }
      }
    } else {
      const searchResults = await searchSeries(searchQuery, 1);
      const top = searchResults[0];
      if (top?.tmdbId) {
        const detail = await getSeriesDetail(top.tmdbId);
        const update = applyMetadataFromDetail(detail);
        if (update) {
          const hydratedUpdate: Partial<TimelineNodeItem> = {
            ...update,
            tmdbId: top.tmdbId || node.tmdbId,
          };
          apiCache.set(cacheKey, hydratedUpdate);
          return {
            ...node,
            ...hydratedUpdate,
            storyYear: node.storyYear,
            era: node.era,
            chronologicalOrder: node.chronologicalOrder,
          };
        }
      }
    }

    // Strategy 3: AniList API for anime entries
    if (node.anilistId) {
      const detail = await getAnimeDetail(node.anilistId);
      const update = applyMetadataFromDetail(detail);
      if (update) {
        apiCache.set(cacheKey, update);
        return {
          ...node,
          ...update,
          storyYear: node.storyYear,
          era: node.era,
          chronologicalOrder: node.chronologicalOrder,
        };
      }
    }
  } catch (e) {
    console.warn(`API hydration skipped for ${node.title}:`, e);
  }

  return node;
}

/**
 * Batch hydrates all items in a universe preset without altering list order or titles
 */
export async function hydrateUniverse(universe: UniversePreset): Promise<UniversePreset> {
  const hydratedItems = await Promise.all(
    universe.items.map((item) => hydrateTimelineItem(item))
  );

  return {
    ...universe,
    items: hydratedItems,
  };
}
