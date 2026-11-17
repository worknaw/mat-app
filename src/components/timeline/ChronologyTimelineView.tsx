'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type { UniversePreset, TimelineNodeItem, TimelineMediaType } from '@/lib/chronologyPresets';
import type { UserLibraryEntry } from '@/lib/types';
import { hydrateUniverse, findMatchingLibraryEntry } from '@/lib/timelineApi';

interface ChronologyTimelineViewProps {
  universe: UniversePreset;
  userLibrary: UserLibraryEntry[];
  onBack: () => void;
  onToggleWatched: (node: TimelineNodeItem) => void;
  onUpdateEpisode?: (node: TimelineNodeItem, targetEpisode: number) => void;
  onUpdateUniverse?: (updatedUniverse: UniversePreset) => void;
  onOpenDetail?: (node: TimelineNodeItem) => void;
}

export default function ChronologyTimelineView({
  universe: initialUniverse,
  userLibrary,
  onBack,
  onToggleWatched,
  onUpdateUniverse,
  onOpenDetail,
}: ChronologyTimelineViewProps) {
  const [universe, setUniverse] = useState<UniversePreset>(initialUniverse);
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);
  const [orderMode, setOrderMode] = useState<'chronological' | 'release'>('chronological');
  const [selectedEra, setSelectedEra] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<TimelineNodeItem | null>(null);

  // Modals state for adding and deleting
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<TimelineNodeItem | null>(null);

  // Form states for Add / Edit Node
  const [formTitle, setFormTitle] = useState('');
  const [formTitleEnglish, setFormTitleEnglish] = useState('');
  const [formType, setFormType] = useState<TimelineMediaType>('movie');
  const [formStoryYear, setFormStoryYear] = useState('');
  const [formEra, setFormEra] = useState('');
  const [formReleaseYear, setFormReleaseYear] = useState(new Date().getFullYear());
  const [formEpisodes, setFormEpisodes] = useState(1);
  const [formPoster, setFormPoster] = useState('');
  const [formSynopsis, setFormSynopsis] = useState('');

  // Hydrate data from API safely on mount
  useEffect(() => {
    let isMounted = true;
    hydrateUniverse(initialUniverse)
      .then((hydrated) => {
        if (isMounted) {
          setUniverse(hydrated);
          setIsApiLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsApiLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialUniverse]);

  // Find user library progress for a specific node
  const getNodeLibraryEntry = (node: TimelineNodeItem) => {
    return findMatchingLibraryEntry(userLibrary, node);
  };

  const getNodeProgress = (node: TimelineNodeItem) => {
    const entry = getNodeLibraryEntry(node);
    const total = node.episodes || 1;
    if (!entry) return { current: 0, total, isCompleted: false, status: 'none' };
    const current = entry.currentEpisode || (entry.status === 'completed' ? total : 0);
    const isCompleted = entry.status === 'completed' || current >= total;
    return { current, total, isCompleted, status: entry.status };
  };

  // Timeline item sorting & filtering
  const sortedItems = [...universe.items].sort((a, b) => {
    if (orderMode === 'chronological') {
      return a.chronologicalOrder - b.chronologicalOrder;
    }
    return a.releaseOrder - b.releaseOrder;
  });

  const filteredItems = sortedItems.filter((item) => {
    const matchesEra = selectedEra === 'all' || item.era === selectedEra;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    return matchesEra && matchesType;
  });

  // Calculate watching stats
  const totalItems = universe.items.length;
  const completedItemsCount = universe.items.filter((item) => getNodeProgress(item).isCompleted).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItemsCount / totalItems) * 100) : 0;



  // ─── ADD / EDIT NODE HANDLERS ─────────────────────────────────────────
  const openAddModal = () => {
    setFormTitle('');
    setFormTitleEnglish('');
    setFormType('movie');
    setFormStoryYear('ปี 2026');
    setFormEra(universe.eras[0] || 'Phase 1: Assemble');
    setFormReleaseYear(new Date().getFullYear());
    setFormEpisodes(1);
    setFormPoster('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop');
    setFormSynopsis('');
    setIsAddModalOpen(true);
  };

  const handleSaveAddNode = () => {
    if (!formTitle.trim()) return;
    const newId = `${universe.id}-custom-${Date.now()}`;
    const maxChronoOrder = universe.items.reduce((max, i) => Math.max(max, i.chronologicalOrder), 0);
    const maxReleaseOrder = universe.items.reduce((max, i) => Math.max(max, i.releaseOrder), 0);

    const newNode: TimelineNodeItem = {
      id: newId,
      title: formTitle.trim(),
      titleEnglish: formTitleEnglish.trim() || formTitle.trim(),
      type: formType,
      storyYear: formStoryYear.trim() || 'ปีไม่ระบุ',
      chronologicalOrder: maxChronoOrder + 1,
      releaseYear: formReleaseYear,
      releaseOrder: maxReleaseOrder + 1,
      era: formEra,
      episodes: formType === 'series' || formType === 'anime' ? Math.max(1, formEpisodes) : 1,
      poster: formPoster.trim() || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
      synopsis: formSynopsis.trim() || 'ไม่มีคำอธิบาย',
    };

    const updated = { ...universe, items: [...universe.items, newNode] };
    setUniverse(updated);
    if (onUpdateUniverse) onUpdateUniverse(updated);
    setIsAddModalOpen(false);
  };

  const handleDeleteNodeConfirm = () => {
    if (!nodeToDelete) return;
    const updatedItems = universe.items.filter((item) => item.id !== nodeToDelete.id);
    const reindexed = updatedItems.map((item, idx) => ({ ...item, chronologicalOrder: idx + 1 }));

    const updated = { ...universe, items: reindexed };
    setUniverse(updated);
    if (onUpdateUniverse) onUpdateUniverse(updated);
    setNodeToDelete(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>
      {/* ─── Back Button & Header Spotlight Banner ─────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button
          id="back-to-universe-hub-btn"
          aria-label="กลับไปหน้ารวมจักรวาล"
          onClick={onBack}
          style={{
            alignSelf: 'flex-start',
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--text-secondary)',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <ArrowLeft size={16} />
          กลับไปหน้ารวมจักรวาล
        </button>

        {/* Universe Banner */}
        <div
          style={{
            position: 'relative',
            borderRadius: '16px',
            overflow: 'hidden',
            padding: '32px 36px',
            background: `linear-gradient(to right, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.7) 60%, rgba(20,20,20,0.4) 100%), url(${universe.coverImage}) center/cover no-repeat`,
            boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
            border: '1px solid var(--border)',
          }}
        >
          <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  background: universe.category === 'anime' ? 'rgba(147, 51, 234, 0.9)' : 'var(--accent-primary)',
                  color: 'white',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                {universe.category === 'anime' ? 'ANIME CHRONOLOGY' : 'CINEMATIC CHRONOLOGY'}
              </span>
              <span
                style={{
                  background: 'rgba(70, 211, 105, 0.2)',
                  color: 'var(--accent-green)',
                  border: '1px solid rgba(70, 211, 105, 0.4)',
                  fontWeight: 700,
                  fontSize: '11px',
                  padding: '3px 10px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Sparkles size={12} />
                {isApiLoading ? 'กำลังดึงข้อมูลสดจาก TMDB/AniList API...' : 'VERIFIED ACCURATE TIMELINE'}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {universe.items.length} ผลงานในระบบ
              </span>
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.2 }}>
              {universe.title}
            </h1>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{universe.titleEnglish}</div>

            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '4px 0 0' }}>
              {universe.description}
            </p>

            {/* Watch Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', background: 'rgba(0,0,0,0.5)', padding: '12px 18px', borderRadius: '10px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>สถานะรับชมของคุณ</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: progressPercent > 0 ? 'var(--accent-green)' : 'white' }}>
                  {completedItemsCount} / {universe.items.length} เรื่องที่รับชมครบ ({progressPercent}%)
                </span>
              </div>
              <div style={{ width: '120px', height: '8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-green)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Control Bar (Sort & Filter & Add Item) ───────────────────── */}
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
        {/* Order Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={16} color="var(--accent-primary)" />
            เรียงลำดับ:
          </span>
          <button
            id="order-chronological-btn"
            aria-label="ลำดับเนื้อเรื่อง"
            onClick={() => setOrderMode('chronological')}
            style={{
              background: orderMode === 'chronological' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
              color: orderMode === 'chronological' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: orderMode === 'chronological' ? 700 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Clock size={14} /> ลำดับเนื้อเรื่อง (Story Order)
          </button>
          <button
            id="order-release-btn"
            aria-label="ลำดับปีฉายจริง"
            onClick={() => setOrderMode('release')}
            style={{
              background: orderMode === 'release' ? 'var(--accent-primary)' : 'rgba(255,255,255,0.06)',
              color: orderMode === 'release' ? 'white' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: orderMode === 'release' ? 700 : 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Calendar size={14} /> ตามปีฉายจริง (Release Order)
          </button>
        </div>

        {/* Era & Type Filters + Add Item Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Era Filter Dropdown */}
          <select
            id="era-filter-select"
            aria-label="เลือกยุคสมัย"
            value={selectedEra}
            onChange={(e) => setSelectedEra(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">ทุกยุคสมัย (All Eras)</option>
            {universe.eras.map((era) => (
              <option key={era} value={era}>
                {era}
              </option>
            ))}
          </select>

          {/* Media Type Filter Dropdown */}
          <select
            id="type-filter-select"
            aria-label="ประเภทสื่อ"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="all">ทุกประเภทสื่อ (All Types)</option>
            <option value="movie">ภาพยนตร์ (Movie)</option>
            <option value="series">ซีรีส์ (Series)</option>
            <option value="anime">อนิเมะ (Anime)</option>
          </select>

          {/* Add New Item Button */}
          <button
            id="add-new-timeline-item-btn"
            aria-label="เพิ่มเรื่องใหม่ในไทม์ไลน์"
            onClick={openAddModal}
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(229,9,20,0.4)',
              transition: 'transform 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Plus size={16} />
            เพิ่มเรื่องในไทม์ไลน์
          </button>
        </div>
      </div>

      {/* ─── VERTICAL TIMELINE STREAM VIEW (Main View) ────────────────── */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '24px', paddingLeft: '28px' }}>
        {/* Central Vertical Timeline Connecting Line */}
        <div
          style={{
            position: 'absolute',
            left: '39px',
            top: '24px',
            bottom: '24px',
            width: '3px',
            background: 'linear-gradient(to bottom, var(--accent-primary) 0%, rgba(229,9,20,0.3) 100%)',
            zIndex: 0,
          }}
        />

        {filteredItems.map((node) => {
          const { current: curEp, isCompleted } = getNodeProgress(node);

          return (
            <div
              key={node.id}
              id={`vertical-node-${node.id}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* Timeline Marker Dot */}
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isCompleted ? 'var(--accent-green)' : curEp > 0 ? 'var(--accent-yellow)' : 'var(--accent-primary)',
                  border: '4px solid var(--bg-primary)',
                  boxShadow: isCompleted
                    ? '0 0 12px rgba(70,211,105,0.8)'
                    : curEp > 0
                    ? '0 0 12px rgba(234,179,8,0.8)'
                    : '0 0 12px rgba(229,9,20,0.8)',
                  marginTop: '20px',
                  flexShrink: 0,
                }}
              />

              {/* Node Main Container */}
              <div
                style={{
                  flex: 1,
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: isCompleted
                    ? '1px solid rgba(70,211,105,0.5)'
                    : curEp > 0
                    ? '1px solid rgba(234,179,8,0.5)'
                    : '1px solid var(--border)',
                  padding: '18px 22px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  position: 'relative',
                }}
              >
                {/* Poster Thumbnail */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={node.poster}
                    alt={node.title}
                    style={{ width: '105px', height: '155px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.5)' }}
                    onClick={() => onOpenDetail ? onOpenDetail(node) : setSelectedNode(node)}
                  />
                  {node.isBranch && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: 'rgba(147, 51, 234, 0.9)',
                        color: 'white',
                        fontSize: '9px',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {node.branchLabel || 'BRANCH'}
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Badges Ribbon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--accent-primary)', color: 'white', fontWeight: 800, fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                      ลำดับที่ #{orderMode === 'chronological' ? node.chronologicalOrder : node.releaseOrder}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--accent-yellow)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {node.storyYear}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {node.era}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: node.type === 'movie' ? '#38bdf8' : '#a855f7',
                        background: 'rgba(255,255,255,0.06)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {node.type}
                    </span>
                  </div>

                  {/* Title & English Title */}
                  <div>
                    <h3
                      style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: 0, cursor: 'pointer', lineHeight: 1.3 }}
                      onClick={() => onOpenDetail ? onOpenDetail(node) : setSelectedNode(node)}
                    >
                      {node.title}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {node.titleEnglish} • ฉายปี {node.releaseYear}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {node.synopsis}
                  </p>

                  {/* Status Badge (Clean & Minimal) */}
                  <div style={{ marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {(() => {
                      const status = getNodeProgress(node).status;
                      if (status === 'dropped') {
                        return (
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            ดรอป/หยุดดู
                          </span>
                        );
                      }
                      if (status === 'watching') {
                        return (
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-yellow)', background: 'rgba(234, 179, 8, 0.15)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                            กำลังดูอยู่
                          </span>
                        );
                      }
                      if (status === 'plan_to_watch') {
                        return (
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                            วางแผนจะดู
                          </span>
                        );
                      }
                      if (status === 'completed') {
                        return (
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-green)', background: 'rgba(70, 211, 105, 0.15)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(70, 211, 105, 0.3)' }}>
                            ดูจบแล้ว
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── ADD NEW TIMELINE ITEM MODAL ──────────────────────────────── */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '28px', border: '1px solid var(--border-bright)', boxShadow: '0 24px 48px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} color="var(--accent-primary)" />
                เพิ่มเรื่องใหม่ในไทม์ไลน์
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ชื่อเรื่องภาษาไทย *</label>
                <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="เช่น Iron Man" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ชื่อภาษาอังกฤษ</label>
                <input type="text" value={formTitleEnglish} onChange={(e) => setFormTitleEnglish(e.target.value)} placeholder="เช่น Iron Man" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ประเภทสื่อ</label>
                  <select value={formType} onChange={(e) => setFormType(e.target.value as TimelineMediaType)} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px' }}>
                    <option value="movie">ภาพยนตร์ (Movie)</option>
                    <option value="series">ซีรีส์ (TV Series)</option>
                    <option value="anime">อนิเมะ (Anime)</option>
                    <option value="special">สเปเชียล / One-Shot</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ปีในเนื้อเรื่อง</label>
                  <input type="text" value={formStoryYear} onChange={(e) => setFormStoryYear(e.target.value)} placeholder="เช่น ปี 2011" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ยุคสมัย (Era)</label>
                  <input type="text" value={formEra} onChange={(e) => setFormEra(e.target.value)} placeholder="Phase 1" style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ปีฉายจริง</label>
                  <input type="number" value={formReleaseYear} onChange={(e) => setFormReleaseYear(Number(e.target.value))} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>จำนวนตอน</label>
                  <input type="number" value={formEpisodes} onChange={(e) => setFormEpisodes(Number(e.target.value))} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>URL รูปภาพโปสเตอร์</label>
                <input type="text" value={formPoster} onChange={(e) => setFormPoster(e.target.value)} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px' }} />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>เรื่องย่อ</label>
                <textarea rows={3} value={formSynopsis} onChange={(e) => setFormSynopsis(e.target.value)} style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 12px', color: 'white', fontSize: '13px', resize: 'vertical' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={handleSaveAddNode} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>เพิ่มเรื่อง</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CONFIRM DELETE MODAL ────────────────────────────────────── */}
      {nodeToDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', maxWidth: '420px', width: '100%', padding: '24px', border: '1px solid var(--border-bright)', boxShadow: '0 24px 48px rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={20} color="#ef4444" />
              ยืนยันการลบออกจากไทม์ไลน์
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              คุณต้องการลบเรื่อง <strong style={{ color: 'white' }}>&quot;{nodeToDelete.title}&quot;</strong> ออกจากไทม์ไลน์จักรวาลนี้ใช่หรือไม่?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setNodeToDelete(null)} style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>ยกเลิก</button>
              <button onClick={handleDeleteNodeConfirm} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>ยืนยันการลบ</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── NODE DETAIL MODAL ────────────────────────────────────────── */}
      {selectedNode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setSelectedNode(null)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              overflow: 'hidden',
              border: '1px solid var(--border-bright)',
              boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div style={{ height: '220px', position: 'relative' }}>
              <img src={selectedNode.poster} alt={selectedNode.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 80%)' }} />
            </div>

            {/* Content Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'var(--accent-primary)', color: 'white', fontWeight: 800, fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                  {selectedNode.era}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--accent-yellow)', fontWeight: 700 }}>
                  ปีในเนื้อเรื่อง: {selectedNode.storyYear}
                </span>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'white', margin: 0 }}>{selectedNode.title}</h2>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedNode.titleEnglish}</div>

              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '8px 0' }}>
                {selectedNode.synopsis}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <button
                  id="modal-toggle-watched-btn"
                  aria-label={getNodeProgress(selectedNode).isCompleted ? 'ดูแล้ว (กดเพื่อยกเลิก)' : 'บันทึกดูแล้ว (Watched)'}
                  onClick={() => onToggleWatched(selectedNode)}
                  style={{
                    background: getNodeProgress(selectedNode).isCompleted ? 'rgba(70, 211, 105, 0.2)' : 'var(--accent-primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={16} />
                  {getNodeProgress(selectedNode).isCompleted ? 'ดูแล้ว (กดเพื่อยกเลิก)' : 'บันทึกดูแล้ว (Watched)'}
                </button>

                <button
                  id="close-node-modal-btn"
                  aria-label="ปิดหน้าต่าง"
                  onClick={() => setSelectedNode(null)}
                  style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '14px', cursor: 'pointer' }}
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
