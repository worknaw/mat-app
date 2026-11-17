import { NextResponse } from 'next/server';
import { getTrendingAnime } from '@/lib/anilist';
import { getTrendingMovies } from '@/lib/tmdb';

export async function GET() {
  try {
    const [anime, movies] = await Promise.allSettled([
      getTrendingAnime(3),
      getTrendingMovies(3),
    ]);

    const animeItems = anime.status === 'fulfilled' ? anime.value : [];
    const movieItems = movies.status === 'fulfilled' ? movies.value : [];

    // Interleave movie and anime items for a rich mix
    const combined = [];
    const maxLen = Math.max(animeItems.length, movieItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (movieItems[i]) combined.push(movieItems[i]);
      if (animeItems[i]) combined.push(animeItems[i]);
    }

    return NextResponse.json({ recommendations: combined });
  } catch {
    return NextResponse.json({ recommendations: [] }, { status: 500 });
  }
}
