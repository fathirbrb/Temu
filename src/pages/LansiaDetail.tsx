import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { lansiaService } from '../services/lansia.service';
import type { Lansia } from '../types';

export default function LansiaDetail() {
  const { id } = useParams<{ id: string }>();
  const [lansia, setLansia] = useState<Lansia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLansiaDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await lansiaService.getLansiaById(id);
      setLansia(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat detail lansia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLansiaDetails();
  }, [id]);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '-';
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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', gap: '12px' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', borderWidth: '3px' }} />
        <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Memuat detail lansia...</p>
      </div>
    );
  }

  if (error || !lansia) {
    return (
      <div className="card" style={{ borderLeft: '4px solid var(--error)', padding: '24px' }}>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--error)' }}>Detail Lansia Tidak Ditemukan</h3>
        <p style={{ color: 'var(--text-light)', margin: '0 0 16px 0', fontSize: '14px' }}>{error || 'Data lansia tidak ditemukan atau telah dihapus.'}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadLansiaDetails} className="btn btn-primary" style={{ width: 'auto' }}>Coba Lagi</button>
          <Link to="/lansia" className="btn btn-outline" style={{ width: 'auto' }}>Kembali ke Daftar</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="dashboard-title">{lansia.nama}</h1>
          <p className="dashboard-subtitle">NIK: {lansia.nik}</p>
        </div>
        <Link to="/lansia" className="btn btn-outline" style={{ width: 'auto' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Kembali ke Daftar
        </Link>
      </div>

      <div className="detail-grid">
        {/* Section 1: Biodata */}
        <div className="detail-section">
          <h2 className="detail-section-title">Biodata Lansia</h2>
          
          <div className="detail-row">
            <span className="detail-label">Nama Lengkap</span>
            <span className="detail-value">{lansia.nama}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">NIK (Nomor Induk Kependudukan)</span>
            <span className="detail-value" style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{lansia.nik}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Jenis Kelamin</span>
            <span className="detail-value">{lansia.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Tanggal Lahir</span>
            <span className="detail-value">{formatDate(lansia.tanggal_lahir)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Alamat Tinggal</span>
            <span className="detail-value">{lansia.alamat || '-'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Nomor Telepon / HP</span>
            <span className="detail-value">{lansia.no_hp || '-'}</span>
          </div>
        </div>

        {/* Section 2: Keluarga Penanggung Jawab */}
        <div className="detail-section">
          <h2 className="detail-section-title">Keluarga / Penanggung Jawab</h2>

          <div className="detail-row">
            <span className="detail-label">Nama Hubungan Keluarga</span>
            <span className="detail-value">{lansia.nama_keluarga || '-'}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Nomor HP Keluarga</span>
            <span className="detail-value">{lansia.no_hp_keluarga || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
