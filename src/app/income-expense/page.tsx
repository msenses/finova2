'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function IncomeExpensePage() {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [accNo, setAccNo] = useState('');
  const [desc, setDesc] = useState('');
  const [openReports, setOpenReports] = useState(false);

  return (
    <main style={{ minHeight: '100dvh', background: 'linear-gradient(135deg,#0b2161,#0e3aa3)', color: 'white' }}>
      {/* Üst araç çubuğu */}
      <header style={{ display: 'flex', gap: 8, padding: 16 }}>
        <button onClick={() => setShowNew(true)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #22c55e', background: '#22c55e', color: '#fff', cursor: 'pointer' }}>+ Ekle</button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setOpenReports((v) => !v)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>Raporlar ▾</button>
          {openReports && (
            <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, minWidth: 240, background: '#ffffff', color: '#111827', borderRadius: 8, boxShadow: '0 14px 35px rgba(0,0,0,0.35)', zIndex: 20 }}>
              <button onClick={() => { setOpenReports(false); router.push('/income-expense/reports/balance'); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Gelir Gider Bakiye Raporu</button>
              <button onClick={() => { setOpenReports(false); router.push('/income-expense/reports/detail'); }} style={{ width: '100%', textAlign: 'left', padding: '10px 12px', border: 'none', background: 'transparent', cursor: 'pointer' }}>🗂 Gelir Gider Detaylı Raporu</button>
            </div>
          )}
        </div>
      </header>

      <section style={{ padding: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
          {/* Başlık şeridi */}
          <div style={{ background: '#12b3c5', color: 'white', padding: '12px 16px', fontWeight: 700, letterSpacing: 0.2 }}>GELİR GİDER LİSTESİ</div>

          {/* Tablo */}
          <div style={{ padding: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'white', opacity: 0.9 }}>
                  <th style={{ padding: '10px 8px' }}>İşlem</th>
                  <th style={{ padding: '10px 8px' }}>Ad</th>
                  <th style={{ padding: '10px 8px' }}>Kod</th>
                  <th style={{ padding: '10px 8px' }}>Açıklama</th>
                  <th style={{ padding: '10px 8px' }}>No</th>
                  <th style={{ padding: '10px 8px' }}>Şube</th>
                  <th style={{ padding: '10px 8px' }}>Düzenle/Sil</th>
                </tr>
              </thead>
              <tbody>
                {/* Örnek satır (statik) */}
                <tr style={{ color: 'white' }}>
                  <td style={{ padding: '8px' }}>
                    <button onClick={() => router.push('/income-expense/electricity')} style={{ padding: '6px 10px', borderRadius: 999, border: '1px solid #16a34a', background: '#16a34a', color: 'white', cursor: 'pointer' }}>➕ Detaya Git</button>
                  </td>
                  <td style={{ padding: '8px' }}>Elektrik</td>
                  <td style={{ padding: '8px' }}>0001</td>
                  <td style={{ padding: '8px' }}>Deneme</td>
                  <td style={{ padding: '8px' }}>123456789</td>
                  <td style={{ padding: '8px' }}>Merkez</td>
                  <td style={{ padding: '8px' }}>
                    <button title="Düzenle" style={{ padding: 6, marginRight: 6, borderRadius: 6, border: '1px solid #f59e0b', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>✏️</button>
                    <button title="Sil" style={{ padding: 6, borderRadius: 6, border: '1px solid #ef4444', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>✖</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Yeni Gelir/Gider Modal */}
      {showNew && (
        <div onClick={() => setShowNew(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'grid', placeItems: 'center', zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '95%', borderRadius: 10, background: '#fff', color: '#111827', boxShadow: '0 20px 50px rgba(0,0,0,0.35)', border: '1px solid #e5e7eb' }}>
            <div style={{ padding: 12, borderBottom: '1px solid #e5e7eb', fontWeight: 700 }}>Yeni Gelir / Gider Ekle</div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Ad:</span>
                <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Kodu:</span>
                <input value={code} onChange={(e) => setCode(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Abone/Hesap No:</span>
                <input value={accNo} onChange={(e) => setAccNo(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>Açıklama:</span>
                <input value={desc} onChange={(e) => setDesc(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
              </label>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setShowNew(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>Kapat</button>
              <button onClick={() => setShowNew(false)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #2563eb', background: '#2563eb', color: '#fff' }}>Ekle</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


