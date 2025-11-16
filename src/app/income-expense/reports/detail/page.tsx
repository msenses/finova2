'use client';
export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function IncomeExpenseAdvancedReportPage() {
  const router = useRouter();
  const [allTime, setAllTime] = useState(true);
  const [start, setStart] = useState('2022-11-14');
  const [end, setEnd] = useState('2022-11-14');
  const [payFilter, setPayFilter] = useState<'Hepsi' | 'Nakit' | 'Havale' | 'Kredi Kartı'>('Hepsi');
  const [opFilter, setOpFilter] = useState<'Hepsi' | 'Giriş' | 'Çıkış'>('Hepsi');

  return (
    <main style={{ minHeight: '100dvh', background: '#e9eef6', color: '#111827' }}>
      <section style={{ padding: 16, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ padding: 16, borderRadius: 10, background: '#fff', border: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Gelir Gider Detaylı Rapor</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottom: '1px solid #e5e7eb', marginBottom: 12 }}>
            <input id="all" type="checkbox" checked={allTime} onChange={(e) => setAllTime(e.target.checked)} />
            <label htmlFor="all">Tüm Zamanlar</label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Başlangıç Tarihi</span>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Bitiş Tarihi</span>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Ödeme Türü Seçiniz</span>
              <select value={payFilter} onChange={(e) => setPayFilter(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option>Hepsi</option>
                <option>Nakit</option>
                <option>Havale</option>
                <option>Kredi Kartı</option>
              </select>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Listelemek istediğiniz işlem</span>
              <select value={opFilter} onChange={(e) => setOpFilter(e.target.value as any)} style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid #d1d5db' }}>
                <option>Hepsi</option>
                <option>Giriş</option>
                <option>Çıkış</option>
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button onClick={() => router.push('/income-expense/reports/detail/view')} style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff', cursor: 'pointer' }}>🧾 Gelir Gider Detaylı Rapor</button>
          </div>
        </div>
      </section>
    </main>
  );
}


