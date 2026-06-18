import { useState, useEffect } from 'react';
import { pemeriksaanService } from '../services/pemeriksaan.service';
import { lansiaService } from '../services/lansia.service';
import { getHealthStatus } from '../utils/health';
import type { Pemeriksaan, Lansia } from '../types';

export default function Pemeriksaan() {
  const [pemeriksaanList, setPemeriksaanList] = useState<Pemeriksaan[]>([]);
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal form states
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingPemeriksaanId, setEditingPemeriksaanId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Fields
  const [lansiaId, setLansiaId] = useState('');
  const [tanggalPemeriksaan, setTanggalPemeriksaan] = useState('');
  const [tekananDarah, setTekananDarah] = useState('');
  const [beratBadan, setBeratBadan] = useState('');
  const [tinggiBadan, setTinggiBadan] = useState('');
  const [gulaDarah, setGulaDarah] = useState('');
  const [kolesterol, setKolesterol] = useState('');
  const [catatan, setCatatan] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pemeriksaanData, lansiaData] = await Promise.all([
        pemeriksaanService.getAllPemeriksaan(),
        lansiaService.getAllLansia()
      ]);
      setPemeriksaanList(pemeriksaanData);
      setLansiaList(lansiaData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data pemeriksaan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingPemeriksaanId(null);
    setSubmitError(null);

    // Default form values
    setLansiaId(lansiaList.length > 0 ? lansiaList[0].id : '');
    setTanggalPemeriksaan(new Date().toISOString().split('T')[0]);
    setTekananDarah('');
    setBeratBadan('');
    setTinggiBadan('');
    setGulaDarah('');
    setKolesterol('');
    setCatatan('');
    setIsOpenModal(true);
  };

  const openEditModal = (p: Pemeriksaan) => {
    setModalMode('edit');
    setEditingPemeriksaanId(p.id);
    setSubmitError(null);

    // Pre-fill form values
    setLansiaId(p.lansia_id || '');
    setTanggalPemeriksaan(p.tanggal_pemeriksaan || '');
    setTekananDarah(String(p.tekanan_darah || ''));
    setBeratBadan(String(p.berat_badan || ''));
    setTinggiBadan(String(p.tinggi_badan || ''));
    setGulaDarah(String(p.gula_darah || ''));
    setKolesterol(String(p.kolesterol || ''));
    setCatatan(p.catatan || '');
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validation
    if (!lansiaId) {
      setSubmitError('Pilih Lansia terlebih dahulu.');
      return;
    }
    if (!tanggalPemeriksaan) {
      setSubmitError('Tanggal Pemeriksaan wajib diisi.');
      return;
    }
    if (!tekananDarah || isNaN(Number(tekananDarah))) {
      setSubmitError('Tekanan Darah (Sistolik) wajib diisi dengan angka valid.');
      return;
    }

    setSubmitLoading(true);

    const payload = {
      lansia_id: lansiaId,
      tanggal_pemeriksaan: tanggalPemeriksaan,
      tekanan_darah: Number(tekananDarah),
      berat_badan: Number(beratBadan || 0),
      tinggi_badan: Number(tinggiBadan || 0),
      gula_darah: Number(gulaDarah || 0),
      kolesterol: Number(kolesterol || 0),
      catatan: catatan.trim() || null
    };

    try {
      if (modalMode === 'create') {
        await pemeriksaanService.createPemeriksaan(payload);
      } else if (modalMode === 'edit' && editingPemeriksaanId) {
        await pemeriksaanService.updatePemeriksaan(editingPemeriksaanId, payload);
      }
      await loadData();
      closeModal();
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Terjadi kesalahan saat menyimpan data pemeriksaan.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string, lansiaNama: string, tanggal: string) => {
    const formattedDate = formatDate(tanggal);
    if (window.confirm(`Apakah Anda yakin ingin menghapus pemeriksaan "${lansiaNama}" pada tanggal ${formattedDate}?`)) {
      try {
        await pemeriksaanService.deletePemeriksaan(id);
        await loadData();
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Gagal menghapus data pemeriksaan.');
      }
    }
  };

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

  // Live status calculation for modal display
  const liveStatus = getHealthStatus(
    Number(tekananDarah || 0),
    Number(gulaDarah || 0),
    Number(kolesterol || 0)
  );

  return (
    <div>
      {/* Print-only Header */}
      <div className="print-only print-header">
        <h1 className="print-title">Laporan Bulanan Pemeriksaan Kesehatan Lansia</h1>
        <p className="print-subtitle">Posyandu TEMU (Tetap Dekat Meski Berjauhan) — Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="dashboard-title">Pemeriksaan Kesehatan</h1>
          <p className="dashboard-subtitle">Kelola dan pantau riwayat pemeriksaan kesehatan lansia</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-outline"
            style={{ width: 'auto' }}
            disabled={pemeriksaanList.length === 0}
            title="Cetak Laporan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Cetak Laporan
          </button>
          <button
            onClick={openCreateModal}
            className="btn btn-primary"
            style={{ width: 'auto' }}
            disabled={lansiaList.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Pemeriksaan
          </button>
        </div>
      </div>

      {lansiaList.length === 0 && !loading && (
        <div className="card" style={{ borderLeft: '4px solid var(--secondary)', marginBottom: '24px', padding: '16px 24px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-light)', fontWeight: 600 }}>
            Informasi: Daftarkan minimal 1 orang Lansia terlebih dahulu agar dapat membuat laporan pemeriksaan kesehatan.
          </p>
        </div>
      )}

      {/* States content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '12px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', borderWidth: '3px' }} />
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Memuat data pemeriksaan...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ borderLeft: '4px solid var(--error)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--error)' }}>Gagal Memuat Data</h3>
          <p style={{ color: 'var(--text-light)', margin: '0 0 16px 0', fontSize: '14px' }}>{error}</p>
          <button onClick={loadData} className="btn btn-primary" style={{ width: 'auto' }}>Coba Lagi</button>
        </div>
      ) : pemeriksaanList.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M12 8v8" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <h3 className="empty-state-title">Belum Ada Pemeriksaan Kesehatan</h3>
            <p className="empty-state-desc">
              Belum ada data pemeriksaan kesehatan lansia yang dicatat. Silakan klik tombol "Tambah Pemeriksaan" di atas untuk menambahkan laporan baru.
            </p>
          </div>
        </div>
      ) : (
        <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="pemeriksaan-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Lansia</th>
                  <th>Tensi (mmHg)</th>
                  <th>Berat (kg)</th>
                  <th>Tinggi (cm)</th>
                  <th>Gula Darah (mg/dL)</th>
                  <th>Kolesterol (mg/dL)</th>
                  <th>Status</th>
                  <th>Catatan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pemeriksaanList.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDate(p.tanggal_pemeriksaan)}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {p.lansia?.nama || 'Tidak diketahui'}
                    </td>
                    <td>{p.tekanan_darah}</td>
                    <td>{p.berat_badan || '-'}</td>
                    <td>{p.tinggi_badan || '-'}</td>
                    <td>{p.gula_darah || '-'}</td>
                    <td>{p.kolesterol || '-'}</td>
                    <td>
                      <span className={`status-badge ${p.status}`}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.catatan || '-'}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn-outline btn-small"
                          style={{ color: 'var(--primary)' }}
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.lansia?.nama || 'Lansia', p.tanggal_pemeriksaan)}
                          className="btn btn-outline btn-small"
                          style={{ color: 'var(--error)' }}
                          title="Hapus"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Print-only Footer Signatures */}
          <div className="print-only print-footer">
            <div className="signature-box">
              <p>Mengetahui,</p>
              <p>Tenaga Kesehatan Puskesmas</p>
              <div className="signature-space"></div>
              <p className="signature-name">................................................</p>
              <p>NIP. ........................................</p>
            </div>
            <div className="signature-box">
              <p>Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p>Kader Posyandu Lansia</p>
              <div className="signature-space"></div>
              <p className="signature-name">................................................</p>
              <p>Nama Lengkap Kader</p>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isOpenModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{modalMode === 'create' ? 'Tambah Laporan Pemeriksaan' : 'Ubah Laporan Pemeriksaan'}</h2>
              <button onClick={closeModal} className="modal-close-btn" aria-label="Tutup">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {submitError && <div className="alert-error" style={{ marginBottom: '16px' }}>{submitError}</div>}

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="lansiaSelect">Lansia <span style={{ color: 'var(--error)' }}>*</span></label>
                    <select
                      id="lansiaSelect"
                      className="form-input"
                      value={lansiaId}
                      onChange={(e) => setLansiaId(e.target.value)}
                      required
                      style={{ height: '46px' }}
                      disabled={modalMode === 'edit'} // Lock lansia in edit mode
                    >
                      <option value="" disabled>-- Pilih Lansia --</option>
                      {lansiaList.map((l) => (
                        <option key={l.id} value={l.id}>{l.nama} (NIK: {l.nik})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="tanggalPemeriksaan">Tanggal Pemeriksaan <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      id="tanggalPemeriksaan"
                      type="date"
                      className="form-input"
                      value={tanggalPemeriksaan}
                      onChange={(e) => setTanggalPemeriksaan(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="tekananDarah">Tekanan Darah (Sistolik, mmHg) <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      id="tekananDarah"
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="Contoh: 120"
                      value={tekananDarah}
                      onChange={(e) => setTekananDarah(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="beratBadan">Berat Badan (kg)</label>
                    <input
                      id="beratBadan"
                      type="number"
                      min="0"
                      step="0.1"
                      className="form-input"
                      placeholder="Contoh: 62.5"
                      value={beratBadan}
                      onChange={(e) => setBeratBadan(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="tinggiBadan">Tinggi Badan (cm)</label>
                    <input
                      id="tinggiBadan"
                      type="number"
                      min="0"
                      step="0.1"
                      className="form-input"
                      placeholder="Contoh: 160"
                      value={tinggiBadan}
                      onChange={(e) => setTinggiBadan(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gulaDarah">Gula Darah (mg/dL)</label>
                    <input
                      id="gulaDarah"
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="Contoh: 110"
                      value={gulaDarah}
                      onChange={(e) => setGulaDarah(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="kolesterol">Kolesterol (mg/dL)</label>
                    <input
                      id="kolesterol"
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="Contoh: 180"
                      value={kolesterol}
                      onChange={(e) => setKolesterol(e.target.value)}
                    />
                  </div>

                  {/* Calculated status visualization display */}
                  <div className="form-group full-width" style={{
                    backgroundColor: 'var(--bg)',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px'
                  }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                        Status Risiko Terkalkulasi:
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-light)' }}>
                        Dihitung otomatis berdasarkan data tensi, gula darah, dan kolesterol.
                      </p>
                    </div>
                    <span className={`status-badge ${liveStatus}`} style={{ fontSize: '13px', padding: '6px 12px' }}>
                      {liveStatus}
                    </span>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="catatan">Catatan / Keterangan</label>
                    <textarea
                      id="catatan"
                      className="form-input"
                      placeholder="Tambahkan catatan tambahan..."
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      rows={2}
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary" style={{ width: 'auto' }} disabled={submitLoading}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={submitLoading}>
                  {submitLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
