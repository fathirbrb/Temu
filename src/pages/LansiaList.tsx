import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lansiaService } from '../services/lansia.service';
import type { Lansia } from '../types';

export default function LansiaList() {
  const [lansiaList, setLansiaList] = useState<Lansia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search filter states
  const [searchNama, setSearchNama] = useState('');
  const [searchNik, setSearchNik] = useState('');

  // Modal form states
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingLansiaId, setEditingLansiaId] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Fields
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [alamat, setAlamat] = useState('');
  const [noHp, setNoHp] = useState('');
  const [namaKeluarga, setNamaKeluarga] = useState('');
  const [noHpKeluarga, setNoHpKeluarga] = useState('');

  const loadLansia = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await lansiaService.getAllLansia();
      setLansiaList(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Gagal memuat data lansia.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLansia();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingLansiaId(null);
    setSubmitError(null);
    // Reset fields
    setNik('');
    setNama('');
    setTanggalLahir('');
    setJenisKelamin('L');
    setAlamat('');
    setNoHp('');
    setNamaKeluarga('');
    setNoHpKeluarga('');
    setIsOpenModal(true);
  };

  const openEditModal = (lansia: Lansia) => {
    setModalMode('edit');
    setEditingLansiaId(lansia.id);
    setSubmitError(null);
    // Fill fields
    setNik(lansia.nik || '');
    setNama(lansia.nama || '');
    setTanggalLahir(lansia.tanggal_lahir || '');
    setJenisKelamin(lansia.jenis_kelamin || 'L');
    setAlamat(lansia.alamat || '');
    setNoHp(lansia.no_hp || '');
    setNamaKeluarga(lansia.nama_keluarga || '');
    setNoHpKeluarga(lansia.no_hp_keluarga || '');
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
    if (!nik.trim()) {
      setSubmitError('NIK wajib diisi.');
      return;
    }
    if (!nama.trim()) {
      setSubmitError('Nama wajib diisi.');
      return;
    }

    setSubmitLoading(true);
    const payload = {
      nik: nik.trim(),
      nama: nama.trim(),
      tanggal_lahir: tanggalLahir || new Date().toISOString().split('T')[0],
      jenis_kelamin: jenisKelamin,
      alamat: alamat.trim(),
      no_hp: noHp.trim() || null,
      nama_keluarga: namaKeluarga.trim() || null,
      no_hp_keluarga: noHpKeluarga.trim() || null,
    };

    try {
      if (modalMode === 'create') {
        await lansiaService.createLansia(payload);
      } else if (modalMode === 'edit' && editingLansiaId) {
        await lansiaService.updateLansia(editingLansiaId, payload);
      }
      // Reload & close
      await loadLansia();
      closeModal();
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || 'Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data lansia "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await lansiaService.deleteLansia(id);
        await loadLansia();
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Gagal menghapus data.');
      }
    }
  };

  // Filter list
  const filteredLansia = lansiaList.filter((l) => {
    const matchNama = l.nama.toLowerCase().includes(searchNama.toLowerCase());
    const matchNik = l.nik.toLowerCase().includes(searchNik.toLowerCase());
    return matchNama && matchNik;
  });

  return (
    <div>
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="dashboard-title">Data Lansia</h1>
          <p className="dashboard-subtitle">Kelola informasi biodata lansia Posyandu</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary" style={{ width: 'auto' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah Lansia
        </button>
      </div>

      {/* Action bar for Search filters */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div className="search-wrapper" style={{ maxWidth: '100%' }}>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label" htmlFor="searchNama" style={{ fontSize: '12px', marginBottom: '4px' }}>Cari Nama</label>
            <input
              id="searchNama"
              type="text"
              className="search-input"
              placeholder="Masukkan nama..."
              value={searchNama}
              onChange={(e) => setSearchNama(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '140px' }}>
            <label className="form-label" htmlFor="searchNik" style={{ fontSize: '12px', marginBottom: '4px' }}>Cari NIK</label>
            <input
              id="searchNik"
              type="text"
              className="search-input"
              placeholder="Masukkan NIK..."
              value={searchNik}
              onChange={(e) => setSearchNik(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* States content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '12px' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)', borderWidth: '3px' }} />
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Memuat data lansia...</p>
        </div>
      ) : error ? (
        <div className="card" style={{ borderLeft: '4px solid var(--error)', padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--error)' }}>Gagal Memuat Data</h3>
          <p style={{ color: 'var(--text-light)', margin: '0 0 16px 0', fontSize: '14px' }}>{error}</p>
          <button onClick={loadLansia} className="btn btn-primary" style={{ width: 'auto' }}>Coba Lagi</button>
        </div>
      ) : filteredLansia.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <h3 className="empty-state-title">Data Lansia Tidak Ditemukan</h3>
            <p className="empty-state-desc">
              {lansiaList.length === 0
                ? 'Belum ada data lansia terdaftar. Silakan klik tombol "Tambah Lansia" di atas untuk memulai.'
                : 'Tidak ada hasil pencarian yang cocok dengan filter Nama atau NIK.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="pemeriksaan-table">
              <thead>
                <tr>
                  <th>NIK</th>
                  <th>Nama</th>
                  <th>Jenis Kelamin</th>
                  <th>No. HP</th>
                  <th>Alamat</th>
                  <th>Nama Keluarga</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredLansia.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text)' }}>{l.nik}</td>
                    <td>
                      <Link to={`/lansia/${l.id}`} style={{ fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>
                        {l.nama}
                      </Link>
                    </td>
                    <td>{l.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td>{l.no_hp || '-'}</td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.alamat || '-'}</td>
                    <td>{l.nama_keluarga || '-'}</td>
                    <td>
                      <div className="actions-cell">
                        <Link to={`/lansia/${l.id}`} className="btn btn-outline btn-small" title="Detail">
                          Detail
                        </Link>
                        <button onClick={() => openEditModal(l)} className="btn btn-outline btn-small" style={{ color: 'var(--primary)' }} title="Edit">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(l.id, l.nama)} className="btn btn-outline btn-small" style={{ color: 'var(--error)' }} title="Hapus">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Simple Modal Form */}
      {isOpenModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{modalMode === 'create' ? 'Tambah Data Lansia Baru' : 'Ubah Data Lansia'}</h2>
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
                  <div className="form-group">
                    <label className="form-label" htmlFor="nik">NIK <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      id="nik"
                      type="text"
                      className="form-input"
                      placeholder="Masukkan 16 digit NIK..."
                      value={nik}
                      onChange={(e) => setNik(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="nama">Nama Lengkap <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      id="nama"
                      type="text"
                      className="form-input"
                      placeholder="Masukkan nama lengkap..."
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="tanggalLahir">Tanggal Lahir</label>
                    <input
                      id="tanggalLahir"
                      type="date"
                      className="form-input"
                      value={tanggalLahir}
                      onChange={(e) => setTanggalLahir(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="jenisKelamin">Jenis Kelamin</label>
                    <select
                      id="jenisKelamin"
                      className="form-input"
                      value={jenisKelamin}
                      onChange={(e) => setJenisKelamin(e.target.value as 'L' | 'P')}
                      style={{ height: '46px' }}
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="alamat">Alamat Lengkap</label>
                    <textarea
                      id="alamat"
                      className="form-input"
                      placeholder="Masukkan alamat tinggal..."
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      rows={2}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="noHp">No. HP Lansia</label>
                    <input
                      id="noHp"
                      type="tel"
                      className="form-input"
                      placeholder="Contoh: 08123456789"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="namaKeluarga">Nama Hubungan Keluarga</label>
                    <input
                      id="namaKeluarga"
                      type="text"
                      className="form-input"
                      placeholder="Nama anak/istri/suami..."
                      value={namaKeluarga}
                      onChange={(e) => setNamaKeluarga(e.target.value)}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label" htmlFor="noHpKeluarga">No. HP Hubungan Keluarga</label>
                    <input
                      id="noHpKeluarga"
                      type="tel"
                      className="form-input"
                      placeholder="No. HP keluarga terdekat..."
                      value={noHpKeluarga}
                      onChange={(e) => setNoHpKeluarga(e.target.value)}
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
