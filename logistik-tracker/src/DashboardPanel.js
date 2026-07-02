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
  // Objek untuk menyimpan banyak data pengemudi sekaligus
  const [drivers, setDrivers] = useState({});
  const [mapCenter, setMapCenter] = useState([-6.1754, 106.8272]);

  useEffect(() => {
    const ambilSemuaLokasiTerakhir = async () => {
      // Mengambil 50 data pelacakan terbaru dari database
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Gagal mengambil data:', error);
      } else if (data && data.length > 0) {
        const posisiTerbaru = {};
        
        // Menyaring agar hanya mengambil 1 posisi paling baru untuk setiap email
        data.forEach(baris => {
          if (!posisiTerbaru[baris.driver_email]) {
            posisiTerbaru[baris.driver_email] = {
              lat: baris.latitude,
              lng: baris.longitude,
              waktu: baris.recorded_at
            };
          }
        });
        
        setDrivers(posisiTerbaru);
        
        // Pusatkan peta pada pengemudi pertama yang ditemukan
        const driverPertama = Object.values(posisiTerbaru)[0];
        if (driverPertama) {
          setMapCenter([driverPertama.lat, driverPertama.lng]);
        }
      }
    };

    ambilSemuaLokasiTerakhir();

    const saluranRealtime = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'delivery_tracking' },
        (payload) => {
          const dataBaru = payload.new;
          
          // Memperbarui hanya data pengemudi yang bergerak, yang lain tetap aman
          setDrivers(dataLama => ({
            ...dataLama,
            [dataBaru.driver_email]: {
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

  // Menghitung total pengemudi yang terdeteksi
  const jumlahPengemudi = Object.keys(drivers).length;

  return (
    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <header style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 8px 0' }}>Live Monitor Logistik</h2>
        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
          Jumlah Pengemudi Terdeteksi: <strong>{jumlahPengemudi}</strong> Armada
        </p>
      </header>

      <div style={{ height: '450px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Mencetak pin penanda untuk setiap pengemudi yang ada di dalam database */}
          {Object.entries(drivers).map(([email, data]) => (
            <Marker key={email} position={[data.lat, data.lng]}>
              <Popup>
                <strong style={{ display: 'block', marginBottom: '4px' }}>Identitas: {email}</strong>
                <span style={{ fontSize: '12px', color: '#666' }}>
                  Update: {new Date(data.waktu).toLocaleTimeString()}
                </span>
              </Popup>
            </Marker>
          ))}
          
        </MapContainer>
      </div>
    </div>
  );
}