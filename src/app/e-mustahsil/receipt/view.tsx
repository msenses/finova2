'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Account = { id: string; name: string; address?: string | null; tax_id?: string | null; district?: string | null; city?: string | null; phone?: string | null; email?: string | null };

export default function EMustahsilReceiptClientPage() {
  const router = useRouter();
  const search = useSearchParams();
  const accountId = typeof window === 'undefined' ? '' : (new URLSearchParams(window.location.search).get('account') ?? '');

  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) {
        router.replace('/login');
        return;
      }
      if (accountId) {
        const { data } = await supabase.from('accounts').select('id, name, address, tax_id, phone, email').eq('id', accountId).single();
        setAccount((data as any) ?? null);
      }
      setReady(true);
    };
    init();
  }, [router, accountId]);

  if (!ready) {
    return <main style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', color: 'white' }}>Yükleniyor…</main>;
  }

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const timeStr = today.toTimeString().slice(0, 5);

  return (
    <main style={{ minHeight: '100dvh', color: '#111827', background: '#f3f4f6' }}>
      {/* Üst araç çubuğu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
        <button style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #22c55e', background: '#22c55e', color: '#fff' }}>✉ Email Gönder</button>
        <input placeholder="mail@mail.com" defaultValue={account?.email ?? ''} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #d1d5db', width: 260 }} />
      </div>

      <section style={{ padding: 18 }}>
        <div style={{ textAlign: 'center', fontWeight: 800, color: '#0b5fa4' }}>MAKBUZ RAPORU</div>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>Firma : TEST BİLSOFT</div>

        <div style={{ border: '1px solid #cfd4dc', borderRadius: 6, background: '#fff', overflow: 'hidden' }}>
          {/* Cari ve işlem bilgileri */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: 10, borderBottom: '1px solid #e5e7eb' }}>
            <div>
              <div style={{ fontWeight: 700, textDecoration: 'underline', marginBottom: 6 }}>CARİ BİLGİLERİ</div>
              <div>{account?.name ?? 'Mehmet Bey'}</div>
              <div>Ahmet Bey</div>
              <div>{account?.address ?? 'Merkez'}</div>
              <div>Merkez / Duzce</div>
            </div>
            <div>
              <div style={{ display: 'grid', gap: 4 }}>
                <div><strong>İşlem Tarihi :</strong> {dateStr}</div>
                <div><strong>İşlem Saati :</strong> {timeStr}</div>
              </div>
            </div>
          </div>

          {/* Ürün tablosu */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e5e7eb' }}>
                <th style={{ padding: 6, textAlign: 'left' }}>Stok Adı</th>
                <th style={{ padding: 6, textAlign: 'right' }}>Miktar</th>
                <th style={{ padding: 6, textAlign: 'right' }}>Br. Fiyat</th>
                <th style={{ padding: 6, textAlign: 'right' }}>Toplam</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 6 }}>Patates</td>
                <td style={{ padding: 6, textAlign: 'right' }}>1.0</td>
                <td style={{ padding: 6, textAlign: 'right' }}>$100,00</td>
                <td style={{ padding: 6, textAlign: 'right' }}>$100,00</td>
              </tr>
            </tbody>
          </table>

          {/* Alt özet panelleri */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 10 }}>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['MÜSTAHSİL', ''],
                    ['ÖNCEKİ BAKİYENİZ', '$99,425.00 ?'],
                    ['KESİNTİ', '$90.00 ?'],
                    ['SON BAKİYENİZ', '$99,515.00 ?'],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderTop: '1px solid #eef2f7' }}>
                      <td style={{ padding: 6 }}>{k}</td>
                      <td style={{ padding: 6, textAlign: 'right' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['Toplam', '$100,00 ?'],
                    ['Ara Toplam', '__'],
                    ['Kdv', '$0,00 ?'],
                    ['Ötv', '$0,00 ?'],
                    ['Genel Toplam', '$90,00 ?'],
                  ].map(([k, v]) => (
                    <tr key={k} style={{ borderTop: '1px solid #eef2f7' }}>
                      <td style={{ padding: 6 }}>{k} :</td>
                      <td style={{ padding: 6, textAlign: 'right' }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


