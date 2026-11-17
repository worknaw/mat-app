'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Bell, User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({ onOpenSearch, onOpenAuth }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    setMenuOpen(false);
    await supabase.auth.signOut();
  }

  const notifications = [
    { id: '1', title: 'ตารางออนแอร์ใหม่', desc: 'มี 4 ตอนใหม่ออนแอร์สัปดาห์นี้ในปฏิทินของคุณ', time: '10 นาทีที่แล้ว', unread: true },
    { id: '2', title: 'ซิงค์ข้อมูลคลาวด์สำเร็จ', desc: 'คลังสื่อของคุณถูกบันทึกลง Supabase แล้ว', time: '1 ชั่วโมงที่แล้ว', unread: false },
  ];

  return (
    <nav
      className="glass"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(20, 20, 20, 0.95)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: Brand Space */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 900,
            fontSize: '22px',
            letterSpacing: '2px',
            color: 'var(--accent-primary)',
            userSelect: 'none',
          }}
        >
          MAT
        </span>
      </div>

      {/* Center: Search Bar */}
      <button
        onClick={onOpenSearch}
        aria-label="ค้นหาภาพยนตร์, อนิเมะ และซีรีส์"
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '10px 16px', cursor: 'pointer',
          width: '100%', maxWidth: '340px', color: 'var(--text-muted)',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)';
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(229, 9, 20, 0.08)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
        }}
        id="navbar-search"
      >
        <Search size={16} />
        <span style={{ flex: 1, textAlign: 'left', fontSize: '14px' }}>ค้นหาภาพยนตร์, อนิเมะ, ซีรีส์...</span>
        <div style={{
          display: 'flex', gap: '4px', fontSize: '11px',
          background: 'rgba(255,255,255,0.08)', borderRadius: '5px', padding: '2px 6px',
          color: 'var(--text-muted)',
        }}>
          <span>Ctrl</span><span>K</span>
        </div>
      </button>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onOpenSearch}
          id="navbar-add"
          aria-label="เพิ่มสื่อลงคลัง"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--accent-primary)',
            color: 'white', border: 'none', borderRadius: '8px',
            padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
            transition: 'all 0.2s ease',
          }}
        >
          <Plus size={16} />
          เพิ่มสื่อ
        </button>

        {/* Notifications Button & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setNotifOpen(!notifOpen); setMenuOpen(false); }}
            id="navbar-notifications"
            aria-label="การแจ้งเตือน"
            style={{
              width: 38, height: 38, borderRadius: '8px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: notifOpen ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.05)',
              border: notifOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
              cursor: 'pointer', color: notifOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
          >
            <Bell size={16} />
          </button>
          {notifications.some(n => n.unread) && <div className="notif-dot" />}

          {notifOpen && (
            <div style={{
              position: 'absolute', top: '120%', right: 0, width: '300px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
              borderRadius: '10px', padding: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.85)',
              zIndex: 100,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>ศูนย์การแจ้งเตือน</span>
                <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700 }}>2 ใหม่</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{
                    padding: '10px', borderRadius: '6px',
                    background: n.unread ? 'rgba(229,9,20,0.08)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border)',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {n.desc}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
                      {n.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Auth Profile / Dropdown */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setMenuOpen(!menuOpen); setNotifOpen(false); }}
              aria-label="เมนูผู้ใช้งาน"
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%', background: 'var(--accent-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 800, color: 'white',
              }}>
                {(user.email?.[0] || 'U').toUpperCase()}
              </div>
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </button>

            {menuOpen && (
              <div style={{
                position: 'absolute', top: '120%', right: 0, width: '200px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)',
                borderRadius: '8px', padding: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
                zIndex: 100,
              }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>เข้าสู่ระบบในชื่อ</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.email}
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', background: 'transparent', border: 'none',
                    color: '#f87171', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 700, textAlign: 'left',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  <LogOut size={15} />
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            id="navbar-login-btn"
            aria-label="เข้าสู่ระบบ"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px 14px', cursor: 'pointer',
              color: 'var(--text-primary)', fontWeight: 600, fontSize: '13px',
            }}
          >
            <UserIcon size={15} style={{ color: 'var(--accent-primary)' }} />
            เข้าสู่ระบบ
          </button>
        )}
      </div>
    </nav>
  );
}
