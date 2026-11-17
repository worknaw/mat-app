import { NextRequest, NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anilist';
import { searchMovies, searchSeries } from '@/lib/tmdb';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  try {
    // Run all 3 searches in parallel
    const [anime, movies, series] = await Promise.allSettled([
      searchAnime(q, 5),
      searchMovies(q, 4),
      searchSeries(q, 4),
    ]);

    const animeResults = anime.status === 'fulfilled' ? anime.value : [];
    const movieResults = movies.status === 'fulfilled' ? movies.value : [];
    const seriesResults = series.status === 'fulfilled' ? series.value : [];

    // Interleave results for better UX
    const results = [...animeResults, ...movieResults, ...seriesResults];

    return NextResponse.json({ results });
  } catch (e) {
    console.error('Search error:', e);
    return NextResponse.json({ results: [] });
  }
}
