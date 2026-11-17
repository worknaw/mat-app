'use client';

import { Home, Library, BarChart2, Clock, Settings, GitCommit } from 'lucide-react';
import type { PageView } from '@/app/page';

interface SidebarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  stats: {
    totalMovies: number;
    totalAnime: number;
    totalSeries: number;
    totalHoursWatched: number;
    watchingCount: number;
  };
}

const NAV_ITEMS = [
  { id: 'home' as PageView, label: 'หน้าแรก', icon: Home },
  { id: 'library' as PageView, label: 'คลังสื่อของคุณ', icon: Library },
  { id: 'chronology' as PageView, label: 'ไทม์ไลน์จักรวาล', icon: GitCommit },
  { id: 'stats' as PageView, label: 'สถิติการดู', icon: BarChart2 },
  { id: 'history' as PageView, label: 'ประวัติการรับชม', icon: Clock },
];

export default function Sidebar({ currentPage, onNavigate, stats }: SidebarProps) {
  return (
    <aside style={{
      width: '230px',
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 14px',
      gap: '4px',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto',
    }}>
      {/* Top Spacing */}
      <div style={{ paddingTop: '12px' }} />

      {/* Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPage === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-${item.id}`}
              aria-label={item.label}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '6px', border: 'none',
                cursor: 'pointer', textAlign: 'left', width: '100%',
                background: active ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: '14px',
                transition: 'all 0.15s ease',
                borderLeft: active ? '3px solid var(--accent-primary)' : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                }
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Currently Watching Indicator */}
      {stats.watchingCount > 0 && (
        <div style={{
          background: 'rgba(70, 211, 105, 0.1)',
          border: '1px solid rgba(70, 211, 105, 0.3)',
          borderRadius: '6px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-green)' }} className="pulse-dot" />
          <span style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 700 }}>
            {stats.watchingCount} เรื่องกำลังดูอยู่
          </span>
        </div>
      )}

      {/* Settings */}
      <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
        <button
          id="sidebar-settings"
          aria-label="ตั้งค่า"
          onClick={() => onNavigate('settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 14px', borderRadius: '6px', border: 'none',
            cursor: 'pointer', textAlign: 'left', width: '100%',
            background: currentPage === 'settings' ? 'rgba(229, 9, 20, 0.15)' : 'transparent',
            color: currentPage === 'settings' ? 'var(--accent-primary)' : 'var(--text-muted)',
            borderLeft: currentPage === 'settings' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            fontSize: '14px', fontWeight: currentPage === 'settings' ? 700 : 500, transition: 'all 0.15s ease',
          }}
        >
          <Settings size={18} />
          ตั้งค่าระบบ
        </button>
      </div>
    </aside>
  );
}
