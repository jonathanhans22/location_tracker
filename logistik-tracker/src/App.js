import { useEffect, useState } from 'react';
import DashboardPanel from './DashboardPanel';
import TrackerPanel from './TrackerPanel';

export default function App() {
  const [username, setUsername] = useState(localStorage.getItem('logistic_username') || null);
  const [inputName, setInputName] = useState('');
  const [viewMode, setViewMode] = useState('menu');

  const adminUsername = process.env.REACT_APP_ADMIN_USERNAME || 'admin';

  useEffect(() => {
    if (username) {
      const isAdmin = username === adminUsername;
      if (!isAdmin && viewMode === 'menu') {
        setViewMode('driver');
      }
    }
  }, [username, viewMode, adminUsername]);

  const loginDenganUsername = (e) => {
    e.preventDefault();
    if (inputName.trim() !== '') {
      setUsername(inputName.trim());
      localStorage.setItem('logistic_username', inputName.trim());
    }
  };

  const logout = () => {
    setUsername(null);
    localStorage.removeItem('logistic_username');
    setViewMode('menu');
    setInputName('');
  };

  if (!username) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f7' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center', maxWidth: '360px', width: '100%' }}>
          <h2 style={{ marginBottom: '8px', color: '#1d1d1f' }}>Sistem Logistik</h2>
          <p style={{ color: '#86868b', fontSize: '14px', marginBottom: '24px' }}>Masukkan nama pengemudi untuk memulai</p>
          
          <form onSubmit={loginDenganUsername}>
            <input 
              type="text" 
              placeholder="Ketik nama Anda di sini..." 
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              style={{ width: '90%', padding: '14px', marginBottom: '16px', borderRadius: '10px', border: '1px solid #d2d2d7', fontSize: '16px' }}
              required
            />
            <button 
              type="submit"
              style={{ width: '100%', padding: '14px', backgroundColor: '#0071e3', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold' }}>
              Masuk ke Sistem
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isAdmin = username === adminUsername;

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f7', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
        <div>
          <span style={{ fontSize: '12px', color: '#86868b', display: 'block' }}>Pengguna Aktif</span>
          <strong style={{ color: '#1d1d1f', fontSize: '15px' }}>{username} {isAdmin ? '(Admin)' : '(Driver)'}</strong>
        </div>
        <button onClick={logout} style={{ padding: '10px 20px', backgroundColor: '#fff', color: '#ff453a', border: '1px solid #ff453a', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Keluar
        </button>
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
        {viewMode === 'driver' && <TrackerPanel username={username} />}
      </main>
    </div>
  );
}