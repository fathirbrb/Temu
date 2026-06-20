import { useState, useEffect } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import type { Profile } from '../types';

interface LayoutProps {
  profile: Profile;
  onLogout: () => void;
}

export default function Layout({ profile, onLogout }: LayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings inputs
  const [nameInput, setNameInput] = useState(profile.nama);
  const [phoneInput, setPhoneInput] = useState(profile.no_hp || '');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const closeDropdown = () => setIsDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [isDropdownOpen]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nama: nameInput,
          no_hp: phoneInput || null
        })
        .eq('id', profile.id);

      if (error) throw error;

      setSettingsSuccess(true);
      setTimeout(() => {
        setIsSettingsOpen(false);
        window.location.reload(); // Refresh session/state
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setSettingsError(err.message || 'Gagal memperbarui profil. Silakan coba lagi.');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
        <Link to="/" className="header-brand" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="Logo TEMU" className="header-logo-img" />
          <span className="logo-text">TEMU</span>
        </Link>

        {/* Top Navigation Menu (Desktop) */}
        <nav className="header-nav-menu">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/lansia"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Data Lansia
          </NavLink>

          <NavLink
            to="/pemeriksaan"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Pemeriksaan
          </NavLink>
        </nav>

        {/* User Profile Dropdown Widget */}
        <div className="user-profile-dropdown-container">
          <button 
            onClick={toggleDropdown} 
            className="profile-trigger-btn"
            aria-label="Menu Pengguna"
          >
            <div className="avatar-circle">
              {profile.nama.charAt(0).toUpperCase()}
            </div>
            <span className="profile-trigger-name">{profile.nama}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`chevron-icon ${isDropdownOpen ? 'open' : ''}`}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="profile-dropdown-menu" onClick={e => e.stopPropagation()}>
              <div className="dropdown-user-info">
                <div className="avatar-circle large">
                  {profile.nama.charAt(0).toUpperCase()}
                </div>
                <h4 className="dropdown-user-name">{profile.nama}</h4>
                <span className="user-role-badge" data-role={profile.role}>
                  {profile.role.replace('_', ' ')}
                </span>
                {profile.no_hp && <span className="dropdown-user-phone">{profile.no_hp}</span>}
              </div>
              
              <div className="dropdown-divider"></div>
              
              <button onClick={() => { setIsSettingsOpen(true); setIsDropdownOpen(false); }} className="dropdown-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Pengaturan Akun
              </button>
              
              <button onClick={onLogout} className="dropdown-item logout">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Keluar
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="layout-body">
        {/* Content Panel */}
        <main className="main-content">
          <div className="content-container">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="bottom-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          end
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" />
            <rect x="14" y="3" width="7" height="5" />
            <rect x="14" y="12" width="7" height="9" />
            <rect x="3" y="16" width="7" height="5" />
          </svg>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/lansia"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Lansia</span>
        </NavLink>

        <NavLink
          to="/pemeriksaan"
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Periksa</span>
        </NavLink>
      </nav>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Pengaturan Akun</h3>
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="modal-close-btn"
                aria-label="Tutup"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {settingsError && <div className="alert-error">{settingsError}</div>}
                {settingsSuccess && <div className="alert-success" style={{
                  backgroundColor: 'var(--success-bg)',
                  border: '1px solid rgba(62, 155, 110, 0.2)',
                  color: 'var(--success)',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 500
                }}>Profil berhasil diperbarui!</div>}
                
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-name">Nama Lengkap</label>
                  <input
                    id="settings-name"
                    type="text"
                    className="form-input"
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    required
                    disabled={settingsLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-phone">Nomor HP</label>
                  <input
                    id="settings-phone"
                    type="tel"
                    className="form-input"
                    placeholder="Contoh: 081234567890"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    disabled={settingsLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Peran Pengguna (Role)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={profile.role.replace('_', ' ').toUpperCase()}
                    disabled
                    style={{ backgroundColor: '#f1f3f2', cursor: 'not-allowed' }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                    Peran pengguna hanya dapat diubah oleh administrator sistem.
                  </span>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsSettingsOpen(false)} 
                  className="btn btn-outline"
                  style={{ width: 'auto' }}
                  disabled={settingsLoading}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ width: 'auto' }}
                  disabled={settingsLoading}
                >
                  {settingsLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
