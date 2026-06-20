import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, check session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setLoading(true);
        // Check profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          navigate('/');
        } else {
          // No profile, sign out and go to unauthorized
          await supabase.auth.signOut();
          navigate('/unauthorized');
        }
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Query the profiles table for this user
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(`Gagal memuat profil: ${profileError.message}`);
        }

        if (profile) {
          // Profile exists, redirect to dashboard
          navigate('/');
        } else {
          // Profile does not exist, sign out of auth and go to unauthorized page
          await supabase.auth.signOut();
          navigate('/unauthorized');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Panel: Form */}
      <div className="auth-form-panel">
        <div className="auth-form-content">
          <div className="auth-header">
            <img src="/logo.png" alt="Logo TEMU" className="auth-logo-img" />
            <h1 className="auth-logo">TEMU</h1>
            <p className="auth-tagline">Tetap Dekat Meski Berjauhan</p>
          </div>

          <h2 className="auth-title">Masuk ke Akun Anda</h2>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Kata Sandi</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Memproses...</span>
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Panel: Image Display */}
      <div className="auth-image-panel">
        <div className="auth-image-overlay">
          <h2 className="auth-image-title">Tetap Dekat Meski Berjauhan</h2>
          <p className="auth-image-desc">
            Platform digital Posyandu Lansia untuk memantau perkembangan kesehatan orang tua tercinta secara real-time dan terintegrasi.
          </p>
        </div>
      </div>
    </div>
  );
}
