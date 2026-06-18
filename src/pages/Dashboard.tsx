import { useState, useEffect } from 'react';
import { dashboardService, type DashboardStats } from '../services/dashboard.service';
import type { Pemeriksaan } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPemeriksaan, setRecentPemeriksaan] = useState<Pemeriksaan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, recentData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentPemeriksaan(5)
      ]);
      setStats(statsData);
      setRecentPemeriksaan(recentData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat data dashboard. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const handleSendWA = (p: Pemeriksaan) => {
    const lansia = p.lansia;
    if (!lansia) return;
    
    const noHpKeluarga = lansia.no_hp_keluarga;
    if (!noHpKeluarga) {
      alert(`Nomor HP keluarga lansia "${lansia.nama}" belum didaftarkan di biodata.`);
      return;
    }

    let formattedPhone = noHpKeluarga.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    const formattedDate = formatDate(p.tanggal_pemeriksaan);
    const emojiStatus = p.status === 'normal' ? '🟢' : p.status === 'waspada' ? '🟡' : '🔴';

    const pesan = `Halo Bapak/Ibu, berikut laporan hasil pemeriksaan kesehatan rutin untuk orang tua kita:

*Nama:* ${lansia.nama}
*Tanggal Pemeriksaan:* ${formattedDate}
*Tekanan Darah:* ${p.tekanan_darah} mmHg
*Berat Badan:* ${p.berat_badan || '-'} kg
*Tinggi Badan:* ${p.tinggi_badan || '-'} cm
*Gula Darah:* ${p.gula_darah || '-'} mg/dL
*Kolesterol:* ${p.kolesterol || '-'} mg/dL
*Status Kesehatan:* ${p.status.toUpperCase()} ${emojiStatus}
*Catatan:* ${p.catatan || 'Kondisi terpantau baik, tetap jaga pola hidup sehat.'}

*TEMU (Tetap Dekat Meski Berjauhan)*`;

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(pesan)}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px'
      }}>
        <div className="spinner" style={{ width: '48px', height: '48px', borderTopColor: 'var(--primary)', borderWidth: '3px' }} />
        <p style={{ color: 'var(--text-light)', fontWeight: 600 }}>Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--error)', padding: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--error)' }}>Gagal Memuat Dashboard</h3>
        <p style={{ color: 'var(--text-light)', margin: '0 0 16px 0', fontSize: '14px', lineHeight: '1.6' }}>{error}</p>
        <button onClick={loadData} className="btn btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
          Coba Lagi
        </button>
      </div>
    );
  }

  // Fallback stats if stats is null
  const activeStats = stats || {
    totalLansia: 0,
    totalPemeriksaan: 0,
    normalCount: 0,
    waspadaCount: 0,
    bahayaCount: 0
  };

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard Kesehatan</h1>
        <p className="dashboard-subtitle">Ringkasan status kesehatan Lansia Posyandu</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        {/* Total Lansia */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Lansia</span>
            <div className="stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{activeStats.totalLansia}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Lansia Terdaftar</span>
        </div>

        {/* Total Pemeriksaan */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pemeriksaan</span>
            <div className="stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{activeStats.totalPemeriksaan}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Total Pemeriksaan</span>
        </div>

        {/* Normal Status */}
        <div className="stat-card normal">
          <div className="stat-card-header">
            <span className="stat-label">Kondisi Normal</span>
            <div className="stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{activeStats.normalCount}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Kondisi Sehat</span>
        </div>

        {/* Waspada Status */}
        <div className="stat-card waspada">
          <div className="stat-card-header">
            <span className="stat-label">Kondisi Waspada</span>
            <div className="stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{activeStats.waspadaCount}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Perlu Perhatian</span>
        </div>

        {/* Bahaya Status */}
        <div className="stat-card bahaya">
          <div className="stat-card-header">
            <span className="stat-label">Kondisi Bahaya</span>
            <div className="stat-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <div className="stat-number">{activeStats.bahayaCount}</div>
          <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>Perlu Tindakan</span>
        </div>
      </div>

      {/* Recent Pemeriksaan Section */}
      <div className="section-card">
        <div className="section-header">
          <h2 className="section-title">Pemeriksaan Terbaru</h2>
        </div>

        {recentPemeriksaan.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <h3 className="empty-state-title">Belum Ada Riwayat Pemeriksaan</h3>
            <p className="empty-state-desc">
              Belum ada riwayat pemeriksaan lansia yang tercatat di sistem platform TEMU. Silakan lakukan pemeriksaan kesehatan lansia terlebih dahulu.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="pemeriksaan-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Lansia</th>
                  <th>Tekanan Darah (mmHg)</th>
                  <th>Berat Badan (kg)</th>
                  <th>Tinggi Badan (cm)</th>
                  <th>Gula Darah (mg/dL)</th>
                  <th>Kolesterol (mg/dL)</th>
                  <th>Status</th>
                  <th>Catatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {recentPemeriksaan.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.tanggal_pemeriksaan)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {p.lansia?.nama || 'Tidak diketahui'}
                    </td>
                    <td>{p.tekanan_darah}</td>
                    <td>{p.berat_badan}</td>
                    <td>{p.tinggi_badan}</td>
                    <td>{p.gula_darah}</td>
                    <td>{p.kolesterol}</td>
                    <td>
                      <span className={`status-badge ${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.catatan || '-'}
                    </td>
                    <td>
                      <button
                        onClick={() => handleSendWA(p)}
                        className="btn btn-whatsapp btn-small"
                        title="Kirim WA ke Keluarga"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                        </svg>
                        Kirim WA
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
