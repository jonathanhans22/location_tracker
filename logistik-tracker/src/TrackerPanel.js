import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function TrackerPanel({ userEmail }) {
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState('Offline');
  const [watchId, setWatchId] = useState(null);

  const toggleTracking = () => {
    if (isTracking) {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
      setWatchId(null);
      setStatus('Offline');
    } else {
      if (!navigator.geolocation) {
        setStatus('Error Browser tidak mendukung GPS');
        return;
      }

      setStatus('Mencari sinyal GPS...');
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setStatus(`Update terakhir Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`);

          // Kirim data langsung ke Supabase
          const { error } = await supabase
            .from('delivery_tracking')
            .insert([
              { driver_email: userEmail, latitude: lat, longitude: lng }
            ]);

          if (error) console.error("Gagal menyimpan lokasi:", error);
        },
        (error) => {
          setStatus(`Error GPS ${error.message}`);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      );

      setWatchId(id);
      setIsTracking(true);
    }
  };

  return (
    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ marginTop: 0 }}>Terminal Pengemudi</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>Tekan tombol di bawah saat memulai perjalanan logistik.</p>
      
      <button 
        onClick={toggleTracking}
        style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', backgroundColor: isTracking ? '#ff453a' : '#34c759', transition: 'background 0.3s' }}>
        {isTracking ? 'Hentikan Berbagi Lokasi' : 'Mulai Berbagi Lokasi'}
      </button>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f5', borderRadius: '8px', fontSize: '14px', fontWeight: '500' }}>
        Status: {status}
      </div>
    </div>
  );
}