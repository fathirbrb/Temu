import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function Unauthorized() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-header">
          <h1 className="auth-logo">TEMU</h1>
          <p className="auth-tagline">Tetap Dekat Meski Berjauhan</p>
        </div>

        <div style={{ margin: '24px 0', color: 'var(--error)' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginBottom: '16px' }}
          >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
          <h2 style={{ color: 'var(--text)', margin: '0 0 8px 0', fontSize: '20px' }}>Akses Ditolak</h2>
        </div>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-light)',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          Akun Anda berhasil diautentikasi, namun tidak terdaftar di sistem platform <strong>TEMU</strong>.
          Silakan hubungi administrator Posyandu untuk mendaftarkan akun Anda ke dalam tabel profil.
        </p>

        <button
          onClick={handleSignOut}
          className="btn btn-outline"
          style={{ width: '100%' }}
        >
          Kembali ke Halaman Masuk
        </button>
      </div>
    </div>
  );
}
