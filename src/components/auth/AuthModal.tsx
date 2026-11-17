'use client';

import { useState } from 'react';
import { X, Loader2, Globe, Code } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  isMandatory?: boolean;
}

export default function AuthModal({ onClose, isMandatory = false }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          onClose();
        } else {
          // If Supabase has confirm email disabled, auto login immediately
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (!signInError && signInData.session) {
            onClose();
          } else {
            setInfoMsg('สร้างบัญชีสำเร็จแล้ว! กำลังนำคุณเข้าสู่ระบบ...');
            setTimeout(() => onClose(), 1000);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          onClose();
        }
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  }

  async function signInWithGithub() {
    await supabase.auth.signInWithOAuth({ provider: 'github' });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="เข้าสู่ระบบ"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (!isMandatory && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-enter"
        style={{
          width: '420px', maxWidth: '95vw',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-bright)',
          borderRadius: '12px', padding: '32px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.9)',
          position: 'relative',
        }}
      >
        {!isMandatory && (
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '6px',
            background: 'var(--accent-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', fontWeight: 900, color: 'white', margin: '0 auto 14px',
            boxShadow: '0 4px 16px rgba(229,9,20,0.6)',
          }}>M</div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>
            {isSignUp ? 'สร้างบัญชี MATFLIX' : 'เข้าสู่ระบบ MATFLIX'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
            {isMandatory ? 'โปรดเข้าสู่ระบบเพื่อเริ่มใช้งานคลังติดตามสื่อและซิงค์ข้อมูลบนคลาวด์' : 'ซิงค์คลังรายการสื่อและประวัติการดูข้ามทุกอุปกรณ์ของคุณ'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '6px', padding: '10px 12px', color: '#f87171', fontSize: '13px', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div style={{ background: 'rgba(70,211,105,0.15)', border: '1px solid rgba(70,211,105,0.4)', borderRadius: '6px', padding: '10px 12px', color: 'var(--accent-green)', fontSize: '13px', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}>
            {infoMsg}
          </div>
        )}

        {/* OAuth Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          <button
            onClick={() => signInWithGoogle()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '12px', borderRadius: '6px', border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <Globe size={16} /> เข้าสู่ระบบด้วย Google
          </button>

          <button
            onClick={() => signInWithGithub()}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '12px', borderRadius: '6px', border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <Code size={16} /> เข้าสู่ระบบด้วย GitHub
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>หรือใช้อีเมล</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input
            type="email"
            placeholder="ที่อยู่อีเมล (Email Address)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '12px 14px', color: 'var(--text-primary)',
              fontSize: '14px', outline: 'none',
            }}
          />
          <input
            type="password"
            placeholder="รหัสผ่าน (Password)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
              borderRadius: '6px', padding: '12px 14px', color: 'var(--text-primary)',
              fontSize: '14px', outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--accent-primary)',
              color: 'white', border: 'none', borderRadius: '6px',
              padding: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '14px',
              marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {isSignUp ? 'ลงทะเบียนใช้งาน' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {isSignUp ? 'มีบัญชีผู้ใช้งานอยู่แล้ว?' : 'ยังไม่มีบัญชีใช้งาน?'}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setInfoMsg(''); }}
            style={{
              background: 'transparent', border: 'none', color: 'var(--accent-primary)',
              fontWeight: 700, cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            {isSignUp ? 'เข้าสู่ระบบที่นี่' : 'สมัครสมาชิกฟรี'}
          </button>
        </div>
      </div>
    </div>
  );
}
