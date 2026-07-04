import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { supabase } from './supabaseClient';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function DashboardPanel() {
  const [drivers, setDrivers] = useState({});
  const [profiles, setProfiles] = useState({});
  const [mapCenter, setMapCenter] = useState([-6.1754, 106.8272]);
  
  const [editingDriver, setEditingDriver] = useState(null);
  const [newDisplayName, setNewDisplayName] = useState('');

  const ambilSemuaData = async () => {
    const { data: dataProfil } = await supabase
      .from('driver_profiles')
      .select('*');
    
    const pemetaanProfil = {};
    if (dataProfil) {
      dataProfil.forEach(p => {
        pemetaanProfil[p.username] = p.display_name;
      });
      setProfiles(pemetaanProfil);
    }

    const { data: dataLokasi, error } = await supabase
      .from('delivery_tracking')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Gagal mengambil data lokasi:', error);
    } else if (dataLokasi && dataLokasi.length > 0) {
      const posisiTerbaru = {};
      
      dataLokasi.forEach(baris => {
        if (!posisiTerbaru[baris.driver_name]) {
          posisiTerbaru[baris.driver_name] = {
            lat: baris.latitude,
            lng: baris.longitude,
            waktu: baris.recorded_at
          };
        }
      });
      
      setDrivers(posisiTerbaru);
      
      const driverPertama = Object.values(posisiTerbaru)[0];
      if (driverPertama) {
        setMapCenter([driverPertama.lat, driverPertama.lng]);
      }
    }
  };

  useEffect(() => {
    ambilSemuaData();

    const saluranRealtime = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'delivery_tracking' },
        (payload) => {
          const dataBaru = payload.new;
          setDrivers(dataLama => ({
            ...dataLama,
            [dataBaru.driver_name]: {
              lat: dataBaru.latitude,
              lng: dataBaru.longitude,
              waktu: dataBaru.recorded_at
            }
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(saluranRealtime);
    };
  }, []);

  const bukaModalEdit = (username) => {
    setEditingDriver(username);
    setNewDisplayName(profiles[username] || username);
  };

  const simpanPerubahanNama = async (e) => {
    e.preventDefault();
    if (!newDisplayName.trim()) return;

    const { error } = await supabase
      .from('driver_profiles')
      .upsert({ 
        username: editingDriver, 
        display_name: newDisplayName.trim(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Gagal menyimpan profil:', error);
    } else {
      setProfiles(dataLama => ({
        ...dataLama,
        [editingDriver]: newDisplayName.trim()
      }));
      setEditingDriver(null);
      setNewDisplayName('');
    }
  };

  const dapatkanNamaTampilan = (username) => {
    return profiles[username] || username;
  };

  const daftarUsernameDriver = Object.keys(drivers);

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
      <header style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 4px 0', color: '#1d1d1f' }}>Live Monitor Logistik</h2>
        <p style={{ margin: 0, color: '#86868b', fontSize: '14px' }}>Memantau pergerakan armada pengiriman barang</p>
      </header>

      <div style={{ display: 'flex', gap: '20px', flexDirection: 'row', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1 1 500px', height: '450px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #d2d2d7' }}>
          <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {Object.entries(drivers).map(([username, data]) => (
              <Marker key={username} position={[data.lat, data.lng]}>
                <Popup>
                  <strong style={{ display: 'block', marginBottom: '2px', fontSize: '14px' }}>
                    {dapatkanNamaTampilan(username)}
                  </strong>
                  <span style={{ fontSize: '11px', color: '#86868b', display: 'block', marginBottom: '6px' }}>
                    ID Sistem: {username}
                  </span>
                  <span style={{ fontSize: '12px', color: '#1d1d1f' }}>
                    Aktif: {new Date(data.waktu).toLocaleTimeString()}
                  </span>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div style={{ width: '260px', backgroundColor: '#f5f5f7', padding: '16px', borderRadius: '12px', maxHeight: '450px', overflowY: 'auto' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1d1d1f' }}>Kelola Pengemudi</h3>
          {daftarUsernameDriver.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#86868b' }}>Belum ada driver aktif</p>
          ) : (
            daftarUsernameDriver.map(username => (
              <div key={username} style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <span style={{ fontWeight: 'bold', display: 'block', fontSize: '14px', color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dapatkanNamaTampilan(username)}
                </span>
                <span style={{ fontSize: '11px', color: '#86868b', display: 'block', marginBottom: '8px' }}>
                  ID: {username}
                </span>
                <button 
                  onClick={() => bukaModalEdit(username)}
                  style={{ width: '100%', padding: '6px', backgroundColor: '#0071e3', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
                  Ubah Nama
                </button>
              </div>
            ))
          )}
        </div>

      </div>

      {editingDriver && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '16px', maxWidth: '320px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Ubah Nama Tampilan</h3>
            <p style={{ color: '#86868b', fontSize: '13px', marginBottom: '16px' }}>Mengubah nama visual untuk ID pengemudi: {editingDriver}</p>
            
            <form onSubmit={simpanPerubahanNama}>
              <input 
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                style={{ width: '92%', padding: '10px', borderRadius: '8px', border: '1px solid #d2d2d7', marginBottom: '20px', fontSize: '14px' }}
                required
                autoFocus
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingDriver(null)}
                  style={{ padding: '10px 16px', backgroundColor: '#e8e8ed', color: '#1d1d1f', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  Batal
                </button>
                <button 
                  type="submit"
                  style={{ padding: '10px 16px', backgroundColor: '#0071e3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}