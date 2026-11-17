import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetail, getSeriesDetail } from '@/lib/tmdb';
import { getAnimeDetail } from '@/lib/anilist';

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type');
  const idParam = req.nextUrl.searchParams.get('id');
  if (!type || !idParam) return NextResponse.json({ error: 'Missing params' }, { status: 400 });

  const id = parseInt(idParam);
  try {
    let media = null;
    if (type === 'movie') media = await getMovieDetail(id);
    else if (type === 'series') media = await getSeriesDetail(id);
    else if (type === 'anime') media = await getAnimeDetail(id);

    if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ media });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
