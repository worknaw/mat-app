'use client';

import { Play, Plus, Info } from 'lucide-react';
import type { UserLibraryEntry } from '@/lib/types';

interface NetflixHeroProps {
  entry: UserLibraryEntry | null;
  onOpenDetail: (entry: UserLibraryEntry) => void;
  onAddEpisode: (id: string) => void;
  onOpenSearch: () => void;
}

export default function NetflixHero({ entry, onOpenDetail, onAddEpisode, onOpenSearch }: NetflixHeroProps) {
  if (!entry) {
    return (
      <div
        style={{
          position: 'relative',
          height: '420px',
          borderRadius: '12px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1f1f1f 0%, #141414 100%)',
          display: 'flex',
          alignItems: 'center',
          padding: '48px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ maxWidth: '600px', zIndex: 2 }}>
          <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '2px', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
            ยินดีต้อนรับสู่ MATFLIX
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: 900, color: 'var(--text-primary)', margin: '12px 0 16px', lineHeight: 1.2 }}>
            ศูนย์รวมติดตามภาพยนตร์ อนิเมะ และซีรีส์ของคุณ
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6, marginBottom: '24px' }}>
            เริ่มต้นสร้างคลังสื่อส่วนตัว บันทึกความคืบหน้าการดู และติดตามตอนใหม่ได้ทันทีด้วยปุ่มลัดและอินเทอร์เฟซระดับภาพยนตร์
          </p>
          <button
            onClick={onOpenSearch}
            aria-label="เพิ่มรายการแรกของคุณ"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'var(--accent-primary)', color: 'white', border: 'none',
              borderRadius: '6px', padding: '14px 28px', fontSize: '16px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(229, 9, 20, 0.4)',
              transition: 'transform 0.2s ease',
            }}
          >
            <Plus size={20} /> เพิ่มรายการแรกของคุณ
          </button>
        </div>
      </div>
    );
  }

  const { media } = entry;
  const progressPercent = entry.currentEpisode && media.totalEpisodes
    ? Math.round((entry.currentEpisode / media.totalEpisodes) * 100)
    : 0;

  return (
    <div
      style={{
        position: 'relative',
        height: '480px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: `url(${media.poster}) center/cover no-repeat`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
      }}
    >
      {/* Dark Gradient Backdrop Layers */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, #141414 45%, rgba(20,20,20,0.7) 75%, transparent 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, #141414 0%, transparent 60%)',
        }}
      />

      {/* Hero Content Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '48px',
          left: '48px',
          maxWidth: '620px',
          zIndex: 10,
        }}
      >
        {/* Netflix Brand Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '-1px' }}>
            M
          </span>
          <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            กำลังรับชมอยู่
          </span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize: '42px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.15, marginBottom: '14px' }}>
          {media.title}
        </h1>

        {/* Metadata Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: 800 }}>แมตช์ 98%</span>
          {media.year && <span>{media.year}</span>}
          <span style={{ padding: '2px 6px', border: '1px solid var(--text-muted)', borderRadius: '3px', fontSize: '11px', fontWeight: 700 }}>
            HD
          </span>
          {entry.currentSeason && entry.currentEpisode && (
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              ซีซั่น {entry.currentSeason} ตอนที่ {entry.currentEpisode}
            </span>
          )}
          {media.totalEpisodes && (
            <span>(รวม {media.totalEpisodes} ตอน)</span>
          )}
        </div>

        {/* Synopsis */}
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
            lineHeight: 1.6,
            marginBottom: '24px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {media.description || 'บันทึกความคืบหน้าการดูเรื่องนี้และรับชมตอนถัดไปได้ทันทีผ่านระบบควบคุมด่วน'}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={() => onAddEpisode(entry.id)}
            aria-label={`รับชมต่อ ตอนที่ ${(entry.currentEpisode || 0) + 1}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: '#ffffff', color: '#000000', border: 'none',
              borderRadius: '4px', padding: '12px 26px', fontSize: '15px', fontWeight: 800,
              cursor: 'pointer', transition: 'transform 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#e6e6e6')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
          >
            <Play size={20} fill="#000000" /> รับชมต่อ ตอนที่ {(entry.currentEpisode || 0) + 1}
          </button>

          <button
            onClick={() => onOpenDetail(entry)}
            aria-label="รายละเอียดเพิ่มเติม"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(109, 109, 110, 0.7)', color: 'white', border: 'none',
              borderRadius: '4px', padding: '12px 24px', fontSize: '15px', fontWeight: 700,
              cursor: 'pointer', backdropFilter: 'blur(10px)', transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(109, 109, 110, 0.9)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(109, 109, 110, 0.7)')}
          >
            <Info size={20} /> รายละเอียดเพิ่มเติม
          </button>
        </div>

        {/* Episode Progress Bar */}
        {media.totalEpisodes && (
          <div style={{ marginTop: '20px', width: '320px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>ความคืบหน้า</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>ดูแล้ว {progressPercent}%</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--accent-primary)', borderRadius: '99px' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
