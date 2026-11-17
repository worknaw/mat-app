import { NextResponse } from 'next/server';
import { getUpcomingAiringSchedules } from '@/lib/anilist';
import { getUpcomingMovies } from '@/lib/tmdb';

export async function GET() {
  try {
    const [animeSchedules, movieUpcoming] = await Promise.allSettled([
      getUpcomingAiringSchedules(4),
      getUpcomingMovies(3),
    ]);

    const animeItems = animeSchedules.status === 'fulfilled' ? animeSchedules.value : [];
    const movieItems = movieUpcoming.status === 'fulfilled' ? movieUpcoming.value : [];

    // Interleave upcoming movies and anime
    const combined = [];
    const maxLen = Math.max(animeItems.length, movieItems.length);
    for (let i = 0; i < maxLen; i++) {
      if (animeItems[i]) combined.push(animeItems[i]);
      if (movieItems[i]) combined.push(movieItems[i]);
    }

    return NextResponse.json({ schedules: combined });
  } catch {
    return NextResponse.json({ schedules: [] }, { status: 500 });
  }
}
