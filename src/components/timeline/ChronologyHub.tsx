'use client';

import { useState } from 'react';
import { Search, Plus, Play, Clock, Film, Sparkles, ChevronRight, Layers } from 'lucide-react';
import type { UniversePreset, UniverseCategory } from '@/lib/chronologyPresets';
import type { UserLibraryEntry } from '@/lib/types';

interface ChronologyHubProps {
  universes: UniversePreset[];
  userLibrary: UserLibraryEntry[];
  onSelectUniverse: (universe: UniversePreset) => void;
  onCreateCustomUniverse: () => void;
}

export default function ChronologyHub({
  universes,
  userLibrary,
  onSelectUniverse,
  onCreateCustomUniverse,
}: ChronologyHubProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<UniverseCategory | 'all'>('all');
  const [sortBy] = useState<'popular' | 'name' | 'items'>('popular');

  // Calculate user progress for a given universe
  const getUniverseProgress = (universe: UniversePreset) => {
    if (!universe.items.length) return { watched: 0, total: 0, percent: 0 };

    let watchedCount = 0;
    universe.items.forEach((item) => {
      const isMatched = userLibrary.some(
        (entry) =>
          entry.status === 'completed' &&
          (entry.media.title.toLowerCase().includes(item.title.toLowerCase()) ||
            (item.titleEnglish && entry.media.titleEnglish?.toLowerCase().includes(item.titleEnglish.toLowerCase())))
      );
      if (isMatched) watchedCount++;
    });

    const percent = Math.round((watchedCount / universe.items.length) * 100);
    return { watched: watchedCount, total: universe.items.length, percent };
  };

  // Calculate total watch duration estimate in hours
  const getUniverseDurationHours = (universe: UniversePreset) => {
    let totalMinutes = 0;
    universe.items.forEach((item) => {
      if (item.runtimeMinutes) {
        totalMinutes += item.runtimeMinutes * (item.episodes || 1);
      } else if (item.episodes) {
        totalMinutes += item.episodes * 24; // Default 24m per anime episode
      } else {
        totalMinutes += 120; // Default movie 2h
      }
    });
    return Math.round(totalMinutes / 60);
  };

  // Filter & sort universes
  const filteredUniverses = universes
    .filter((u) => {
      const matchesSearch =
        u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.titleEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === 'all' || u.category === selectedCategory;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title, 'th');
      if (sortBy === 'items') return b.items.length - a.items.length;
      return 0; // default preset order
    });

  const spotlightUniverse = universes[0] || null;
  const spotlightProgress = spotlightUniverse ? getUniverseProgress(spotlightUniverse) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '60px' }}>
      {/* ─── Hero Spotlight Banner (Netflix Style) ────────────────────────── */}
      {spotlightUniverse && (
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            minHeight: '380px',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '40px 36px',
            background: `linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0.6) 50%, rgba(20,20,20,0.2) 100%), url(${spotlightUniverse.coverImage}) center/cover no-repeat`,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 2 }}>
            {/* Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '12px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 12px rgba(229,9,20,0.5)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={14} />
                {spotlightUniverse.featuredBadge || 'SPOTLIGHT UNIVERSE'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {spotlightUniverse.items.length} ผลงาน • ~{getUniverseDurationHours(spotlightUniverse)} ชั่วโมง
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.15 }}>
                {spotlightUniverse.title}
              </h1>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                {spotlightUniverse.titleEnglish}
              </div>
            </div>

            {/* Synopsis */}
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {spotlightUniverse.description}
            </p>

            {/* Progress Bar preview */}
            {spotlightProgress && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                <div style={{ flex: 1, maxWidth: '240px', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${spotlightProgress.percent}%`, height: '100%', background: 'var(--accent-green)', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 700 }}>
                  ดูไปแล้ว {spotlightProgress.watched}/{spotlightProgress.total} เรื่อง ({spotlightProgress.percent}%)
                </span>
              </div>
            )}

            {/* CTA Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
              <button
                id="spotlight-view-timeline"
                aria-label="ดูไทม์ไลน์ตามเนื้อเรื่อง"
                onClick={() => onSelectUniverse(spotlightUniverse)}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 800,
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 6px 20px rgba(229,9,20,0.5)',
                  transition: 'transform 0.15s ease, background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Play size={18} fill="white" />
                ดูไทม์ไลน์ตามเนื้อเรื่อง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Search & Controls Bar ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: 'var(--bg-secondary)',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'จักรวาลทั้งหมด' },
            { id: 'live_action', label: 'ภาพยนตร์ / ซีรีส์' },
            { id: 'anime', label: 'อนิเมะ (Anime)' },
          ].map((tab) => {
            const active = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                aria-label={tab.label}
                onClick={() => setSelectedCategory(tab.id as UniverseCategory | 'all')}
                style={{
                  background: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
                  color: active ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', maxWidth: '480px', justifyContent: 'flex-end' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="universe-search-input"
              aria-label="ค้นหาจักรวาลหนัง & อนิเมะ..."
              type="text"
              placeholder="ค้นหาจักรวาลหนัง & อนิเมะ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 12px 8px 36px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Create Universe Button */}
          <button
            id="create-custom-universe-btn"
            aria-label="สร้างจักรวาลใหม่"
            onClick={onCreateCustomUniverse}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid var(--border-bright)',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          >
            <Plus size={16} />
            สร้างจักรวาลใหม่
          </button>
        </div>
      </div>

      {/* ─── Main Content Grid (Netflix Card Shelf) ───────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--accent-primary)" />
              จักรวาลสื่อทั้งหมด ({filteredUniverses.length})
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              เลือกจักรวาลที่คุณสนใจเพื่อรับชมไทม์ไลน์ลำดับเนื้อเรื่องแบบเจาะลึก
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {filteredUniverses.map((universe) => {
            const progress = getUniverseProgress(universe);
            const totalHours = getUniverseDurationHours(universe);

            return (
              <div
                key={universe.id}
                id={`universe-card-${universe.id}`}
                onClick={() => onSelectUniverse(universe)}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Banner Header Image */}
                <div style={{ height: '160px', position: 'relative', overflow: 'hidden', background: '#222' }}>
                  <img
                    src={universe.coverImage}
                    alt={universe.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 80%)',
                    }}
                  />
                  {/* Category Badge */}
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: universe.category === 'anime' ? 'rgba(147, 51, 234, 0.85)' : 'rgba(229, 9, 20, 0.85)',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {universe.category === 'anime' ? 'ANIME UNIVERSE' : 'CINEMATIC UNIVERSE'}
                  </span>
                </div>

                {/* Card Content Body */}
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                      {universe.title}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {universe.titleEnglish}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {universe.description}
                  </p>

                  {/* Metadata Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)', marginTop: 'auto', paddingTop: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Film size={14} color="var(--accent-primary)" />
                      {universe.items.length} ผลงาน
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} color="var(--accent-yellow)" />
                      ~{totalHours} ชม.
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-muted)' }}>ความคืบหน้าการรับชม</span>
                      <span style={{ color: progress.percent > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                        {progress.watched}/{progress.total} เรื่อง ({progress.percent}%)
                      </span>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress.percent}%`, height: '100%', background: 'var(--accent-green)', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div
                  style={{
                    padding: '12px 20px',
                    background: 'rgba(0,0,0,0.2)',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                  }}
                >
                  <span>ดูไทม์ไลน์ตามเนื้อเรื่อง</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
