import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabase';
import type { Profile } from './types';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LansiaList from './pages/LansiaList';
import LansiaDetail from './pages/LansiaDetail';
import Pemeriksaan from './pages/Pemeriksaan';

function ProtectedLayout({
  profile,
  loading,
  onLogout
}: {
  profile: Profile | null;
  loading: boolean;
  onLogout: () => void;
}) {

  if (loading) {
    return (
      <div className="auth-container">
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace />;
  }

  return <Layout profile={profile} onLogout={onLogout} />;
}

function AppContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let authListenerSubscription: any = null;

    async function initSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error("Session initialization failed:", err);
        setProfile(null);
        setLoading(false);
      }
    }

    async function fetchProfile(userId: string) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (data) {
          setProfile(data as Profile);
        } else {
          // Profile not found in table, reject and signout
          setProfile(null);
          await supabase.auth.signOut();
          navigate('/unauthorized');
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);
        setProfile(null);
        await supabase.auth.signOut();
        navigate('/unauthorized');
      } finally {
        setLoading(false);
      }
    }

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setLoading(true);
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setLoading(false);
        navigate('/login');
      }
    });

    authListenerSubscription = subscription;

    return () => {
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, [navigate]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
  };

  if (loading && !profile) {
    return (
      <div className="auth-container">
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        element={
          <ProtectedLayout
            profile={profile}
            loading={loading}
            onLogout={handleLogout}
          />
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/lansia" element={<LansiaList />} />
        <Route path="/lansia/:id" element={<LansiaDetail />} />
        <Route path="/pemeriksaan" element={<Pemeriksaan />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}