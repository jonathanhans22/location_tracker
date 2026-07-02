import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import TrackerPanel from './TrackerPanel';
import DashboardPanel from './DashboardPanel';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('menu');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginDenganGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setViewMode('menu');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f7' }}>
        <p style={{ color: '#86868b' }}>Memuat aplikasi...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f7' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center', maxWidth: '360px', width: '100%' }}>
          <h2 style={{ marginBottom: '8px', color: '#1d1d1f' }}>Sistem Logistik</h2>
          <p style={{ color: '#86868b', fontSize: '14px', marginBottom: '24px' }}>Masuk untuk melacak atau membagikan lokasi</p>
          <button 
            onClick={loginDenganGoogle}
            style={{ width: '100%', padding: '14px', backgroundColor: '#0071e3', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
            Masuk dengan Google
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = session.user.email === 'jonathanhans.2205@gmail.com';

  // Jika bukan admin, paksa masuk ke mode driveras
  //asdasd
  if (!isAdmin && viewMode === 'menu') {
    setViewMode('driver');
  }

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f7', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#86868b', display: 'block' }}>Akun Aktif</span>
          <strong style={{ color: '#1d1d1f', fontSize: '15px' }}>{session.user.email} {isAdmin ? '(Admin)' : '(Driver)'}</strong>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAdmin && viewMode !== 'menu' && (
            <button onClick={() => setViewMode('menu')} style={{ padding: '10px 20px', backgroundColor: '#f0f0f5', color: '#1d1d1f', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Kembali
            </button>
          )}
          <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#ff453a', border: '1px solid #ff453a', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            Keluar
          </button>
        </div>
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        {isAdmin && viewMode === 'menu' && (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <h2 style={{ marginBottom: '30px' }}>Pilih Menu Akses</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button 
                onClick={() => setViewMode('admin')}
                style={{ padding: '20px 40px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#0071e3', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                Buka Layar Monitor
              </button>
              <button 
                onClick={() => setViewMode('driver')}
                style={{ padding: '20px 40px', fontSize: '16px', fontWeight: 'bold', backgroundColor: '#34c759', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                Mode Simulasi Driver
              </button>
            </div>
          </div>
        )}

        {viewMode === 'admin' && <DashboardPanel />}
        {viewMode === 'driver' && <TrackerPanel userEmail={session.user.email} />}
      </main>
    </div>
  );
}