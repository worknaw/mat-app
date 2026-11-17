'use client';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Library, Film, Sparkles, Tv, Clock } from 'lucide-react';

interface StatsPageProps {
  stats: {
    totalMovies: number;
    totalAnime: number;
    totalSeries: number;
    totalEpisodesWatched: number;
    totalHoursWatched: number;
    topGenres: { genre: string; count: number; percent: number }[];
    watchingCount: number;
    completedCount: number;
    droppedCount: number;
    planToWatchCount: number;
  };
  watchHistory: { watchedAt: string; mediaType: string; durationWatched?: number }[];
}

const COLORS = ['#e50914', '#5a8af0', '#46d369', '#f5c518', '#e040a0', '#fbbf24', '#a78bfa', '#f87171', '#60a5fa', '#9ca3af'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-bright)', borderRadius: '6px', padding: '8px 12px', fontSize: '13px', color: 'var(--text-primary)' }}>
      <div style={{ fontWeight: 700 }}>{label}</div>
      <div style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{payload[0].value} รายการ</div>
    </div>
  );
};

export default function StatsPage({ stats }: StatsPageProps) {
  const typeData = [
    { name: 'อนิเมะ', value: stats.totalAnime },
    { name: 'ภาพยนตร์', value: stats.totalMovies },
    { name: 'ซีรีส์', value: stats.totalSeries },
  ].filter((d) => d.value > 0);

  const statusData = [
    { name: 'กำลังดูอยู่', value: stats.watchingCount },
    { name: 'ดูจบแล้ว', value: stats.completedCount },
    { name: 'ดรอป/หยุดดู', value: stats.droppedCount },
    { name: 'วางแผนจะดู', value: stats.planToWatchCount },
  ].filter((d) => d.value > 0);

  const totalItems = stats.totalMovies + stats.totalAnime + stats.totalSeries;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px' }} className="fade-in">
      <div>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-primary)' }}>สถิติการรับชมสื่อ</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>วิเคราะห์สรุปพฤติกรรมการรับชมสื่อและเวลาของคุณ</p>
      </div>

      {/* Big numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
        {[
          { label: 'รายการทั้งหมด', value: totalItems, Icon: Library, color: 'var(--accent-primary)' },
          { label: 'ภาพยนตร์', value: stats.totalMovies, Icon: Film, color: '#5a8af0' },
          { label: 'อนิเมะ', value: stats.totalAnime, Icon: Sparkles, color: '#ff5757' },
          { label: 'ซีรีส์', value: stats.totalSeries, Icon: Tv, color: 'var(--accent-green)' },
          { label: 'ชั่วโมงที่รับชม', value: `${stats.totalHoursWatched} ชม.`, Icon: Clock, color: 'var(--accent-orange)' },
        ].map((c) => {
          const IconComp = c.Icon;
          return (
            <div key={c.label} style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '20px 16px', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ marginBottom: '10px', color: c.color, background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '50%' }}>
                <IconComp size={24} />
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: c.color, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 600 }}>{c.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Media Type Pie */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px' }}>สัดส่วนประเภทสื่อ (Media Distribution)</h3>
          {typeData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {typeData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginLeft: 'auto' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>ยังไม่มีข้อมูลการรับชม</div>}
        </div>

        {/* Status Pie */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px' }}>สถานะการรับชม (Status Breakdown)</h3>
          {statusData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusData.map((d) => {
                      const c: Record<string, string> = { 'กำลังดูอยู่': 'var(--accent-green)', 'ดูจบแล้ว': '#60a5fa', 'ดรอป/หยุดดู': '#f87171', 'วางแผนจะดู': 'var(--text-muted)' };
                      return <Cell key={d.name} fill={c[d.name] || 'var(--accent-primary)'} />;
                    })}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {statusData.map((d) => {
                  const c: Record<string, string> = { 'กำลังดูอยู่': 'var(--accent-green)', 'ดูจบแล้ว': '#60a5fa', 'ดรอป/หยุดดู': '#f87171', 'วางแผนจะดู': 'var(--text-muted)' };
                  return (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: c[d.name], flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{d.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginLeft: 'auto' }}>{d.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>ยังไม่มีข้อมูลการรับชม</div>}
        </div>
      </div>

      {/* Genre Bar Chart */}
      {stats.topGenres.length > 0 && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '16px' }}>หมวดหมู่อยอดนิยม (Top Genres)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.topGenres.slice(0, 8)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="genre" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(229, 9, 20, 0.08)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="url(#genreGradient)" />
              <defs>
                <linearGradient id="genreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="#b81d24" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Watch summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px' }}>ภาพรวมเวลาที่ใช้ดู</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'จำนวนตอนที่บันทึกไว้', value: `${stats.totalEpisodesWatched} ตอน` },
              { label: 'รวมเวลาที่รับชม', value: `${stats.totalHoursWatched} ชั่วโมง` },
              { label: 'คิดเป็นจำนวนวัน', value: `${Math.round(stats.totalHoursWatched / 24)} วัน` },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--accent-primary)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px' }}>สัดส่วนประเภทแนวสื่อ</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.topGenres.slice(0, 5).map((g, i) => (
              <div key={g.genre} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 900, color: 'var(--accent-primary)', minWidth: '20px' }}>#{i + 1}</span>
                <span style={{ flex: 1, fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>{g.genre}</span>
                <div style={{ width: '80px', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${g.percent}%`, background: 'var(--accent-primary)' }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', minWidth: '34px', textAlign: 'right', fontWeight: 700 }}>{g.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
