'use client';

import { useState } from 'react';
import { Plus, Minus, Heart, Trash2, X, ExternalLink } from 'lucide-react';
import type { UserLibraryEntry, WatchStatus, Platform, Collection } from '@/lib/types';

interface MediaDetailModalProps {
  entry: UserLibraryEntry;
  onClose: () => void;
  onUpdate: (updates: Partial<UserLibraryEntry>) => void;
  onRemove: () => void;
  onAddEpisode: () => void;
  onSubtractEpisode: () => void;
  collections?: Collection[];
  onToggleCollection?: (colId: string, item: UserLibraryEntry | Record<string, unknown>) => void;
}

const STATUSES: { value: WatchStatus; label: string; color: string }[] = [
  { value: 'watching', label: 'กำลังดูอยู่', color: 'var(--accent-green)' },
  { value: 'completed', label: 'ดูจบแล้ว', color: '#60a5fa' },
  { value: 'dropped', label: 'ดรอป/หยุดดู', color: '#f87171' },
  { value: 'plan_to_watch', label: 'วางแผนจะดู', color: 'var(--text-muted)' },
];

export default function MediaDetailModal({
  entry, onClose, onUpdate, onRemove, onAddEpisode, onSubtractEpisode, collections, onToggleCollection,
}: MediaDetailModalProps) {
  const [userRating, setUserRating] = useState(entry.userRating || 0);
  const [notes, setNotes] = useState(entry.notes || '');
  const [status, setStatus] = useState<WatchStatus>(entry.status);
  const [platforms] = useState<Platform[]>(entry.platforms || []);
  const [isFavorite, setIsFavorite] = useState(entry.isFavorite);
  const [currentEp, setCurrentEp] = useState(entry.currentEpisode || 0);

  const { media } = entry;
  const progress = media.totalEpisodes ? Math.min(100, Math.round((currentEp / media.totalEpisodes) * 100)) : (entry.progressPercent || 0);

  const isMaxEpisode = Boolean(media.totalEpisodes && currentEp >= media.totalEpisodes);
  const isMinEpisode = currentEp <= 0;

  const watchLink = (() => {
    const englishTitle = media.titleEnglish || media.title || 'media';
    const nativeTitle = media.title || '';
    const year = media.year ? String(media.year) : '';
    const searchQuery = [englishTitle, nativeTitle && nativeTitle !== englishTitle ? nativeTitle : '', year].filter(Boolean).join(' ');

    return `https://ezmovie.live/search-result?search=${encodeURIComponent(searchQuery)}`;
  })();

  function save() {
    onUpdate({ userRating, notes, status, platforms, isFavorite, currentEpisode: currentEp });
  }

  function handlePlus() {
    if (isMaxEpisode) return;
    const next = currentEp + 1;
    setCurrentEp(next);
    if (media.totalEpisodes && next >= media.totalEpisodes) {
      setStatus('completed');
    }
    onAddEpisode();
  }

  function handleMinus() {
    if (isMinEpisode) return;
    const next = Math.max(0, currentEp - 1);
    setCurrentEp(next);
    onSubtractEpisode();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="รายละเอียดสื่อ"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) { save(); onClose(); } }}
    >
      <div
        className="modal-enter"
        style={{
          width: '780px', maxWidth: '96vw', maxHeight: '90vh',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-bright)',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
        }}
      >
        {/* Banner / Header */}
        <div style={{ position: 'relative', height: '200px', flexShrink: 0, overflow: 'hidden' }}>
          {media.banner ? (
            <img
              src={media.banner}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #1f1f1f, #141414)',
            }} />
          )}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(20,20,20,0.2), var(--bg-secondary))',
          }} />

          {/* Close button */}
          <button
            onClick={() => { save(); onClose(); }}
            id="detail-close-btn"
            aria-label="ปิดหน้าต่าง"
            style={{
              position: 'absolute', top: '16px', right: '16px',
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <X size={16} />
          </button>

          {/* Title on Banner */}
          <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
            <img
              src={media.poster}
              alt={media.title}
              style={{
                width: 90, height: 130, borderRadius: '6px', objectFit: 'cover',
                border: '2px solid var(--border-bright)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span className={`type-badge type-${media.type}`}>
                  {media.type === 'movie' ? 'ภาพยนตร์' : media.type === 'anime' ? 'อนิเมะ' : 'ซีรีส์'}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{media.year}</span>
                {media.studio && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {media.studio}</span>
                )}
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)', textShadow: '0 2px 8px rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {media.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: '24px' }}>
            {/* Left column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Description */}
              {media.description && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>เรื่องย่อ</div>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {media.description}
                  </p>
                </div>
              )}

              {/* Genres */}
              {media.genres.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {media.genres.map((g) => (
                    <span key={g} style={{
                      fontSize: '11px', padding: '3px 10px', borderRadius: '99px',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                      color: 'var(--text-secondary)', fontWeight: 600,
                    }}>
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Progress */}
              {(media.type === 'anime' || media.type === 'series') && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>ความคืบหน้าการรับชม</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '14px 16px', border: '1px solid var(--border)' }}>
                    <button
                      id="detail-ep-minus"
                      onClick={handleMinus}
                      disabled={isMinEpisode}
                      aria-label="ลด 1 ตอน"
                      className="ep-btn"
                      style={{
                        flexShrink: 0,
                        opacity: isMinEpisode ? 0.3 : 1,
                        cursor: isMinEpisode ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Minus size={14} />
                    </button>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      {media.type === 'series' && entry.currentSeason && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>ซีซั่น {entry.currentSeason}</div>
                      )}
                      <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>
                        ตอนที่ {currentEp}
                      </div>
                      {media.totalEpisodes && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>จากทั้งหมด {media.totalEpisodes} ตอน</div>
                      )}
                    </div>
                    <button
                      id="detail-ep-plus"
                      onClick={handlePlus}
                      disabled={isMaxEpisode}
                      aria-label="เพิ่ม 1 ตอน"
                      className="ep-btn"
                      style={{
                        flexShrink: 0,
                        opacity: isMaxEpisode ? 0.3 : 1,
                        cursor: isMaxEpisode ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {media.totalEpisodes && (
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden', marginTop: '8px' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent-primary)', borderRadius: '99px', transition: 'width 0.2s ease' }} />
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>บันทึกส่วนตัว</div>
                <textarea
                  id="detail-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="พิมพ์บันทึกความคิดเห็น ความรู้สึก หรือตอนที่ชอบ..."
                  rows={3}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border)', borderRadius: '6px',
                    color: 'var(--text-primary)', padding: '10px 12px',
                    fontSize: '13px', resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                    lineHeight: '1.6',
                  }}
                  onFocus={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--accent-primary)'; }}
                  onBlur={e => { (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'var(--border)'; }}
                />
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status */}
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>สถานะการดู</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      id={`detail-status-${s.value}`}
                      onClick={() => setStatus(s.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 12px', borderRadius: '6px', border: 'none',
                        cursor: 'pointer', textAlign: 'left',
                        background: status === s.value ? `${s.color}1a` : 'rgba(255,255,255,0.03)',
                        color: status === s.value ? s.color : 'var(--text-secondary)',
                        fontWeight: status === s.value ? 700 : 400,
                        fontSize: '13px',
                        outline: status === s.value ? `1px solid ${s.color}44` : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, opacity: status === s.value ? 1 : 0.4 }} />
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>คะแนนของคุณ</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUserRating(star)}
                      aria-label={`ให้คะแนน ${star} ดาว`}
                      style={{
                        background: 'transparent', border: 'none', padding: '2px', cursor: 'pointer',
                        color: star <= userRating ? 'var(--accent-yellow)' : 'rgba(255,255,255,0.15)',
                        fontSize: '14px', transition: 'color 0.1s',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <div style={{ fontSize: '12px', color: 'var(--accent-yellow)', fontWeight: 700, marginTop: '4px' }}>
                    {userRating} / 10 คะแนน
                  </div>
                )}
              </div>

              {/* Favorite toggle */}
              <button
                id="detail-fav-btn"
                onClick={() => setIsFavorite(!isFavorite)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px', borderRadius: '6px',
                  background: isFavorite ? 'rgba(229, 9, 20, 0.15)' : 'rgba(255,255,255,0.03)',
                  border: isFavorite ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                  color: isFavorite ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <Heart size={15} fill={isFavorite ? 'var(--accent-primary)' : 'none'} />
                {isFavorite ? 'รายการโปรดแล้ว' : 'เพิ่มเป็นรายการโปรด'}
              </button>

              <a
                href={watchLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '10px', borderRadius: '6px',
                  background: 'rgba(96, 165, 250, 0.12)',
                  border: '1px solid rgba(96, 165, 250, 0.35)',
                  color: '#60a5fa',
                  fontWeight: 700, fontSize: '13px', cursor: 'pointer', textDecoration: 'none',
                }}
              >
                <ExternalLink size={15} />
                {media.type === 'movie' ? 'ดูหนังนี้' : 'ดูเรื่องนี้'}
              </a>

              {/* Collections Selector */}
              {collections && collections.length > 0 && onToggleCollection && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                    คอลเลกชันส่วนตัว
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '110px', overflowY: 'auto' }}>
                    {collections.map((col) => {
                      const inCol = (col.items || []).some((i) => {
                        const itemObj = i as Record<string, unknown>;
                        return itemObj.id === entry.id || itemObj.mediaId === entry.id || itemObj.title === entry.media.title;
                      });
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => onToggleCollection(col.id, entry)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)',
                            background: inCol ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.03)',
                            color: inCol ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          <span>{col.emoji || '📁'} {col.name}</span>
                          <span style={{ fontWeight: 800 }}>{inCol ? '✓ อยู่ในคอลเลกชัน' : '+ เพิ่ม'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Save & Remove */}
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px' }}>
                <button
                  id="detail-save-btn"
                  onClick={() => { save(); onClose(); }}
                  style={{
                    padding: '12px', borderRadius: '6px', border: 'none',
                    background: 'var(--accent-primary)', color: 'white',
                    fontWeight: 800, fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
                <button
                  id="detail-remove-btn"
                  onClick={() => { onRemove(); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '8px', borderRadius: '6px', border: 'none',
                    background: 'transparent', color: '#f87171',
                    fontSize: '12px', cursor: 'pointer', opacity: 0.8,
                  }}
                >
                  <Trash2 size={13} /> ลบออกจากคลัง
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
