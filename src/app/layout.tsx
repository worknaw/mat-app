import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MAT – Media Tracking Hub',
  description: 'Track your Movies, Anime and TV Series in one place. Fast 3-second add, episode tracking, stats and more.',
  keywords: 'anime tracker, movie tracker, series tracker, watchlist, MAL alternative',
  openGraph: {
    title: 'MAT – Media Tracking Hub',
    description: 'Track everything you watch. Anime, Movies, TV Series.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.className}`}>
      <body className="antialiased" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        {children}
      </body>
    </html>
  );
}
