import type { AniListMedia, MediaItem, SearchResult } from '@/lib/types';

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
  query SearchAnime($search: String!, $perPage: Int) {
    Page(perPage: $perPage) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage
        genres
        averageScore
        startDate { year }
        episodes
        duration
        status
        studios(isMain: true) { nodes { name } }
        nextAiringEpisode { episode airingAt }
      }
    }
  }
`;

const DETAIL_QUERY = `
  query GetAnime($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      description(asHtml: false)
      coverImage { large extraLarge }
      bannerImage
      genres
      averageScore
      startDate { year }
      episodes
      duration
      status
      studios(isMain: true) { nodes { name } }
      nextAiringEpisode { episode airingAt }
    }
  }
`;

const AIRING_QUERY = `
  query GetAiringSchedules($airingAt_greater: Int, $perPage: Int) {
    Page(perPage: $perPage) {
      airingSchedules(airingAt_greater: $airingAt_greater, sort: TIME) {
        id
        airingAt
        episode
        media {
          id
          title { romaji english native }
          coverImage { large extraLarge }
        }
      }
    }
  }
`;

const TRENDING_QUERY = `
  query GetTrendingAnime($perPage: Int) {
    Page(perPage: $perPage) {
      media(sort: TRENDING_DESC, type: ANIME) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        genres
        averageScore
        startDate { year }
      }
    }
  }
`;

export interface AiringScheduleItem {
  id: string;
  title: string;
  episode: number;
  airDate: string;
  dayGroup: string;
  poster: string;
  mediaId: number;
}

export interface TrendingItem {
  id: string;
  mediaId: number;
  title: string;
  type: string;
  rating: number;
  poster: string;
  genres: string[];
  reason: string;
}

async function gql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

function toItem(m: AniListMedia): MediaItem {
  return {
    id: `al-${m.id}`,
    anilistId: m.id,
    type: 'anime',
    title: m.title.english || m.title.romaji,
    titleEnglish: m.title.english,
    titleNative: m.title.native,
    poster: m.coverImage?.extraLarge || m.coverImage?.large || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
    banner: m.bannerImage || undefined,
    description: m.description?.replace(/<[^>]+>/g, '') || '',
    genres: m.genres || [],
    rating: m.averageScore ? m.averageScore / 10 : 0,
    year: m.startDate?.year || 0,
    studio: m.studios?.nodes?.[0]?.name,
    runtime: m.duration,
    totalEpisodes: m.episodes || undefined,
    status: m.status === 'FINISHED' ? 'completed' : m.status === 'NOT_YET_RELEASED' ? 'upcoming' : 'ongoing',
    nextEpisodeNumber: m.nextAiringEpisode?.episode,
    nextEpisodeAirDate: m.nextAiringEpisode
      ? new Date(m.nextAiringEpisode.airingAt * 1000).toISOString()
      : undefined,
  };
}

function toResult(m: AniListMedia): SearchResult {
  return {
    id: `al-${m.id}`,
    anilistId: m.id,
    type: 'anime',
    title: m.title.english || m.title.romaji,
    poster: m.coverImage?.extraLarge || m.coverImage?.large || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
    year: m.startDate?.year || 0,
    rating: m.averageScore ? m.averageScore / 10 : undefined,
  };
}

export async function searchAnime(query: string, limit = 8): Promise<SearchResult[]> {
  try {
    const data = await gql<{ Page: { media: AniListMedia[] } }>(SEARCH_QUERY, { search: query, perPage: limit });
    return data.Page.media.map(toResult);
  } catch (e) {
    console.error('AniList search:', e);
    return [];
  }
}

export async function getAnimeDetail(anilistId: number): Promise<MediaItem | null> {
  try {
    const data = await gql<{ Media: AniListMedia }>(DETAIL_QUERY, { id: anilistId });
    return toItem(data.Media);
  } catch (e) {
    console.error('AniList detail:', e);
    return null;
  }
}

export async function getUpcomingAiringSchedules(limit = 6): Promise<AiringScheduleItem[]> {
  try {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const data = await gql<{
      Page: {
        airingSchedules: {
          id: number;
          airingAt: number;
          episode: number;
          media: {
            id: number;
            title: { romaji?: string; english?: string; native?: string };
            coverImage?: { large?: string; extraLarge?: string };
          };
        }[];
      };
    }>(AIRING_QUERY, { airingAt_greater: nowInSeconds, perPage: limit });

    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).getTime();

    return (data.Page.airingSchedules || []).map((s) => {
      const airDateObj = new Date(s.airingAt * 1000);
      const isToday = airDateObj.getTime() <= todayEnd;
      const isTomorrow = !isToday && airDateObj.getTime() <= todayEnd + 86400000;

      let dayGroup = 'เร็วๆ นี้';
      if (isToday) dayGroup = 'วันนี้';
      else if (isTomorrow) dayGroup = 'พรุ่งนี้';

      const timeStr = airDateObj.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
      const airDateLabel = isToday ? `วันนี้ ${timeStr}` : isTomorrow ? `พรุ่งนี้ ${timeStr}` : `${airDateObj.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })} ${timeStr}`;

      return {
        id: `airing-${s.id}`,
        mediaId: s.media.id,
        title: s.media.title.english || s.media.title.romaji || s.media.title.native || 'Unknown Title',
        episode: s.episode,
        airDate: airDateLabel,
        dayGroup,
        poster: s.media.coverImage?.extraLarge || s.media.coverImage?.large || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
      };
    });
  } catch (e) {
    console.error('AniList airing schedule error:', e);
    return [];
  }
}

export async function getTrendingAnime(limit = 6): Promise<TrendingItem[]> {
  try {
    const data = await gql<{ Page: { media: AniListMedia[] } }>(TRENDING_QUERY, { perPage: limit });
    return (data.Page.media || []).map((m) => ({
      id: `trending-al-${m.id}`,
      mediaId: m.id,
      title: m.title.english || m.title.romaji,
      type: 'อนิเมะ',
      rating: m.averageScore ? Math.round((m.averageScore / 10) * 10) / 10 : 8.5,
      poster: m.coverImage?.extraLarge || m.coverImage?.large || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80',
      genres: m.genres || [],
      reason: `อนิเมะฮิตติดเทรนด์ (${(m.genres || []).slice(0, 2).join(', ')})`,
    }));
  } catch (e) {
    console.error('AniList trending error:', e);
    return [];
  }
}
