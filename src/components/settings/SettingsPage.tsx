'use client';

import { useState } from 'react';
import { Database, Save, Check, ShieldCheck } from 'lucide-react';

interface SettingsPageProps {
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export default function SettingsPage({ onExportJSON, onExportCSV }: SettingsPageProps) {
  const [saved, setSaved] = useState(false);
  const [notifSound, setNotifSound] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px' }} className="fade-in">
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)' }}>ตั้งค่าระบบ MATFLIX</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
          จัดการการเชื่อมต่อฐานข้อมูล, การแจ้งเตือน และการสำรองข้อมูลส่วนตัว
        </p>
      </div>

      {saved && (
        <div style={{
          background: 'rgba(70,211,105,0.15)', border: '1px solid rgba(70,211,105,0.4)',
          borderRadius: '8px', padding: '12px 16px', color: 'var(--accent-green)',
          fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Check size={18} /> บันทึกการตั้งค่าระบบเรียบร้อยแล้ว
        </div>
      )}

      {/* Security Status Box */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <ShieldCheck size={20} style={{ color: 'var(--accent-green)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>ระบบความปลอดภัย API (API Security Status)</h2>
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} />
            <span>เชื่อมต่อ TMDB API & AniList API ผ่านสภาพแวดล้อมความปลอดภัยแบบเข้ารหัสลับ (Environment Variable)</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            API Keys ทั้งหมดถูกจัดเก็บในระดับ Server-side เพื่อป้องกันไม่ให้ถูกเปิดเผยในฝั่งเบราว์เซอร์
          </p>
        </div>
      </div>

      {/* Cloud Database Sync Settings */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Database size={20} style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Supabase Cloud Database Sync</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>ซิงค์ข้อมูลกับคลาวด์อัตโนมัติ</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>อัปเดตคลังสื่อ ประวัติ และคอลเลกชันตรงกับ Supabase PostgreSQL</div>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>ส่งเสียงแจ้งเตือนตอนใหม่ออนแอร์</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>เล่นเสียงเตือนเมื่ออนิเมะหรือตอนใหม่ถึงเวลาฉาย</div>
            </div>
            <input
              type="checkbox"
              checked={notifSound}
              onChange={(e) => setNotifSound(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSave}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', background: 'var(--accent-primary)', color: 'white',
                border: 'none', borderRadius: '6px', fontWeight: 800, fontSize: '14px', cursor: 'pointer',
              }}
            >
              <Save size={16} /> บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Export */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Save size={20} style={{ color: '#5a8af0' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>ส่งออกและสำรองข้อมูล (Export Data)</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={onExportJSON}
            style={{
              padding: '10px 18px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)',
              border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            }}
          >
            ส่งออกไฟล์ JSON (สำรองฉบับเต็ม)
          </button>
          <button
            onClick={onExportCSV}
            style={{
              padding: '10px 18px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)',
              border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            }}
          >
            ส่งออกไฟล์ CSV (ตาราง Excel)
          </button>
        </div>
      </div>
    </div>
  );
}
