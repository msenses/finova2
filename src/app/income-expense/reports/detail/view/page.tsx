'use client';
export const dynamic = 'force-dynamic';

export default function IncomeExpenseDetailedReportViewPage() {
  return (
    <main style={{ minHeight: '100dvh', background: '#fff' }}>
      <div style={{ padding: 8, borderBottom: '1px solid #e5e7eb', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #0ea5e9', background: '#0ea5e9', color: '#fff' }}>✉ Email Gönder</button>
        <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🖨</button>
        <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>🗋</button>
        <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff' }}>↻</button>
        <input placeholder="" style={{ marginLeft: 8, padding: '6px 8px', borderRadius: 6, border: '1px solid #d1d5db', flex: '0 0 260px' }} />
      </div>
      <section style={{ padding: 16 }}>
        <h2 style={{ textAlign: 'center', margin: '18px 0' }}>GELİR GİDER RAPORU</h2>
        <div style={{ maxWidth: 800, margin: '0 auto', border: '1px solid #cbd5e1' }}>
          <div style={{ padding: 8, background: '#334155', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tarih Aralığı: 01.11.2022 - 14.11.2022</span>
              <span>Abone No: 123456789</span>
            </div>
            <div>Elektrik</div>
            <div>Deneme</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: 8 }}>Tarih</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Evrak No</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Açıklama</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Ödeme Durumu</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Ödeme Şekli</th>
                <th style={{ textAlign: 'left', padding: 8 }}>Tip</th>
                <th style={{ textAlign: 'right', padding: 8 }}>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {[
                { tarih: '03.11.2022', evrak: '', ack: '', durum: 'Ödendi', sekil: 'Nakit', tip: 'ÇIKIŞ', tutar: 52000 },
                { tarih: '14.11.2022', evrak: '', ack: '', durum: 'Ödendi', sekil: 'Nakit', tip: 'GİRİŞ', tutar: 100 },
                { tarih: '14.11.2022', evrak: '', ack: '', durum: 'Ödendi', sekil: 'Nakit', tip: 'GİRİŞ', tutar: 250 },
              ].map((r, i) => (
                <tr key={i} style={{ background: i % 2 ? '#f8fafc' : '#ffffff' }}>
                  <td style={{ padding: 8 }}>{r.tarih}</td>
                  <td style={{ padding: 8 }}>{r.evrak || ''}</td>
                  <td style={{ padding: 8 }}>{r.ack}</td>
                  <td style={{ padding: 8 }}>{r.durum}</td>
                  <td style={{ padding: 8 }}>{r.sekil}</td>
                  <td style={{ padding: 8 }}>{r.tip}</td>
                  <td style={{ padding: 8, textAlign: 'right' }}>{r.tutar.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'grid', gap: 6, width: 340, marginLeft: 'auto', marginTop: 10 }}>
            <div style={{ background: '#94a3b8', color: '#fff', padding: 8, display: 'flex', justifyContent: 'space-between' }}>
              <strong>Toplam Giriş:</strong>
              <span>350,00</span>
            </div>
            <div style={{ background: '#94a3b8', color: '#fff', padding: 8, display: 'flex', justifyContent: 'space-between' }}>
              <strong>Toplam Çıkış:</strong>
              <span>52.000,00</span>
            </div>
            <div style={{ background: '#cbd5e1', padding: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Rapor Toplam Giriş:</span>
              <span>350,00</span>
            </div>
            <div style={{ background: '#cbd5e1', padding: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Rapor Toplam Çıkış:</span>
              <span>52.000,00</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


