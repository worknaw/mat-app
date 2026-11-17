'use client';

import { useState } from 'react';
import { X, Plus, Layers } from 'lucide-react';
import type { UniversePreset, UniverseCategory } from '@/lib/chronologyPresets';

interface CreateUniverseModalProps {
  onClose: () => void;
  onCreate: (newUniverse: UniversePreset) => void;
}

export default function CreateUniverseModal({ onClose, onCreate }: CreateUniverseModalProps) {
  const [title, setTitle] = useState('');
  const [titleEnglish, setTitleEnglish] = useState('');
  const [category, setCategory] = useState<UniverseCategory>('live_action');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [badgeText] = useState('จักรวาลแบบปรับแต่งเอง');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newUniverse: UniversePreset = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      titleEnglish: titleEnglish.trim() || title.trim(),
      category,
      description: description.trim() || 'จักรวาลสื่อปรับแต่งโดยผู้ใช้',
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1200&auto=format&fit=crop',
      posterImage: coverImage.trim() || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
      featuredBadge: badgeText.trim() || 'CUSTOM UNIVERSE',
      eras: ['Main Era'],
      items: [],
    };

    onCreate(newUniverse);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '16px',
          maxWidth: '520px',
          width: '100%',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={18} color="white" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'white', margin: 0 }}>สร้างจักรวาลใหม่ (Custom Universe)</h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เพิ่มจักรวาลภาพยนตร์หรืออนิเมะของคุณเอง</div>
            </div>
          </div>
          <button id="close-create-modal" aria-label="ปิดหน้าต่าง" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              ชื่อจักรวาล (ภาษาไทย) *
            </label>
            <input
              id="universe-title-input"
              aria-label="ชื่อจักรวาล (ภาษาไทย)"
              type="text"
              required
              placeholder="เช่น จักรวาลโลกเวทมนตร์ (Wizarding World)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              ชื่อภาษาอังกฤษ (English Name)
            </label>
            <input
              id="universe-title-en-input"
              aria-label="ชื่อภาษาอังกฤษ"
              type="text"
              placeholder="เช่น Wizarding World / Harry Potter Universe"
              value={titleEnglish}
              onChange={(e) => setTitleEnglish(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              หมวดหมู่สื่อ (Category)
            </label>
            <select
              id="universe-category-select"
              aria-label="หมวดหมู่สื่อ"
              value={category}
              onChange={(e) => setCategory(e.target.value as UniverseCategory)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="live_action">ภาพยนตร์ / ซีรีส์ (Live Action)</option>
              <option value="anime">อนิเมะ (Anime)</option>
              <option value="transmedia">จักรวาลผสม (Transmedia)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              คำอธิบายจักรวาลย่อ
            </label>
            <textarea
              id="universe-description-input"
              aria-label="คำอธิบายจักรวาลย่อ"
              rows={3}
              placeholder="รายละเอียดสั้นๆ ของจักรวาลนี้..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              ลิงก์รูปภาพปก Banner Image URL (Optional)
            </label>
            <input
              id="universe-cover-url-input"
              aria-label="ลิงก์รูปภาพปก"
              type="text"
              placeholder="https://..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button
              id="cancel-create-btn"
              aria-label="ยกเลิก"
              type="button"
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600 }}
            >
              ยกเลิก
            </button>
            <button
              id="confirm-create-universe-btn"
              aria-label="สร้างจักรวาล"
              type="submit"
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(229,9,20,0.4)',
              }}
            >
              <Plus size={16} />
              สร้างจักรวาล
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
